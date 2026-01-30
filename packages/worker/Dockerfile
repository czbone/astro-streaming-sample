FROM node:18-alpine

# FFmpegをインストール
RUN apk add --no-cache ffmpeg

WORKDIR /app

# pnpmをインストール
RUN npm install -g pnpm@10.4.1

# workspaceのpackage.jsonをコピー
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# sharedとworkerのpackage.jsonをコピー
COPY packages/shared/package.json ./packages/shared/
COPY packages/worker/package.json ./packages/worker/

# 依存関係をインストール
RUN pnpm install --frozen-lockfile --filter @nexstream/worker...

# sharedのソースをコピーしてビルド
COPY packages/shared ./packages/shared
RUN pnpm --filter @nexstream/shared build

# workerのソースをコピー
COPY packages/worker ./packages/worker

WORKDIR /app/packages/worker

# 環境変数
ENV NODE_ENV=production

CMD ["pnpm", "start"]
