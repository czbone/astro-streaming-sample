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

- **Node.jsコンテナ**: このWebアプリケーション（Astro SSR）
- **FFmpegコンテナ**: 動画のHLS変換処理
- **Nginxコンテナ**: HLSファイルの配信（ポート8080）
- **Redisコンテナ**: コンテナ間連携用

## 必要要件

- Node.js v18.14.1以上
- pnpm v10.4.1以上
- Docker & Docker Compose（動画変換機能を使用する場合）

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

```bash
# 開発サーバーの起動（ポート3000）
pnpm dev

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

## 主な機能

### 動画アップロード (`/upload`)

- MP4形式の動画ファイルをドラッグ&ドロップまたはファイル選択でアップロード
- 最大500MBまで対応
- アップロード後、FFmpegコンテナでHLS形式に自動変換
- 変換完了後、自動的に動画一覧ページへリダイレクト

### 動画一覧 (`/`)

- アップロードされた動画の一覧を表示
- レスポンシブなグリッドレイアウト
- 動画カードをクリックして視聴ページへ遷移

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
│   ├── layouts/           # ページレイアウト
│   │   └── Layout.astro   # 共通レイアウト
│   ├── pages/             # ファイルベースのルーティング
│   │   ├── index.astro    # 動画一覧ページ
│   │   ├── upload.astro   # 動画アップロードページ
│   │   ├── watch/         # 動画視聴ページ
│   │   │   └── [id].astro
│   │   └── api/           # APIエンドポイント
│   │       └── upload.ts  # 動画アップロードAPI
│   ├── scripts/           # クライアントサイドスクリプト
│   └── styles/            # グローバルスタイル
│       └── global.css
├── public/                # 静的アセット
├── data/                  # 動画データ（.gitignoreに含まれる）
│   ├── original/          # アップロードされた元動画
│   └── hls/               # HLS変換後の動画ファイル
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

- HLSファイルはNginxコンテナ経由で`http://localhost:8080/hls/[id]/index.m3u8`で配信されます
- ブラウザではhls.jsを使用して再生されます（SafariはネイティブHLSサポートを使用）
- 動画は10秒単位のセグメントに分割され、ネットワーク状況に応じて最適な解像度が選択されます

## ライセンス

MITライセンス