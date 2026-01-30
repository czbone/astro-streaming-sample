# NexStream モノレポ

NexStreamは、MP4動画をアップロードしてHLS形式に自動変換し、ストリーミング配信するWebアプリケーションです。pnpm workspaceを使用したモノレポ構成により、Webアプリケーションとワーカープロセスを分離管理しています。

## プロジェクト構成

```
nexstream-monorepo/
├── packages/
│   ├── shared/              # 共有ライブラリ（Redis、BullMQ、型定義）
│   ├── web/                 # Astro Webアプリケーション
│   └── worker/              # 動画変換ワーカープロセス
├── data/                    # 動画データ（.gitignoreに含む）
│   ├── original/            # アップロードされた元動画
│   └── hls/                 # HLS変換後の動画ファイル
├── pnpm-workspace.yaml      # pnpm workspace設定
├── docker-compose.yml       # Docker Compose設定
└── package.json             # ルートpackage.json
```

## 技術スタック

- **モノレポ管理**: pnpm workspace
- **Webフレームワーク**: Astro + React
- **スタイリング**: TailwindCSS v4 + Flowbite
- **動画配信**: HLS.js
- **ジョブキュー**: BullMQ + Redis
- **動画変換**: FFmpeg
- **型安全性**: TypeScript
- **コンテナ**: Docker + Docker Compose

## パッケージ概要

### @nexstream/shared
Redis接続、BullMQキュー、型定義を提供する共有ライブラリ。WebアプリとWorkerの両方から使用されます。

[詳細はこちら](./packages/shared/README.md)

### @nexstream/web
ユーザーインターフェース、動画アップロード、動画一覧、動画視聴機能を提供するAstro Webアプリケーション。

[詳細はこちら](./packages/web/README.md)

### @nexstream/worker
BullMQワーカープロセス。Redisキューからジョブを取得し、FFmpegで動画をHLS形式に変換します。

[詳細はこちら](./packages/worker/README.md)

## 必要要件

- **Node.js**: v18.14.1以上
- **pnpm**: v10.4.1以上
- **Docker & Docker Compose**: 本番環境またはローカル開発で使用
- **FFmpeg**: ワーカーを実行する環境（Dockerコンテナまたはローカル）
- **Redis**: ジョブキュー用（Dockerコンテナまたはローカル）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone [リポジトリURL]
cd nexstream-monorepo
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 共有ライブラリのビルド

```bash
pnpm build:shared
```

### 4. 環境変数の設定

各パッケージに`.env.example`があるので、`.env`ファイルを作成：

```bash
# 共有ライブラリ
cp packages/shared/.env.example packages/shared/.env

# Webアプリ
cp packages/web/.env.example packages/web/.env

# ワーカー
cp packages/worker/.env.example packages/worker/.env
```

`.env`ファイルを編集してRedis接続URLを設定：

```env
VIDEO_QUEUE_REDIS_URL=redis://localhost:6379/1
```

## 開発方法

### ローカル開発（Redisのみコンテナで起動）

#### 1. Redisを起動

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### 2. Webアプリとワーカーを起動

```bash
# 両方を同時起動
pnpm dev

# または個別に起動
pnpm dev:web      # ポート3000
pnpm dev:worker
```

#### 3. ブラウザでアクセス

http://localhost:3000

### Docker Composeで全体を起動

```bash
# ビルドと起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

## ビルド

### 全パッケージのビルド

```bash
pnpm build
```

### 個別パッケージのビルド

```bash
pnpm build:shared    # 共有ライブラリ
pnpm build:web       # Webアプリ
pnpm build:worker    # ワーカー
```

## スクリプト

### ルートレベル

- `pnpm dev`: WebとWorkerを同時起動（開発モード）
- `pnpm dev:web`: Webアプリのみ起動
- `pnpm dev:worker`: Workerのみ起動
- `pnpm build`: 全パッケージをビルド
- `pnpm build:shared`: 共有ライブラリをビルド
- `pnpm build:web`: Webアプリをビルド
- `pnpm build:worker`: Workerをビルド
- `pnpm format`: コードフォーマット
- `pnpm lint`: ESLintでコード検証

### パッケージ個別

各パッケージ内で実行:

```bash
cd packages/web
pnpm dev        # 開発サーバー起動
pnpm build      # ビルド
pnpm start      # 本番サーバー起動
```

## アーキテクチャ

### データフロー

```
1. ユーザーが動画をアップロード
   ↓
2. Webアプリがファイルを保存し、Redisキューにジョブを追加
   ↓
3. Workerプロセスがジョブを取得
   ↓
4. WorkerがFFmpegを実行してHLS変換
   ↓
5. 変換完了後、ジョブを完了状態に更新
   ↓
6. Webアプリで動画一覧に表示され、視聴可能に
```

### パッケージ間の依存関係

```
@nexstream/web  →  @nexstream/shared  ←  @nexstream/worker
```

- `@nexstream/web`と`@nexstream/worker`は、`@nexstream/shared`に依存
- `@nexstream/shared`は独立しており、他のパッケージに依存しない

## デプロイ

### Docker Composeでのデプロイ

1. 本番環境用の`.env`ファイルを設定
2. Docker Composeでビルド＆起動:

```bash
docker-compose up -d --build
```

### 個別コンテナでのデプロイ

Webアプリとワーカーを別々のコンテナまたはサーバーにデプロイする場合:

#### Webアプリ

```bash
docker build -f packages/web/Dockerfile -t nexstream-web .
docker run -d -p 3000:3000 --env-file packages/web/.env nexstream-web
```

#### ワーカー

```bash
docker build -f packages/worker/Dockerfile -t nexstream-worker .
docker run -d --env-file packages/worker/.env nexstream-worker
```

## トラブルシューティング

### pnpm installがエラーになる

```bash
# pnpmをアップデート
npm install -g pnpm@latest

# node_modulesを削除して再インストール
rm -rf node_modules packages/*/node_modules
pnpm install
```

### 共有ライブラリが見つからない

```bash
# 共有ライブラリをビルド
pnpm build:shared
```

### Redisに接続できない

1. Redisが起動しているか確認:
   ```bash
   docker ps | grep redis
   ```

2. `.env`ファイルの`VIDEO_QUEUE_REDIS_URL`を確認

3. Redisの再起動:
   ```bash
   docker restart redis
   ```

### 動画が変換されない

1. ワーカーが起動しているか確認
2. FFmpegがインストールされているか確認（ローカル開発の場合）
3. ワーカーのログを確認:
   ```bash
   # ローカル
   pnpm dev:worker
   
   # Docker
   docker-compose logs -f worker
   ```

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## ライセンス

MIT License
