/**
 * Video Export Client for Mobile.
 *
 * Placeholder client that calls a cloud API endpoint.
 * Actual video processing happens server-side.
 */

import type {
  VideoExportConfig,
  VideoExportRequest,
  VideoExportResult,
  VideoExportProgress,
} from './videoExportTypes';

/**
 * Start video export via cloud API.
 * Returns a job ID for polling status.
 */
export async function startVideoExport(
  config: VideoExportConfig,
  request: VideoExportRequest,
): Promise<{ jobId: string }> {
  const url = `${config.serverBaseUrl}/api/video-export/start`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Video export API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return { jobId: data.jobId };
}

/**
 * Poll video export status.
 */
export async function getVideoExportStatus(
  config: VideoExportConfig,
  jobId: string,
): Promise<VideoExportProgress> {
  const url = `${config.serverBaseUrl}/api/video-export/status/${jobId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Video export status error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Poll until video export is complete.
 */
export async function waitForVideoExport(
  config: VideoExportConfig,
  jobId: string,
  onProgress?: (progress: VideoExportProgress) => void,
  maxWaitMs: number = 300000, // 5 minutes
): Promise<VideoExportResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const progress = await getVideoExportStatus(config, jobId);
    onProgress?.(progress);

    if (progress.status === 'completed' && progress.result) {
      return progress.result;
    }

    if (progress.status === 'failed') {
      throw new Error(progress.error || 'Video export failed');
    }

    // Wait 3 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error('Video export timed out');
}

/**
 * Download exported video to local file.
 */
export async function downloadVideo(
  url: string,
  filename: string,
): Promise<string> {
  const FileSystem = await import('expo-file-system');
  const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).default?.cacheDirectory || '';
  const localPath = `${cacheDir}${filename}`;

  const downloadResult = await FileSystem.default.downloadAsync(url, localPath);
  return downloadResult.uri;
}
