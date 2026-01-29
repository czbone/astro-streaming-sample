# NexStream - HLS動画配信システム

NexStreamは、MP4動画をアップロードしてHLS形式に自動変換し、ストリーミング配信するWebアプリケーションです。Astro、React、TailwindCSS、Flowbiteで構築されたモダンな動画共有プラットフォームです。

## 概要

このプロジェクトは、Dockerコンテナベースの動画配信システムのWebアプリケーション部分です。以下の機能を提供します：

- 📤 **動画アップロード**: MP4形式の動画ファイルをアップロード
- 🔄 **自動HLS変換**: FFmpegを使用してHLS形式に自動変換
- 📺 **動画一覧**: アップロードされた動画の一覧表示
- 🎬 **動画視聴**: HLS.jsを使用した高品質なストリーミング再生

## 技術スタック

- [Astro](https://astro.build/) - コンテンツ駆動型Webサイトのためのフレームワーク
- [React](https://react.dev/) - UIコンポーネントライブラリ
- [TailwindCSS v4](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [Flowbite](https://flowbite.com/) - TailwindCSS用UIコンポーネント
- [hls.js](https://github.com/video-dev/hls.js/) - HLSストリーミング再生ライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全性
- [ESLint](https://eslint.org/) - コード品質とスタイルのための静的解析ツール
- [Node.js Adapter](https://docs.astro.build/en/guides/integrations-guide/node/) - サーバーサイドレンダリング（SSR）

## システム構成

このWebアプリケーションは、以下のDockerコンテナと連携して動作します：

- **Node.jsコンテナ**: このWebアプリケーション（Astro SSR、内部ポート3000）
- **FFmpegコンテナ**: 動画のHLS変換処理 + ワーカープロセス実行
- **Nginxコンテナ**: 全体のリバースプロキシおよびHLSファイルの配信（ポート80/443）
- **Redisコンテナ**: ジョブキュー（BullMQ）によるコンテナ間連携

### アーキテクチャ

動画変換処理はRedisをジョブキューとして使用した非同期処理で実現されています：

1. ユーザーが動画をアップロード
2. Node.jsコンテナがファイルを保存し、Redisキューにジョブを追加
3. FFmpegコンテナ内のワーカープロセスがジョブを取得
4. ワーカーがFFmpegを実行してHLS変換を実行
5. 変換完了後、ジョブを完了状態に更新

この方式により、アップロード後すぐにレスポンスが返り、変換はバックグラウンドで実行されます。

## 必要要件

- Node.js v18.14.1以上
- pnpm v10.4.1以上
- Docker & Docker Compose（動画変換機能を使用する場合）
- Redisサーバー（本番環境ではDockerコンテナ、開発環境ではローカルまたはDocker）

## インストール

```bash
# リポジトリをクローン
git clone [リポジトリのURL]

# プロジェクトディレクトリに移動
cd astro-streaming-sample

# 依存関係のインストール
pnpm install
```

## 開発手順

### 開発環境のセットアップ

1. **環境変数の設定**

```bash
# .env.exampleをコピーして.envを作成
cp .env.example .env
```

2. **Redisサーバーの起動**

開発環境ではDockerを使用してRedisを起動するのが最も簡単です：

```bash
# Redisコンテナを起動
docker run -d --name redis -p 6379:6379 redis:latest

# 停止する場合
docker stop redis
docker rm redis
```

### 開発環境（ローカル）

```bash
# 開発サーバーの起動（ポート3000）
pnpm dev

# ワーカープロセスの起動（別ターミナル）
pnpm worker

# または、両方を同時起動
pnpm dev:all

# プロダクションビルド
pnpm build

# ビルドのプレビュー
pnpm preview

# プロダクションサーバーの起動
pnpm start

# コードフォーマット
pnpm format

# ESLintによるコード検証
pnpm lint
```

**注意**: 開発環境でワーカーを実行する場合、ローカルにFFmpegとRedisがインストールされている必要があります。

### 本番環境（Docker）

本番環境では、FFmpegコンテナ内でワーカープロセスが自動的に起動されます。環境構築リポジトリ（`ref/docker-nodejs-streaming-staging-env`）のAnsibleプレイブックを使用してデプロイしてください。

## 主な機能

### 動画アップロード (`/upload`)

- MP4形式の動画ファイルをドラッグ&ドロップまたはファイル選択でアップロード
- 最大500MBまで対応
- アップロード後、Redisキューにジョブを追加して即座にレスポンス
- FFmpegコンテナのワーカープロセスがバックグラウンドでHLS形式に変換
- アップロード完了後、自動的に動画一覧ページへリダイレクト

### 動画一覧 (`/`)

- アップロードされた動画の一覧を表示
- 変換中の動画は「変換中」バッジ付きで表示
- レスポンシブなグリッドレイアウト
- 動画カードをクリックして視聴ページへ遷移（変換完了後）

### 動画視聴 (`/watch/[id]`)

- HLS.jsを使用した高品質なストリーミング再生
- ネットワーク状況に応じた自動解像度調整
- モダンなUIデザインの動画プレイヤー
- 関連動画の推奨表示

## プロジェクト構造

```
├── src/
│   ├── components/        # ReactとAstroのコンポーネント
│   │   └── HlsPlayer.tsx  # HLS動画プレイヤーコンポーネント
│   ├── lib/               # 共通ライブラリ
│   │   ├── redis.ts       # Redis接続設定
│   │   └── queue.ts       # BullMQキュー設定
│   ├── workers/           # ワーカープロセス
│   │   └── video-worker.ts # 動画変換ワーカー（FFmpegコンテナで実行）
│   ├── layouts/           # ページレイアウト
│   │   └── Layout.astro   # 共通レイアウト
│   ├── pages/             # ファイルベースのルーティング
│   │   ├── index.astro    # 動画一覧ページ
│   │   ├── upload.astro   # 動画アップロードページ
│   │   ├── watch/         # 動画視聴ページ
│   │   │   └── [id].astro
│   │   └── api/           # APIエンドポイント
│   │       ├── upload.ts  # 動画アップロードAPI
│   │       └── job-status.ts # ジョブ状態確認API
│   ├── scripts/           # クライアントサイドスクリプト
│   └── styles/            # グローバルスタイル
│       └── global.css
├── public/                # 静的アセット
├── data/                  # 動画データ（.gitignoreに含まれる）
│   ├── original/          # アップロードされた元動画
│   └── hls/               # HLS変換後の動画ファイル
├── ref/                   # 環境構築用リポジトリ
│   └── docker-nodejs-streaming-staging-env/ # Ansible + Vagrant環境構築
├── astro.config.mjs       # Astroの設定
├── tsconfig.json          # TypeScriptの設定
└── package.json           # プロジェクトの依存関係とスクリプト
```

## データディレクトリ

動画ファイルは以下のディレクトリに保存されます：

- `data/original/`: アップロードされた元のMP4ファイル
- `data/hls/`: FFmpegで変換されたHLSファイル（各動画はID名のディレクトリに保存）

これらのディレクトリは`.gitignore`に含まれているため、Gitにはコミットされません。

## HLS配信について

- HLSファイルはNginxコンテナ経由で`/hls/[id]/index.m3u8`（標準ポート 80/443）で配信されます
- ブラウザではhls.jsを使用して再生されます（SafariはネイティブHLSサポートを使用）
- ポート番号を指定せずにアクセスできるため、Mixed Contentエラーを回避し、HTTPS環境でも安全に視聴可能です
- 動画は10秒単位のセグメントに分割され、ネットワーク状況に応じて最適な解像度が選択されます

## 技術詳細

### Redisジョブキュー

動画変換処理はBullMQとRedisを使用した非同期ジョブキューで実装されています：

- **ジョブキュー**: BullMQ（Redis上で動作）
- **ワーカー実行環境**: FFmpegコンテナ内（Node.js + tsx）
- **リトライ**: 失敗時は3回まで自動再試行（指数バックオフ）
- **状態管理**: ジョブの状態（waiting, active, completed, failed）を追跡可能

### 環境変数

環境変数は `.env` ファイルで設定できます。`.env.example` を参考にしてください。

- `VIDEO_QUEUE_REDIS_URL`: 動画処理キュー用Redisサーバーの接続URL（例: redis://localhost:6379/1）

### API エンドポイント

- `POST /api/upload`: 動画アップロード + ジョブキュー追加
- `GET /api/job-status?jobId={id}`: ジョブの状態確認

## ライセンス

MITライセンス