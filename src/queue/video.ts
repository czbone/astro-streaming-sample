import { Queue, QueueEvents } from 'bullmq'
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

// QueueEventsを使用して、異なるプロセス間のイベントを監視
const queueEvents = new QueueEvents('video-processing', {
  connection: redis
})

// キューのイベントハンドリング
videoQueue.on('error', (err) => {
  console.error('[Queue] Error:', err)
})

videoQueue.on('waiting', (job) => {
  console.log(`[Queue] Job ${job.id} is waiting`)
})

// QueueEventsを使用してワーカー側のイベントを監視
queueEvents.on('active', ({ jobId }) => {
  console.log(`[Queue] Job ${jobId} is now active (processing started)`)
})

queueEvents.on('completed', ({ jobId }) => {
  console.log(`[Queue] Job ${jobId} has completed successfully`)
})

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[Queue] Job ${jobId} has failed:`, failedReason)
})

queueEvents.on('progress', ({ jobId, data }) => {
  console.log(`[Queue] Job ${jobId} progress:`, data)
})

console.log('[Queue] Video processing queue initialized')
