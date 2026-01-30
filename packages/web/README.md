# @nexstream/web

NexStreamモノレポのWebアプリケーション

## 概要

Astro、React、TailwindCSS、Flowbiteで構築された動画共有プラットフォームのフロントエンド。
動画アップロード、一覧表示、HLSストリーミング再生機能を提供します。

## 機能

- 📤 **動画アップロード**: MP4形式の動画ファイルをドラッグ&ドロップでアップロード
- 🔄 **自動HLS変換**: アップロード後、バックグラウンドでHLS形式に変換
- 📺 **動画一覧**: アップロードされた動画の一覧表示（変換中のステータス表示付き）
- 🎬 **動画視聴**: HLS.jsを使用した高品質なストリーミング再生
- 🎨 **モダンUI**: TailwindCSS v4とFlowbiteによる美しいデザイン

## 技術スタック

- [Astro](https://astro.build/) v5.16.15 - SSRフレームワーク
- [React](https://react.dev/) v19 - UIコンポーネント
- [TailwindCSS](https://tailwindcss.com/) v4 - CSSフレームワーク
- [Flowbite](https://flowbite.com/) v4 - UIコンポーネントライブラリ
- [hls.js](https://github.com/video-dev/hls.js/) - HLS再生ライブラリ
- [@nexstream/shared](../shared) - 共有ライブラリ（Redis、BullMQ、型定義）

## ディレクトリ構造

```
packages/web/
├── src/
│   ├── components/        # Reactコンポーネント
│   │   └── HlsPlayer.tsx  # HLS動画プレイヤー
│   ├── layouts/           # Astroレイアウト
│   │   └── Layout.astro   # 共通レイアウト
│   ├── pages/             # ページコンポーネント（ファイルベースルーティング）
│   │   ├── index.astro    # 動画一覧ページ
│   │   ├── upload.astro   # 動画アップロードページ
│   │   ├── watch/         # 動画視聴ページ
│   │   │   └── [id].astro
│   │   └── api/           # APIエンドポイント
│   │       ├── upload.ts  # 動画アップロードAPI
│   │       └── job-status.ts # ジョブ状態確認API
│   └── styles/            # グローバルスタイル
│       └── global.css
├── public/                # 静的アセット
│   └── favicon.svg
├── astro.config.mjs       # Astro設定
├── tsconfig.json          # TypeScript設定
├── package.json
├── Dockerfile
└── .env.example
```

## 開発

### 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# データディレクトリ（Docker環境では /data を指定）
DATA_DIR=/data

# Redis接続（動画処理キュー用）
VIDEO_QUEUE_REDIS_URL=redis://localhost:6379/1
```

### 開発サーバーの起動

```bash
# webディレクトリで実行
pnpm dev

# または、ルートから
pnpm dev:web
```

開発サーバーが http://localhost:3000 で起動します。

### ビルド

```bash
pnpm build
```

### プレビュー

```bash
pnpm preview
```

### 本番サーバーの起動

```bash
pnpm start
```

## APIエンドポイント

### POST /api/upload

動画ファイルをアップロードし、変換ジョブをキューに追加します。

**リクエスト**:
- Content-Type: `multipart/form-data`
- Body: `video` (ファイル)

**レスポンス**:
```json
{
  "message": "Upload successful, conversion started",
  "videoId": "1738126800000",
  "jobId": "1738126800000"
}
```

### GET /api/job-status?jobId={id}

ジョブの状態を確認します。

**レスポンス**:
```json
{
  "jobId": "1738126800000",
  "state": "completed",
  "progress": 100,
  "data": {
    "videoId": "1738126800000",
    "originalFileName": "1738126800000.mp4",
    "hlsDirName": "1738126800000",
    "originalPath": "/data/original/1738126800000.mp4",
    "hlsOutputDir": "/data/hls/1738126800000"
  }
}
```

## ページ

### / (ホーム)
動画一覧を表示。変換中の動画は「変換中」バッジ付きで表示されます。

### /upload
動画アップロードページ。ドラッグ&ドロップまたはファイル選択でMP4動画をアップロードできます。

### /watch/[id]
動画視聴ページ。HLS.jsを使用してストリーミング再生します。

## コンポーネント

### HlsPlayer
HLS動画プレイヤーコンポーネント。hls.jsを使用してHLSストリーミングを再生します。

```tsx
<HlsPlayer client:load src="/hls/123456/index.m3u8" />
```

## Docker

### ビルド

```bash
# ルートディレクトリから
docker build -f packages/web/Dockerfile -t nexstream-web .
```

### 実行

```bash
docker run -d \
  -p 3000:3000 \
  -e DATA_DIR=/data \
  -e VIDEO_QUEUE_REDIS_URL=redis://redis:6379/1 \
  -v $(pwd)/data:/data \
  nexstream-web
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `DATA_DIR` | データディレクトリのパス（Docker環境では `/data`） | `../../data`（相対パス） |
| `VIDEO_QUEUE_REDIS_URL` | Redis接続URL | `redis://localhost:6379/1` |
| `NODE_ENV` | 実行環境 | `development` |

## トラブルシューティング

### Redisに接続できない

`.env`ファイルの`VIDEO_QUEUE_REDIS_URL`を確認してください。

### 動画が表示されない

1. 動画ファイルが`/data/hls/`（Docker環境）または`data/hls/`（ローカル環境）ディレクトリに存在するか確認
2. Workerが正常に動作しているか確認
3. ブラウザのコンソールでエラーを確認

### HLS再生がうまくいかない

1. ブラウザがHLS.jsをサポートしているか確認
2. `/data/hls/[id]/index.m3u8`（Docker環境）または`data/hls/[id]/index.m3u8`（ローカル環境）ファイルが存在するか確認
3. Nginxなどのリバースプロキシが正しく設定されているか確認（本番環境）
