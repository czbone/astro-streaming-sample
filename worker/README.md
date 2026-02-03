# Astro Streaming Worker

動画変換を行うWorkerプロジェクトです。BullMQを使用してRedisキューからジョブを取得し、FFmpegでMP4動画をHLS形式に変換します。

## 概要

このWorkerは、Webアプリケーション（Producer）から送信された動画変換ジョブを処理します。

## ディレクトリ構成

```
worker/
├── src/
│   ├── index.ts      # Worker実装（Consumer）
│   ├── config.ts     # Redis接続設定
│   └── types.ts      # 型定義
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 必要要件

- **Node.js**: v18.14.1以上
- **pnpm**: v10.4.1以上
- **FFmpeg**: 動画変換に必須
- **Redis**: ジョブキュー（別途起動が必要）

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして編集：

```bash
cp .env.example .env
```

`.env`ファイルの内容：

```env
# Redis接続（動画処理キュー用）
VIDEO_QUEUE_REDIS_URL=redis://localhost:6379/1
```

### 3. FFmpegのインストール

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install -y ffmpeg

# Windows
# https://ffmpeg.org/download.html からダウンロード
```

確認：
```bash
ffmpeg -version
```

## 実行方法

### 開発モード（Watch有効）

```bash
pnpm dev
```

ファイルの変更を監視して自動的に再起動します。

### 本番モード

```bash
pnpm start
```

## 動作の仕組み

1. Redisキュー `video-processing` を監視
2. ジョブが追加されると自動的に取得
3. FFmpegを実行してMP4をHLS形式に変換
4. 変換完了後、ジョブを完了状態に更新
5. エラー時は自動的にリトライ（最大3回）

## スクリプト

- `pnpm dev` - 開発モード（Watch有効）
- `pnpm start` - 本番モード

## ログ出力

Workerは以下の形式でログを出力します：

```
[Redis] Connected successfully
[Queue] Video processing queue initialized
🚀 Video processing worker started and waiting for jobs...
[Worker] Starting conversion for video 1234567890
[Worker] Executing FFmpeg command for video 1234567890
✅ Job 1234567890 completed successfully
```

## エラーハンドリング

- **接続エラー**: Redisへの接続が失敗した場合、自動的に再接続を試みます
- **変換エラー**: FFmpegの実行が失敗した場合、最大3回まで自動リトライ（指数バックオフ: 5秒、10秒、20秒）
- **Graceful Shutdown**: SIGTERM/SIGINTシグナルを受け取ると、現在のジョブを完了してから終了

## デプロイ

### 単一インスタンス

```bash
pnpm install --prod
pnpm start
```

### 複数インスタンス（スケーリング）

PM2を使用して複数のWorkerを起動：

```bash
# PM2をインストール
npm install -g pm2

# Worker1
pm2 start pnpm --name "worker-1" -- start

# Worker2
pm2 start pnpm --name "worker-2" -- start

# Worker3
pm2 start pnpm --name "worker-3" -- start
```

複数のWorkerが同じRedisキューを監視し、ジョブを分散処理します。

## トラブルシューティング

### Redisに接続できない

1. Redisが起動しているか確認
2. `.env`の`VIDEO_QUEUE_REDIS_URL`を確認
3. ネットワーク接続を確認

### FFmpegが見つからない

```bash
# FFmpegのインストールを確認
which ffmpeg

# パスを確認
echo $PATH
```

### ジョブが処理されない

1. Workerが起動しているか確認
2. Redisキューにジョブが存在するか確認
3. Workerのログを確認

## 技術スタック

- **BullMQ**: ジョブキュー処理
- **ioredis**: Redis接続
- **FFmpeg**: 動画変換
- **tsx**: TypeScript実行環境
- **TypeScript**: 型安全な開発

## ライセンス

MIT License
