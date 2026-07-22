/**
 * Media Generation Client for Mobile.
 *
 * Calls the same server-side API routes as Web:
 * - POST /api/generate/image
 * - POST /api/generate/video
 *
 * Port of Web's lib/media/media-orchestrator.ts client-side logic.
 */

import type {
  ImageGenerationConfig,
  ImageGenerationOptions,
  ImageGenerationResult,
  VideoGenerationConfig,
  VideoGenerationOptions,
  VideoGenerationResult,
} from './mediaTypes';

/**
 * Media API Error with structured error code
 */
export class MediaApiError extends Error {
  errorCode?: string;
  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'MediaApiError';
    this.errorCode = errorCode;
  }
}

/**
 * Generate an image using the server-side API.
 *
 * @param config - Provider configuration (providerId, apiKey, baseUrl, model)
 * @param options - Generation options (prompt, aspectRatio, style, etc.)
 * @param baseUrl - Server base URL (e.g. 'https://openmaic.dev')
 * @returns Image generation result with URL
 */
export async function generateImage(
  config: ImageGenerationConfig,
  options: ImageGenerationOptions,
  baseUrl: string = '',
): Promise<ImageGenerationResult> {
  const url = `${baseUrl}/api/generate/image`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-image-provider': config.providerId || '',
      'x-image-model': config.model || '',
      'x-api-key': config.apiKey || '',
      'x-base-url': config.baseUrl || '',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      negativePrompt: options.negativePrompt,
      width: options.width,
      height: options.height,
      aspectRatio: options.aspectRatio,
      style: options.style,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new MediaApiError(data.error || `Image API returned ${response.status}`, data.errorCode);
  }

  const data = await response.json();
  if (!data.success) {
    throw new MediaApiError(data.error || 'Image generation failed', data.errorCode);
  }

  return data.result;
}

/**
 * Generate a video using the server-side API.
 *
 * @param config - Provider configuration (providerId, apiKey, baseUrl, model)
 * @param options - Generation options (prompt, duration, aspectRatio, etc.)
 * @param baseUrl - Server base URL
 * @returns Video generation result with URL
 */
export async function generateVideo(
  config: VideoGenerationConfig,
  options: VideoGenerationOptions,
  baseUrl: string = '',
): Promise<VideoGenerationResult> {
  const url = `${baseUrl}/api/generate/video`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-video-provider': config.providerId || '',
      'x-video-model': config.model || '',
      'x-api-key': config.apiKey || '',
      'x-base-url': config.baseUrl || '',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      duration: options.duration,
      aspectRatio: options.aspectRatio,
      resolution: options.resolution,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new MediaApiError(data.error || `Video API returned ${response.status}`, data.errorCode);
  }

  const data = await response.json();
  if (!data.success) {
    throw new MediaApiError(data.error || 'Video generation failed', data.errorCode);
  }

  return data.result;
}

/**
 * Fetch a media URL as a local file path.
 * Downloads the file and saves it to the app's cache directory.
 */
export async function fetchMediaToLocal(url: string, filename: string): Promise<string> {
  const FileSystem = await import('expo-file-system');
  const cacheDir =
    (FileSystem as any).cacheDirectory || (FileSystem as any).default?.cacheDirectory || '';
  const localPath = `${cacheDir}${filename}`;

  // Check if already cached
  const info = await FileSystem.default.getInfoAsync(localPath);
  if (info.exists) {
    return localPath;
  }

  // Download
  const downloadResult = await FileSystem.default.downloadAsync(url, localPath);
  return downloadResult.uri;
}

/**
 * Get aspect ratio dimensions
 */
export function aspectRatioToDimensions(aspectRatio: '16:9' | '4:3' | '1:1' | '9:16'): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1024, height: 576 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '1:1':
      return { width: 1024, height: 1024 };
    case '9:16':
      return { width: 576, height: 1024 };
    default:
      return { width: 1024, height: 1024 };
  }
}
