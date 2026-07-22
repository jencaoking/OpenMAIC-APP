/**
 * ASR (Automatic Speech Recognition) Provider Types for Mobile.
 *
 * Port of Web's lib/audio/types.ts ASR section.
 * Simplified for React Native (no Buffer/Blob, uses ArrayBuffer/Uint8Array).
 */

/**
 * Built-in ASR Provider IDs
 */
export type ASRProviderId =
  | 'openai-whisper'
  | 'qwen-asr'
  | 'azure-asr'
  | 'lemonade-asr'
  | 'browser-native'
  | `custom-asr-${string}`;

/**
 * ASR Provider Configuration
 */
export interface ASRProviderConfig {
  id: ASRProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
  models: Array<{ id: string; name: string }>;
  defaultModelId: string;
  supportedLanguages: string[];
  supportedFormats: string[];
}

/**
 * ASR Model Configuration for API calls
 */
export interface ASRModelConfig {
  providerId: ASRProviderId;
  modelId?: string;
  apiKey?: string;
  baseUrl?: string;
  language?: string;
}

/**
 * ASR Transcription Result
 */
export interface ASRTranscriptionResult {
  text: string;
}

/**
 * ASR Provider Registry
 */
export const ASR_PROVIDERS: Record<string, ASRProviderConfig> = {
  'openai-whisper': {
    id: 'openai-whisper',
    name: 'OpenAI Whisper',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'whisper-1', name: 'Whisper v1' },
      { id: 'gpt-4o-transcribe', name: 'GPT-4o Transcribe' },
      { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe' },
    ],
    defaultModelId: 'gpt-4o-mini-transcribe',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'auto'],
    supportedFormats: ['mp3', 'wav', 'webm', 'm4a', 'ogg'],
  },
  'qwen-asr': {
    id: 'qwen-asr',
    name: 'Qwen ASR',
    requiresApiKey: true,
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    models: [{ id: 'qwen3-asr-flash', name: 'Qwen3 ASR Flash' }],
    defaultModelId: 'qwen3-asr-flash',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'auto'],
    supportedFormats: ['wav', 'mp3', 'webm'],
  },
  'azure-asr': {
    id: 'azure-asr',
    name: 'Azure Speech',
    requiresApiKey: true,
    defaultBaseUrl: '',
    models: [],
    defaultModelId: '',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'auto'],
    supportedFormats: ['wav', 'webm', 'mp3'],
  },
  'lemonade-asr': {
    id: 'lemonade-asr',
    name: 'Lemonade ASR',
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:8080',
    models: [],
    defaultModelId: '',
    supportedLanguages: ['en', 'zh', 'auto'],
    supportedFormats: ['wav'],
  },
  'browser-native': {
    id: 'browser-native',
    name: 'Browser Native',
    requiresApiKey: false,
    models: [],
    defaultModelId: '',
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es'],
    supportedFormats: [],
  },
};

/**
 * Get all available ASR providers
 */
export function getAllASRProviders(): ASRProviderConfig[] {
  return Object.values(ASR_PROVIDERS);
}

/**
 * Get a specific ASR provider
 */
export function getASRProvider(id: ASRProviderId): ASRProviderConfig | undefined {
  return ASR_PROVIDERS[id];
}

/**
 * Get supported languages for an ASR provider
 */
export function getASRSupportedLanguages(providerId: ASRProviderId): string[] {
  return ASR_PROVIDERS[providerId]?.supportedLanguages || [];
}

/**
 * Check if a provider ID is a custom ASR provider
 */
export function isCustomASRProvider(id: string): boolean {
  return id.startsWith('custom-asr-');
}
