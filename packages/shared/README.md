# @nexstream/shared

NexStreamモノレポの共有ライブラリパッケージ

## 概要

このパッケージは、WebアプリケーションとWorkerプロセス間で共有される以下の機能を提供します：

- **Redis接続**: ioredisを使用したRedis接続管理
- **BullMQキュー**: 動画処理ジョブキューの定義
- **型定義**: TypeScript型定義（VideoJobData等）

## インストール

このパッケージは内部パッケージのため、pnpm workspaceを通じて自動的にリンクされます。

```bash
# ルートディレクトリで実行
pnpm install
```

## ビルド

```bash
# sharedパッケージをビルド
pnpm build

# または、ルートから
pnpm build:shared
```

## 使用方法

### 他のパッケージからのインポート

```typescript
// WebアプリやWorkerから使用
import { redis, videoQueue, type VideoJobData } from '@nexstream/shared'

// ジョブを追加
await videoQueue.add('convert-to-hls', {
  videoId: '123',
  originalFileName: 'video.mp4',
  hlsDirName: '123',
  originalPath: '/data/original/123.mp4',
  hlsOutputDir: '/data/hls/123'
})
```

## 環境変数

`.env.example`を参照して`.env`ファイルを作成してください。

- `VIDEO_QUEUE_REDIS_URL`: Redis接続URL（例: redis://localhost:6379/1）
- または `REDIS_HOST` と `REDIS_PORT` を個別に指定

## エクスポート

### redis
Redis接続インスタンス（ioredis）

### videoQueue
BullMQキューインスタンス

### VideoJobData
動画変換ジョブのデータ型

### JobStatusResponse
ジョブ状態レスポンスの型
