# Astro Streaming Sample

MP4動画をアップロードしてHLS形式に自動変換し、ストリーミング配信するWebアプリケーションです。BullMQとRedisを使用した非同期ジョブキュー処理により、動画変換をバックグラウンドで実行します。

## プロジェクト構成

```
astro-streaming-sample/
├── src/
│   ├── pages/              # Astro pages（UI & API）
│   │   ├── api/            # APIエンドポイント
│   │   │   ├── upload.ts      # 動画アップロード（Producer）
│   │   │   └── job-status.ts  # ジョブ状態確認
│   │   ├── index.astro     # トップページ
│   │   ├── upload.astro    # アップロードページ
│   │   └── watch/          # 動画視聴ページ
│   ├── components/         # React components
│   │   └── HlsPlayer.tsx   # HLS動画プレイヤー
│   ├── layouts/            # Astro layouts
│   ├── styles/             # CSS
│   ├── config.ts           # Redis接続設定
│   ├── queue/
│   │   └── video.ts        # BullMQキュー定義
│   ├── types.ts            # 型定義
│   └── consumer.ts         # Workerプロセス（Consumer）
├── public/
├── data/
│   ├── original/           # アップロードされた元動画
│   └── hls/                # HLS変換後の動画ファイル
├── package.json
├── tsconfig.json
├── astro.config.mjs
└── .env.example
```

## 技術スタック

- **Webフレームワーク**: Astro + React
- **スタイリング**: TailwindCSS v4 + Flowbite
- **動画配信**: HLS.js
- **ジョブキュー**: BullMQ + Redis
- **動画変換**: FFmpeg
- **型安全性**: TypeScript

## アーキテクチャ

### Producer/Consumer パターン

```
1. ユーザーが動画をアップロード
   ↓
2. Producer (Astro API) がファイルを保存し、Redisキューにジョブを追加
   ↓
3. Consumer (src/consumer.ts) がジョブを取得
   ↓
4. ConsumerがFFmpegを実行してHLS変換
   ↓
5. 変換完了後、ジョブを完了状態に更新
   ↓
6. Webアプリで動画一覧に表示され、視聴可能に
```

## 必要要件

- **Node.js**: v18.14.1以上
- **pnpm**: v10.4.1以上
- **FFmpeg**: Consumer実行環境にインストール必須
- **Redis**: ジョブキュー用（別途起動が必要）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone [リポジトリURL]
cd astro-streaming-sample
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env.example`を`.env`にコピーして編集：

```bash
cp .env.example .env
```

`.env`ファイルの内容：

```env
# データディレクトリ（Docker環境では /data を指定）
DATA_DIR=./data

# Redis接続（動画処理キュー用）
VIDEO_QUEUE_REDIS_URL=redis://localhost:6379/1
```

### 4. Redisの起動

```bash
# Dockerを使用する場合
docker run -d --name redis -p 6379:6379 redis:7-alpine

# または、ローカルにインストールされたRedisを起動
redis-server
```

### 5. FFmpegのインストール

Consumer（動画変換ワーカー）を実行する環境にFFmpegが必要です：

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install -y ffmpeg

# Windows
# https://ffmpeg.org/download.html からダウンロード
```

## 開発方法

### ローカル開発

2つのターミナルを開いて、それぞれ以下を実行：

```bash
# ターミナル1: Webアプリケーション（Producer）
pnpm dev

# ターミナル2: Consumer（動画変換ワーカー）
pnpm dev:consumer
```

ブラウザでアクセス：http://localhost:3000

## ビルド＆本番実行

```bash
# ビルド
pnpm build

# 本番実行（2つのプロセスを起動）
pnpm start            # Webアプリケーション（ポート3000）
pnpm start:consumer   # Consumer（別プロセス）
```

## スクリプト

- `pnpm dev` - 開発サーバー起動（Webアプリ）
- `pnpm dev:consumer` - Consumer起動（開発モード・watch有効）
- `pnpm build` - 本番用ビルド
- `pnpm start` - 本番サーバー起動（Webアプリ）
- `pnpm start:consumer` - Consumer起動（本番モード）
- `pnpm format` - コードフォーマット
- `pnpm lint` - ESLintでコード検証

## 環境構築の分離

このプロジェクトはアプリケーションコードのみを提供します。以下は別リポジトリまたは別の方法で管理してください：

- Docker/Docker Compose設定
- Redis、データベース等のインフラ構成
- リバースプロキシ（Nginx等）の設定
- SSL証明書の管理

## デプロイ例

### Node.js環境へのデプロイ

1. Redis、FFmpegが利用可能な環境を準備
2. 本番用の`.env`ファイルを設定
3. ビルドと起動：

```bash
pnpm install --prod
pnpm build
pnpm start &           # バックグラウンドで起動
pnpm start:consumer &  # バックグラウンドで起動
```

### プロセス管理

本番環境では PM2 などのプロセスマネージャーの使用を推奨：

```bash
npm install -g pm2

# Webアプリ起動
pm2 start pnpm --name "astro-web" -- start

# Consumer起動
pm2 start pnpm --name "astro-consumer" -- start:consumer

# 自動起動設定
pm2 save
pm2 startup
```

## トラブルシューティング

### Redisに接続できない

1. Redisが起動しているか確認：
   ```bash
   docker ps | grep redis
   ```

2. `.env`ファイルの`VIDEO_QUEUE_REDIS_URL`を確認

3. Redisの再起動：
   ```bash
   docker restart redis
   ```

### 動画が変換されない

1. Consumerが起動しているか確認
2. FFmpegがインストールされているか確認：
   ```bash
   ffmpeg -version
   ```

3. Consumerのログを確認して、エラーメッセージを確認

### pnpm installがエラーになる

```bash
# pnpmをアップデート
npm install -g pnpm@latest

# node_modulesを削除して再インストール
rm -rf node_modules
pnpm install
```

## ライセンス

MIT License
