import type { APIRoute } from 'astro'
import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

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

    // 保存先ディレクトリ
    const originalDir = path.join(process.cwd(), 'data', 'original')
    const hlsBaseDir = path.join(process.cwd(), 'data', 'hls')
    const hlsOutputDir = path.join(hlsBaseDir, hlsDirName)

    await fs.mkdir(originalDir, { recursive: true })
    await fs.mkdir(hlsOutputDir, { recursive: true })

    // 元ファイルを保存
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const originalPath = path.join(originalDir, originalFileName)
    await fs.writeFile(originalPath, buffer)

    // FFmpegコンテナで変換実行
    // docker-compose.yml で定義した container_name: ffmpeg-worker を指定
    const ffmpegCommand = `docker exec ffmpeg-worker ffmpeg -i /data/original/${originalFileName} -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls /data/hls/${hlsDirName}/index.m3u8`

    // 非同期で変換を開始（レスポンスを待たせない場合は await しないが、今回は「すぐ変換」とのことなので待つか、バックグラウンドにするか）
    // ユーザーは「すぐ変換する」と言っているので、ここでは実行を開始する
    try {
      await execPromise(ffmpegCommand)
    } catch (error) {
      console.error('FFmpeg error:', error)
      // コンテナ名が異なる可能性や、環境が整っていない場合のエラー
      return new Response(JSON.stringify({ 
        message: 'File uploaded, but conversion failed. Make sure Docker environment is running.',
        videoId 
      }), { status: 500 })
    }

    return new Response(JSON.stringify({ 
      message: 'Upload and conversion successful',
      videoId 
    }), { status: 200 })

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
