# Astro Streaming Sample

MP4動画をアップロードしてHLS形式に自動変換し、ストリーミング配信するWebアプリケーションです。BullMQとRedisを使用した非同期ジョブキュー処理により、動画変換をバックグラウンドで実行します。

## プロジェクト構成

```
astro-streaming-sample/
├── src/                    # Webアプリ（Producer）
│   ├── pages/              # Astro pages（UI & API）
│   │   ├── api/
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
│   └── types.ts            # 型定義
├── worker/                 # Workerプロジェクト（Consumer）
│   ├── src/
│   │   ├── index.ts        # Worker実装
│   │   ├── config.ts       # Redis接続設定（コピー）
│   │   └── types.ts        # 型定義（コピー）
│   ├── package.json        # Worker専用依存関係
│   ├── tsconfig.json
│   └── .env.example
├── public/
├── data/
│   ├── original/           # アップロードされた元動画
│   └── hls/                # HLS変換後の動画ファイル
├── package.json            # Webアプリ依存関係
├── tsconfig.json
└── README.md
```

## 技術スタック

- **Webフレームワーク**: Astro + React
- **スタイリング**: TailwindCSS v4 + Flowbite
- **動画配信**: HLS.js
- **ジョブキュー**: BullMQ + Redis
- **動画変換**: FFmpeg
- **型安全性**: TypeScript

## アーキテクチャ

### Producer/Consumer パターン（分離プロジェクト）

```
1. ユーザーが動画をアップロード
   ↓
2. Producer (Astro API) がファイルを保存し、Redisキューにジョブを追加
   ↓
3. Consumer (worker/src/index.ts) がジョブを取得
   ↓
4. ConsumerがFFmpegを実行してHLS変換
   ↓
5. 変換完了後、ジョブを完了状態に更新
   ↓
6. Webアプリで動画一覧に表示され、視聴可能に
```

**プロジェクト分離のメリット:**
- Webアプリ（Producer）とWorker（Consumer）を別々にデプロイ可能
- Workerだけを複数インスタンス起動して処理能力を向上
- 各プロジェクトに必要な依存関係のみをインストール
- 独立した開発・テスト・デプロイ

## 必要要件

- **Node.js**: v18.14.1以上
- **pnpm**: v10.4.1以上
- **FFmpeg**: Worker実行環境にインストール必須
- **Redis**: ジョブキュー用（別途起動が必要）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone [リポジトリURL]
cd astro-streaming-sample
```

### 2. Webアプリのセットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
```

`.env`ファイルの内容：

```env
# データディレクトリ
DATA_DIR=./data

# Redis接続（動画処理キュー用）
VIDEO_QUEUE_REDIS_URL=redis://localhost:6379/1
```

### 3. Workerのセットアップ

```bash
# Workerディレクトリへ移動
cd worker

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
```

`worker/.env`ファイルの内容：

```env
# Redis接続（動画処理キュー用）
VIDEO_QUEUE_REDIS_URL=redis://localhost:6379/1

# データディレクトリ（相対パス）
DATA_DIR=../data
```

### 4. Redisの起動

```bash
# Dockerを使用する場合
docker run -d --name redis -p 6379:6379 redis:7-alpine

# または、ローカルにインストールされたRedisを起動
redis-server
```

### 5. FFmpegのインストール

Worker実行環境にFFmpegが必要です：

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

3つのターミナルを開いて、それぞれ以下を実行：

```bash
# ターミナル1: Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# ターミナル2: Webアプリケーション（Producer）
pnpm dev

# ターミナル3: Worker（Consumer）
cd worker
pnpm dev
```

ブラウザでアクセス：http://localhost:3000

## ビルド＆本番実行

### Webアプリ

```bash
# ビルド
pnpm build

# 本番実行
pnpm start
```

### Worker

```bash
cd worker

# 本番実行（ビルド不要）
pnpm start
```

## スクリプト

### Webアプリ（ルート）

- `pnpm dev` - 開発サーバー起動
- `pnpm build` - 本番用ビルド
- `pnpm start` - 本番サーバー起動
- `pnpm format` - コードフォーマット
- `pnpm lint` - ESLintでコード検証

### Worker（worker/）

- `pnpm dev` - Worker起動（開発モード・watch有効）
- `pnpm start` - Worker起動（本番モード）

## デプロイ

### 個別デプロイ（推奨）

WebアプリとWorkerを別々のサーバーまたはコンテナにデプロイできます：

**Webアプリ:**
```bash
pnpm install --prod
pnpm build
pnpm start
```

**Worker:**
```bash
cd worker
pnpm install --prod
pnpm start
```

### 同一サーバーへのデプロイ

プロセス管理にPM2を使用：

```bash
# PM2をインストール
npm install -g pm2

# Webアプリ起動
pm2 start pnpm --name "astro-web" -- start

# Worker起動
pm2 start pnpm --name "astro-worker" --cwd worker -- start

# 自動起動設定
pm2 save
pm2 startup
```

### Workerのスケーリング

複数のWorkerインスタンスを起動して処理能力を向上：

```bash
# Worker1
pm2 start pnpm --name "astro-worker-1" --cwd worker -- start

# Worker2
pm2 start pnpm --name "astro-worker-2" --cwd worker -- start

# Worker3
pm2 start pnpm --name "astro-worker-3" --cwd worker -- start
```

## 環境構築の分離

このプロジェクトはアプリケーションコードのみを提供します。以下は別リポジトリまたは別の方法で管理してください：

- Docker/Docker Compose設定（インフラ構築用）
- Redis、データベース等のインフラ構成
- リバースプロキシ（Nginx等）の設定
- SSL証明書の管理

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

1. Workerが起動しているか確認
2. FFmpegがインストールされているか確認：
   ```bash
   ffmpeg -version
   ```

3. Workerのログを確認して、エラーメッセージを確認

### データディレクトリのパス問題

- Webアプリ: `./data`（プロジェクトルートから）
- Worker: `../data`（workerディレクトリから見て上の階層）

環境変数`DATA_DIR`で調整可能です。

## ライセンス

MIT License
