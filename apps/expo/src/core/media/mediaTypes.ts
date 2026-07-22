/**
 * Media Generation Types for Mobile.
 *
 * Port of Web's lib/media/types.ts — simplified for React Native.
 * Calls the same server-side API routes as Web.
 */

// ============================================================================
// Image Generation Types
// ============================================================================

export type ImageProviderId =
  | 'seedream'
  | 'openai-image'
  | 'qwen-image'
  | 'nano-banana'
  | 'minimax-image'
  | 'grok-image'
  | 'comfyui-image'
  | 'lemonade';

export interface ImageProviderConfig {
  id: ImageProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
  models: Array<{ id: string; name: string }>;
  supportedAspectRatios: Array<'16:9' | '4:3' | '1:1' | '9:16'>;
  supportedStyles?: string[];
  maxResolution?: { width: number; height: number };
}

export interface ImageGenerationConfig {
  providerId: ImageProviderId;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  style?: string;
}

export interface ImageGenerationResult {
  url?: string;
  base64?: string;
  width: number;
  height: number;
}

// ============================================================================
// Video Generation Types
// ============================================================================

export type VideoProviderId =
  | 'seedance'
  | 'kling'
  | 'veo'
  | 'sora'
  | 'minimax-video'
  | 'grok-video'
  | 'happyhorse';

export interface VideoProviderConfig {
  id: VideoProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
  models: Array<{ id: string; name: string }>;
  supportedAspectRatios: Array<'16:9' | '4:3' | '1:1' | '9:16' | '3:4' | '21:9'>;
  supportedDurations?: number[];
  maxDuration?: number;
}

export interface VideoGenerationConfig {
  providerId: VideoProviderId;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface VideoGenerationOptions {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' | '3:4' | '21:9';
  resolution?: '480p' | '720p' | '1080p';
}

export interface VideoGenerationResult {
  url: string;
  duration: number;
  width: number;
  height: number;
  poster?: string;
}

// ============================================================================
// Shared Types
// ============================================================================

export interface MediaGenerationRequest {
  type: 'image' | 'video';
  prompt: string;
  elementId: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  style?: string;
}

export type MediaTaskStatus = 'pending' | 'generating' | 'done' | 'failed';

export interface MediaTask {
  elementId: string;
  stageId: string;
  type: 'image' | 'video';
  prompt: string;
  status: MediaTaskStatus;
  url?: string;
  poster?: string;
  error?: string;
  errorCode?: string;
  params: {
    aspectRatio?: string;
    style?: string;
  };
  createdAt: number;
}

// ============================================================================
// Provider Registry
// ============================================================================

export const IMAGE_PROVIDERS: Record<ImageProviderId, ImageProviderConfig> = {
  seedream: {
    id: 'seedream',
    name: 'Seedream',
    requiresApiKey: true,
    models: [{ id: 'seedream-3.0', name: 'Seedream 3.0' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
  'openai-image': {
    id: 'openai-image',
    name: 'OpenAI Image',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-image-1', name: 'GPT Image 1' },
      { id: 'dall-e-3', name: 'DALL-E 3' },
    ],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
  'qwen-image': {
    id: 'qwen-image',
    name: 'Qwen Image',
    requiresApiKey: true,
    models: [{ id: 'wanx-v1', name: 'Wanx v1' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
  'nano-banana': {
    id: 'nano-banana',
    name: 'Nano Banana',
    requiresApiKey: true,
    models: [{ id: 'nano-banana-v1', name: 'Nano Banana v1' }],
    supportedAspectRatios: ['1:1'],
  },
  'minimax-image': {
    id: 'minimax-image',
    name: 'MiniMax Image',
    requiresApiKey: true,
    models: [{ id: 'image-01', name: 'Image 01' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
  'grok-image': {
    id: 'grok-image',
    name: 'Grok Image',
    requiresApiKey: true,
    models: [{ id: 'grok-image', name: 'Grok Image' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
  'comfyui-image': {
    id: 'comfyui-image',
    name: 'ComfyUI',
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:8188',
    models: [],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
  lemonade: {
    id: 'lemonade',
    name: 'Lemonade',
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:8080',
    models: [],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
  },
};

export const VIDEO_PROVIDERS: Record<VideoProviderId, VideoProviderConfig> = {
  seedance: {
    id: 'seedance',
    name: 'Seedance',
    requiresApiKey: true,
    models: [{ id: 'seedance-1.0', name: 'Seedance 1.0' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 10,
  },
  kling: {
    id: 'kling',
    name: 'Kling',
    requiresApiKey: true,
    models: [{ id: 'kling-v1', name: 'Kling v1' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 10,
  },
  veo: {
    id: 'veo',
    name: 'Veo',
    requiresApiKey: true,
    models: [{ id: 'veo-2', name: 'Veo 2' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 8,
  },
  sora: {
    id: 'sora',
    name: 'Sora',
    requiresApiKey: true,
    models: [{ id: 'sora', name: 'Sora' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 20,
  },
  'minimax-video': {
    id: 'minimax-video',
    name: 'MiniMax Video',
    requiresApiKey: true,
    models: [{ id: 'video-01', name: 'Video 01' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 6,
  },
  'grok-video': {
    id: 'grok-video',
    name: 'Grok Video',
    requiresApiKey: true,
    models: [{ id: 'grok-video', name: 'Grok Video' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 10,
  },
  happyhorse: {
    id: 'happyhorse',
    name: 'HappyHorse',
    requiresApiKey: true,
    models: [{ id: 'happyhorse-v1', name: 'HappyHorse v1' }],
    supportedAspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    maxDuration: 5,
  },
};

export function getAllImageProviders(): ImageProviderConfig[] {
  return Object.values(IMAGE_PROVIDERS);
}

export function getAllVideoProviders(): VideoProviderConfig[] {
  return Object.values(VIDEO_PROVIDERS);
}
