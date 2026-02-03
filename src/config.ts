//import 'dotenv/config'
import Redis from 'ioredis'

/**
 * Redis接続設定（動画処理用）
 * 
 * VIDEO_QUEUE_REDIS_URLがある場合はそれを使用、なければhost/port個別指定
 */
const redisUrl = process.env.VIDEO_QUEUE_REDIS_URL
console.log('redisUrl', redisUrl)

export const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
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
