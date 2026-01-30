# @nexstream/worker

NexStreamモノレポの動画変換ワーカープロセス

## 概要

このパッケージは、BullMQを使用して動画変換ジョブを処理するワーカープロセスです。
Redisキューからジョブを取得し、FFmpegを使用してMP4動画をHLS形式に変換します。

## 機能

- **ジョブキュー処理**: BullMQワーカーとしてRedisキューからジョブを取得
- **動画変換**: FFmpegを使用してMP4をHLS形式に変換
- **進捗管理**: ジョブの進捗状況を追跡・更新
- **自動リトライ**: 失敗時は最大3回まで自動再試行（指数バックオフ）
- **Graceful Shutdown**: SIGTERM/SIGINTシグナルで安全に終了

## 必要要件

### ローカル開発環境
- Node.js v18.14.1以上
- pnpm v10.4.1以上
- FFmpeg（システムにインストール済み）
- Redis（ローカルまたはDocker）

### 本番環境（Docker）
- FFmpegがインストールされたDockerコンテナで実行
- Redisコンテナへのネットワークアクセス

## 開発

### 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

### ワーカーの起動

```bash
# 開発モード（ファイル変更を監視）
pnpm dev

# 本番モード
pnpm start

# または、ルートから
pnpm dev:worker
```

### ビルド

```bash
pnpm build
```

## Docker環境での実行

本番環境では、このワーカーはFFmpegがインストールされたDockerコンテナ内で実行されます。

### Dockerfile

Dockerfileは `packages/worker/Dockerfile` に配置されています。

### 環境変数

コンテナ実行時に以下の環境変数を設定：

- `VIDEO_QUEUE_REDIS_URL`: Redis接続URL（例: redis://redis:6379/1）

## 処理フロー

1. **ジョブ受信**: Redisキューから動画変換ジョブを取得
2. **進捗更新**: ジョブの進捗を10%に更新
3. **FFmpeg実行**: MP4動画をHLS形式に変換
4. **進捗更新**: ジョブの進捗を100%に更新
5. **完了通知**: ジョブを完了状態に設定

## ログ

ワーカーは以下のイベントをログに出力します：

- `🚀 Video processing worker started`: ワーカー起動時
- `🔄 Job ${id} is now active`: ジョブ処理開始時
- `✅ Job ${id} completed successfully`: ジョブ完了時
- `❌ Job ${id} failed`: ジョブ失敗時
- `⚠️ Worker error`: ワーカーエラー発生時

## トラブルシューティング

### FFmpegが見つからない

ローカル開発環境でFFmpegがインストールされていない場合：

```bash
# macOS (Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg
```

### Redisに接続できない

`.env`ファイルの`VIDEO_QUEUE_REDIS_URL`を確認してください。

### ジョブが処理されない

1. Redisサーバーが起動しているか確認
2. Webアプリが正しくジョブをキューに追加しているか確認
3. ワーカーのログを確認してエラーメッセージをチェック
