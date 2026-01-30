import { videoQueue } from '@nexstream/shared'
import type { APIRoute } from 'astro'
import fs from 'node:fs/promises'
import path from 'node:path'

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 })
    }

    const videoId = Date.now().toString()
    const originalName = file.name
    const extension = path.extname(originalName)
    const originalFileName = `${videoId}${extension}`
    const hlsDirName = videoId

    // 保存先ディレクトリ（モノレポのルートからの相対パス）
    const dataDir = path.join(process.cwd(), '..', '..', 'data')
    const originalDir = path.join(dataDir, 'original')
    const hlsBaseDir = path.join(dataDir, 'hls')
    const hlsOutputDir = path.join(hlsBaseDir, hlsDirName)

    await fs.mkdir(originalDir, { recursive: true })
    await fs.mkdir(hlsOutputDir, { recursive: true })

    // 元ファイルを保存
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const originalPath = path.join(originalDir, originalFileName)
    await fs.writeFile(originalPath, buffer)

    // Redisキューにジョブを追加
    try {
      const job = await videoQueue.add(
        'convert-to-hls',
        {
          videoId,
          originalFileName,
          hlsDirName,
          originalPath,
          hlsOutputDir
        },
        {
          jobId: videoId // ジョブIDを指定して後で状態確認できるように
        }
      )

      return new Response(
        JSON.stringify({
          message: 'Upload successful, conversion started',
          videoId,
          jobId: job.id
        }),
        { status: 200 }
      )
    } catch (error) {
      console.error('Queue error:', error)
      return new Response(
        JSON.stringify({
          message: 'File uploaded, but failed to queue conversion job.',
          videoId
        }),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
