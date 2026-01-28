import { Queue } from 'bullmq'
import { redis } from './redis'

// ジョブデータの型定義
export interface VideoJobData {
  videoId: string
  originalFileName: string
  hlsDirName: string
  originalPath: string
  hlsOutputDir: string
}

// BullMQキューの作成
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
  console.error('Queue error:', err)
})
