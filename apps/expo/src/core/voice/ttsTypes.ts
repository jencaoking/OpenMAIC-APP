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

/** Provider registry with default config for each TTS provider. */
export const TTS_PROVIDERS: Record<TTSProviderId, TTSProviderConfig> = {
  'openai-tts': {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'tts-1', name: 'TTS-1' },
      { id: 'tts-1-hd', name: 'TTS-1 HD' },
    ],
    defaultModelId: 'tts-1',
    voices: [
      { id: 'alloy', name: 'Alloy', language: 'en-US', gender: 'neutral' },
      { id: 'echo', name: 'Echo', language: 'en-US', gender: 'male' },
      { id: 'fable', name: 'Fable', language: 'en-US', gender: 'male' },
      { id: 'onyx', name: 'Onyx', language: 'en-US', gender: 'male' },
      { id: 'nova', name: 'Nova', language: 'en-US', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', language: 'en-US', gender: 'female' },
    ],
    supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
  },
  'azure-tts': {
    id: 'azure-tts',
    name: 'Azure TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://{region}.tts.speech.microsoft.com',
    models: [{ id: 'azure-neural', name: 'Azure Neural' }],
    defaultModelId: 'azure-neural',
    voices: [
      { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'female' },
      { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'male' },
      { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', language: 'zh-CN', gender: 'female' },
      { id: 'zh-CN-YunxiNeural', name: 'Yunxi', language: 'zh-CN', gender: 'male' },
    ],
    supportedFormats: ['audio-24khz-96kbitrate-mono-mp3', 'audio-24khz-48kbitrate-mono-mp3'],
  },
  'glm-tts': {
    id: 'glm-tts',
    name: 'GLM TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [{ id: 'cogtts', name: 'CogTTS' }],
    defaultModelId: 'cogtts',
    voices: [
      { id: 'male-qn-qingse', name: '青涩男声', language: 'zh-CN', gender: 'male' },
      { id: 'female-shaonv', name: '少女', language: 'zh-CN', gender: 'female' },
      { id: 'female-yujie', name: '御姐', language: 'zh-CN', gender: 'female' },
      { id: 'male-qn-jingying', name: '精英男声', language: 'zh-CN', gender: 'male' },
    ],
    supportedFormats: ['mp3', 'wav'],
  },
  'qwen-tts': {
    id: 'qwen-tts',
    name: 'Qwen TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [{ id: 'cosyvoice-v1', name: 'CosyVoice V1' }],
    defaultModelId: 'cosyvoice-v1',
    voices: [
      { id: 'longxiaochun', name: '小纯', language: 'zh-CN', gender: 'female' },
      { id: 'longxiaobai', name: '小白', language: 'zh-CN', gender: 'female' },
      { id: 'longlaotie', name: '老铁', language: 'zh-CN', gender: 'male' },
    ],
    supportedFormats: ['mp3', 'wav'],
  },
  'minimax-tts': {
    id: 'minimax-tts',
    name: 'MiniMax TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.minimax.chat/v1',
    models: [{ id: 'speech-02-turbo', name: 'Speech-02 Turbo' }],
    defaultModelId: 'speech-02-turbo',
    voices: [
      { id: 'male-qn-qingse', name: '青涩男声', language: 'zh-CN', gender: 'male' },
      { id: 'female-shaonv', name: '少女', language: 'zh-CN', gender: 'female' },
      { id: 'presenter_male', name: '男主持', language: 'zh-CN', gender: 'male' },
    ],
    supportedFormats: ['mp3', 'wav'],
  },
  'doubao-tts': {
    id: 'doubao-tts',
    name: 'Doubao TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://openspeech.bytedance.com/api/v1',
    models: [{ id: 'seed-tts-2.0', name: 'Seed TTS 2.0' }],
    defaultModelId: 'seed-tts-2.0',
    voices: [
      {
        id: 'zh_female_shuangkuaisisi_moon_bigtts',
        name: '思思',
        language: 'zh-CN',
        gender: 'female',
      },
      { id: 'zh_male_chunhou', name: '淳厚', language: 'zh-CN', gender: 'male' },
    ],
    supportedFormats: ['mp3', 'wav'],
  },
  'elevenlabs-tts': {
    id: 'elevenlabs-tts',
    name: 'ElevenLabs TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.elevenlabs.io/v1',
    models: [
      { id: 'eleven_monolingual_v1', name: 'Monolingual V1' },
      { id: 'eleven_multilingual_v2', name: 'Multilingual V2' },
    ],
    defaultModelId: 'eleven_multilingual_v2',
    voices: [
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en-US', gender: 'female' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en-US', gender: 'male' },
    ],
    supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
  },
  'browser-native': {
    id: 'browser-native',
    name: 'Browser Native',
    requiresApiKey: false,
    models: [{ id: 'default', name: 'System Default' }],
    defaultModelId: 'default',
    voices: [],
    supportedFormats: [],
  },
};
