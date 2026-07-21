/**
 * Video Export Types for Mobile.
 *
 * Interface types for cloud-based video export.
 */

/**
 * Video export configuration
 */
export interface VideoExportConfig {
  /** Server base URL for video export API */
  serverBaseUrl: string;
  /** API key for authentication */
  apiKey?: string;
}

/**
 * Video export request
 */
export interface VideoExportRequest {
  /** Stage ID to export */
  stageId: string;
  /** Stage name for the video title */
  stageName: string;
  /** Scenes to include */
  scenes: Array<{
    id: string;
    type: string;
    title?: string;
    duration?: number;
  }>;
  /** Output format */
  format?: 'mp4' | 'webm';
  /** Output resolution */
  resolution?: '720p' | '1080p';
  /** Frame rate */
  fps?: number;
}

/**
 * Video export result
 */
export interface VideoExportResult {
  /** Download URL for the video */
  downloadUrl: string;
  /** Video duration in seconds */
  duration: number;
  /** Video file size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
}

/**
 * Video export status
 */
export type VideoExportStatus = 'idle' | 'processing' | 'completed' | 'failed';

/**
 * Video export progress
 */
export interface VideoExportProgress {
  status: VideoExportStatus;
  progress: number; // 0-100
  message?: string;
  result?: VideoExportResult;
  error?: string;
}
