# Astro Tailwind4 Flowbite ESLint スターター

Astro、React、TailwindCSS、FlowbiteとESLintで構築されたモダンなWebアプリケーション開発のためのスターターテンプレート。

## 技術スタック

- [Astro](https://astro.build/) - コンテンツ駆動型Webサイトのためのフレームワーク
- [React](https://react.dev/) - UIコンポーネントライブラリ
- [TailwindCSS v4](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [Flowbite](https://flowbite.com/) - TailwindCSS用UIコンポーネント
- [ESLint](https://eslint.org/) - コード品質とスタイルのための静的解析ツール
- [TypeScript](https://www.typescriptlang.org/) - 型安全性

## 必要要件

- Node.js v18.14.1以上
- pnpm v10.4.1以上

## インストール

```bash
# リポジトリをクローン
git clone [リポジトリのURL]

# プロジェクトディレクトリに移動
cd astro-tailwind4-flowbite-eslint-starter

# 依存関係のインストール
pnpm install
```

## 開発手順

```bash
# 開発サーバーの起動
pnpm dev

# プロダクションビルド
pnpm build

# ビルドのプレビュー
pnpm preview

# プロダクションサーバーの起動
pnpm start

# ESLintによるコード検証
pnpm lint
```

## 特徴

- ⚡️ Node.jsアダプターによるサーバーサイドレンダリング（SSR）
- 🎨 TailwindCSS v4とFlowbiteによるモダンなUI
- 📦 Reactによるコンポーネントベースの開発
- 🔒 TypeScriptによる型安全な開発
- 🧹 ESLintによるコード品質の確保
- 🚀 高速なビルドとホットモジュールリプレイスメント

## プロジェクト構造

```
├── src/
│   ├── components/    # ReactとAstroのコンポーネント
│   ├── layouts/       # ページレイアウト
│   ├── pages/        # ファイルベースのルーティング
│   └── styles/       # グローバルスタイルとTailwindの設定
├── public/           # 静的アセット
├── astro.config.mjs  # Astroの設定
├── tsconfig.json     # TypeScriptの設定
├── .eslintrc.js      # ESLintの設定
└── package.json      # プロジェクトの依存関係とスクリプト
```

## ライセンス

MITライセンス