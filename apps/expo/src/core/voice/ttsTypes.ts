/**
 * TTS (Text-to-Speech) Types for Mobile.
 *
 * Port of Web's lib/audio/types.ts TTS section.
 */

export type TTSProviderId =
  | 'openai-tts'
  | 'azure-tts'
  | 'glm-tts'
  | 'qwen-tts'
  | 'minimax-tts'
  | 'doubao-tts'
  | 'elevenlabs-tts'
  | 'browser-native';

export interface TTSVoiceInfo {
  id: string;
  name: string;
  language: string;
  localeName?: string;
  gender?: 'male' | 'female' | 'neutral';
  description?: string;
}

export interface TTSProviderConfig {
  id: TTSProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
  models: Array<{ id: string; name: string }>;
  defaultModelId: string;
  voices: TTSVoiceInfo[];
  supportedFormats: string[];
  speedRange?: { min: number; max: number; default: number };
}

export interface TTSModelConfig {
  providerId: TTSProviderId;
  modelId?: string;
  apiKey?: string;
  baseUrl?: string;
  voice: string;
  speed?: number;
  format?: string;
}

export interface TTSGenerationResult {
  audio: Uint8Array;
  format: string;
}
