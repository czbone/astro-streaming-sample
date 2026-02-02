import { Queue } from 'bullmq'
import { redis } from '../config'
import type { VideoJobData } from '../types'

/**
 * BullMQキュー（動画処理用）
 * 
 * Webアプリケーションはこのキューにジョブを追加し、
 * ワーカープロセスがこのキューからジョブを取得して処理します。
 */
export const videoQueue = new Queue<VideoJobData>('video-processing', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // 失敗時3回まで再試行
    backoff: {
      type: 'exponential',
      delay: 5000 // 5秒から指数的に増加
    },
    removeOnComplete: false, // 完了後もジョブ情報を保持
    removeOnFail: false // 失敗後もジョブ情報を保持
  }
})

// キューのイベントハンドリング
videoQueue.on('error', (err) => {
  console.error('[Queue] Error:', err)
})

videoQueue.on('waiting', (job) => {
  console.log(`[Queue] Job ${job.jobId} is waiting`)
})

console.log('[Queue] Video processing queue initialized')
