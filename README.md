# Astro動画配信サンプル

MP4動画をアップロードしてHLS形式に自動変換し、ストリーミング配信するWebアプリケーションです。BullMQとRedisを使用した非同期ジョブキュー処理により、動画変換をバックグラウンドで実行します。

![Streaming Screenshot](https://github.com/user-attachments/assets/eb3aea02-dcbb-4622-a4d7-018d7547fc0b)

## 環境構築について

このプロジェクトは、以下の環境構築リポジトリ上で実行されることを想定して開発されています：

**🔧 [docker-nodejs-streaming-staging-env](https://github.com/czbone/docker-nodejs-streaming-staging-env)**

上記リポジトリでは、Vagrant + Ansible + Docker を使用して、本アプリケーションの実行に必要な以下の環境を自動構築します：

- Node.js (v24.0.0) コンテナ
- Nginx (1.28.1) コンテナ（リバースプロキシ・HLS配信）
- FFmpeg (8.0.1) コンテナ（動画変換）
- Redis (7.4.2) コンテナ（ジョブキュー）
- Certbot (オプション・SSL証明書取得）

詳細な環境構築手順は、上記リポジトリのREADMEをご参照ください。

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
```

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

## 環境構築の分離

このプロジェクトはアプリケーションコードのみを提供します。インフラ環境の構築には、以下の専用リポジトリを使用してください：

### 推奨環境構築リポジトリ

**[docker-nodejs-streaming-staging-env](https://github.com/czbone/docker-nodejs-streaming-staging-env)**

このリポジトリでは、Vagrant + Ansible + Docker を使用して、本アプリケーションの実行に必要な完全な環境を自動構築します。

**提供される機能：**
- ✅ Docker環境の自動セットアップ
- ✅ Redis、Nginx、FFmpeg、Certbot等の各種コンテナの構築
- ✅ 本アプリケーションの自動デプロイ
- ✅ HLS配信用のNginx設定
- ✅ SSL証明書の自動取得（Let's Encrypt）

**手動で環境を構築する場合：**

以下のコンポーネントを別途用意する必要があります：
- Docker/Docker Compose設定（インフラ構築用）
- Redis（ジョブキュー用）
- Nginx（リバースプロキシ・HLS配信用）
- FFmpeg（動画変換用）
- SSL証明書の管理

## ライセンス

MIT License
