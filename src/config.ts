import 'dotenv/config'
import Redis from 'ioredis'

/**
 * Redis接続設定（動画処理用）
 * 
 * VIDEO_QUEUE_REDIS_URLを使用して接続
 */
const redisUrl = process.env.VIDEO_QUEUE_REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})

// 接続エラーハンドリング
redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err)
})

redis.on('connect', () => {
  console.log('[Redis] Connected successfully')
})

redis.on('ready', () => {
  console.log('[Redis] Ready to accept commands')
})
