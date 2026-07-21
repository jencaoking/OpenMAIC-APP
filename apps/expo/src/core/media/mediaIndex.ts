/**
 * Media Generation Module for Mobile.
 *
 * Provides multi-provider image and video generation.
 * Calls the same server-side API routes as Web.
 */

// Types
export type {
  ImageProviderId,
  ImageProviderConfig,
  ImageGenerationConfig,
  ImageGenerationOptions,
  ImageGenerationResult,
  VideoProviderId,
  VideoProviderConfig,
  VideoGenerationConfig,
  VideoGenerationOptions,
  VideoGenerationResult,
  MediaGenerationRequest,
  MediaTask,
  MediaTaskStatus,
} from './mediaTypes';

export {
  IMAGE_PROVIDERS,
  VIDEO_PROVIDERS,
  getAllImageProviders,
  getAllVideoProviders,
} from './mediaTypes';

// Client
export {
  generateImage,
  generateVideo,
  fetchMediaToLocal,
  aspectRatioToDimensions,
  MediaApiError,
} from './mediaClient';

// Store
export { useMediaGenerationStore } from './mediaStore';

// Hook
export { useMediaGeneration } from './useMediaGeneration';
