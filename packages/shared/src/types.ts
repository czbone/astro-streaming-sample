/**
 * 動画変換ジョブのデータ型
 */
export interface VideoJobData {
  /** 動画の一意識別子 */
  videoId: string
  /** アップロードされた元ファイル名 */
  originalFileName: string
  /** HLS出力先ディレクトリ名 */
  hlsDirName: string
  /** 元動画ファイルのパス */
  originalPath: string
  /** HLS出力ディレクトリのパス */
  hlsOutputDir: string
}

/**
 * ジョブ状態レスポンスの型
 */
export interface JobStatusResponse {
  /** ジョブID */
  jobId: string
  /** ジョブの状態 */
  state: 'waiting' | 'active' | 'completed' | 'failed'
  /** 進捗状況（0-100または詳細オブジェクト） */
  progress: number | object
  /** ジョブデータ */
  data: VideoJobData
}
