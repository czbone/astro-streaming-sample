import { Job, Worker } from 'bullmq'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { VideoJobData } from '../lib/queue'
import { redis } from '../lib/redis'

const execPromise = promisify(exec)

// BullMQワーカーの作成
const worker = new Worker<VideoJobData>(
  'video-processing',
  async (job: Job<VideoJobData>) => {
    const { videoId, originalFileName, hlsDirName, originalPath, hlsOutputDir } = job.data

    console.log(`[Worker] Starting conversion for video ${videoId}`)

    // 進捗を更新
    await job.updateProgress(10)

    try {
      // FFmpegを直接実行
      // このワーカーはFFmpegコンテナ内で実行されます
      const ffmpegCommand = `ffmpeg -i "${originalPath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${hlsOutputDir}/index.m3u8"`

      console.log(`[Worker] Executing FFmpeg command for video ${videoId}`)
      await job.updateProgress(30)

      const { stdout, stderr } = await execPromise(ffmpegCommand)

      if (stdout) console.log(`[Worker] FFmpeg stdout:`, stdout)
      if (stderr) console.log(`[Worker] FFmpeg stderr:`, stderr)

      await job.updateProgress(100)

      console.log(`[Worker] Conversion completed successfully for video ${videoId}`)

      return {
        success: true,
        videoId,
        message: 'Conversion completed successfully'
      }
    } catch (error) {
      console.error(`[Worker] FFmpeg error for video ${videoId}:`, error)
      throw error // BullMQが自動的にリトライする
    }
  },
  {
    connection: redis,
    concurrency: 1 // 同時に1つのジョブのみ処理
  }
)

// イベントリスナー
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('⚠️ Worker error:', err)
})

worker.on('active', (job) => {
  console.log(`🔄 Job ${job.id} is now active`)
})

console.log('🚀 Video processing worker started and waiting for jobs...')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...')
  await worker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...')
  await worker.close()
  process.exit(0)
})
