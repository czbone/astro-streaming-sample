FROM node:18-alpine

WORKDIR /app

# pnpmをインストール
RUN npm install -g pnpm@10.4.1

# workspaceのpackage.jsonをコピー
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# sharedとwebのpackage.jsonをコピー
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/

# 依存関係をインストール
RUN pnpm install --frozen-lockfile --filter @nexstream/web...

# sharedのソースをコピーしてビルド
COPY packages/shared ./packages/shared
RUN pnpm --filter @nexstream/shared build

# webのソースをコピーしてビルド
COPY packages/web ./packages/web
RUN pnpm --filter @nexstream/web build

WORKDIR /app/packages/web

EXPOSE 3000

# 環境変数
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["pnpm", "start"]
