/**
 * 设置模块类型定义
 *
 * 从 Web 端 lib/types/settings.ts 和 lib/types/provider.ts 移植，
 * 保留与 @openmaic/storage-types 一致的纯类型契约，零运行时依赖。
 */

/** 内置 LLM 提供商 ID */
export type BuiltInProviderId =
  | 'openai'
  | 'azure'
  | 'anthropic'
  | 'google'
  | 'deepseek'
  | 'qwen'
  | 'kimi'
  | 'minimax'
  | 'glm'
  | 'siliconflow'
  | 'doubao'
  | 'openrouter'
  | 'grok'
  | 'tencent-hunyuan'
  | 'xiaomi'
  | 'lemonade'
  | 'ollama';

/** 提供商 ID（内置或自定义，自定义以 custom- 前缀） */
export type ProviderId = BuiltInProviderId | `custom-${string}`;

/** 提供商 API 类型 */
export type ProviderType = 'openai' | 'azure' | 'anthropic' | 'google';

/** 设置面板分区 */
export type SettingsSection =
  | 'general'
  | 'token-plan'
  | 'providers'
  | 'agents'
  | 'tts'
  | 'asr'
  | 'pdf'
  | 'image'
  | 'video'
  | 'web-search';

/** 模型能力描述 */
export interface ModelCapabilities {
  streaming?: boolean;
  tools?: boolean;
  vision?: boolean;
}

/** 模型信息 */
export interface ModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
  outputWindow?: number;
  capabilities?: ModelCapabilities;
  /** 模型来源：probed(自动发现) | manual(手动添加) */
  source?: 'probed' | 'manual';
}

/** 提供商配置（用于 UI 展示） */
export interface ProviderConfig {
  id: ProviderId;
  name: string;
  type: ProviderType;
  defaultBaseUrl?: string;
  baseUrlPlaceholder?: string;
  supportsModelDiscovery?: boolean;
  alternateBaseUrls?: { label: string; url: string }[];
  requiresApiKey: boolean;
  icon?: string;
  models: ModelInfo[];
}

/** 提供商设置（持久化存储） */
export interface ProviderSettings {
  apiKey: string;
  baseUrl: string;
  models: ModelInfo[];
  name: string;
  type: ProviderType;
  defaultBaseUrl?: string;
  icon?: string;
  requiresApiKey: boolean;
  isBuiltIn: boolean;
  modelsUrl?: string;
  isServerConfigured?: boolean;
  serverModels?: string[];
}

/** 所有提供商配置映射 */
export type ProvidersConfig = Record<string, ProviderSettings>;

/** TTS 提供商 ID */
export type TTSProviderId =
  | 'openai-tts'
  | 'azure-tts'
  | 'glm-tts'
  | 'qwen-tts'
  | 'voxcpm-tts'
  | 'doubao-tts'
  | 'elevenlabs-tts'
  | 'minimax-tts'
  | 'lemonade-tts'
  | 'browser-native-tts'
  | `custom-tts-${string}`;

/** ASR 提供商 ID */
export type ASRProviderId =
  | 'openai-whisper'
  | 'browser-native'
  | 'qwen-asr'
  | 'azure-asr'
  | 'lemonade-asr'
  | `custom-asr-${string}`;

/** PDF 提供商 ID */
export type PDFProviderId = 'mineru' | 'alidocmind' | 'unpdf';

/** 图片生成提供商 ID */
export type ImageProviderId =
  | 'seedream'
  | 'openai-image'
  | 'qwen-image'
  | 'nano-banana'
  | 'minimax-image'
  | 'grok-image'
  | 'comfyui-image'
  | 'lemonade';

/** 视频生成提供商 ID */
export type VideoProviderId =
  | 'seedance'
  | 'kling'
  | 'veo'
  | 'sora'
  | 'minimax-video'
  | 'grok-video'
  | 'happyhorse';

/** Web 搜索提供商 ID */
export type WebSearchProviderId =
  | 'tavily'
  | 'brave'
  | 'bocha'
  | 'baidu'
  | 'doubao'
  | 'minimax'
  | 'searxng';

/** TTS 提供商配置 */
export interface TTSProviderConfig {
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
  modelId?: string;
  customModels?: Array<{ id: string; name: string }>;
  providerOptions?: Record<string, unknown>;
  isServerConfigured?: boolean;
  serverDisabled?: boolean;
  customName?: string;
  customDefaultBaseUrl?: string;
  customVoices?: Array<{ id: string; name: string }>;
  isBuiltIn?: boolean;
  requiresApiKey?: boolean;
}

/** ASR 提供商配置 */
export interface ASRProviderConfig {
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
  modelId?: string;
  customModels?: Array<{ id: string; name: string }>;
  providerOptions?: Record<string, unknown>;
  isServerConfigured?: boolean;
  customName?: string;
  customDefaultBaseUrl?: string;
  isBuiltIn?: boolean;
  requiresApiKey?: boolean;
}

/** 通用提供商配置（PDF/图片/视频/Web搜索） */
export interface GenericProviderConfig {
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
  requiresApiKey?: boolean;
  isServerConfigured?: boolean;
  customModels?: Array<{ id: string; name: string }>;
  replaceBuiltInModels?: boolean;
  /**
   * 提供商特定选项（按提供商隔离的扩展字段）。
   *
   * 用于存储 GenericProviderConfig 未显式声明的字段，例如：
   * - 阿里云 AliDocMind 的 `accessKeyId` / `accessKeySecret`
   * - 图片/视频生成提供商的当前激活模型 `activeModelId`
   *
   * 该字段为运行时存储，不参与类型约束，使用方需自行做类型断言。
   */
  providerOptions?: Record<string, unknown>;
}

/** 编辑中的模型 */
export interface EditingModel {
  providerId: ProviderId;
  modelIndex: number | null;
  model: ModelInfo;
}

/** 用量数据桶 */
export interface UsageBucket {
  key: string;
  kind: 'llm' | 'image' | 'video' | 'tts' | 'asr';
  unit: 'token' | 'image' | 'second' | 'character';
  requests: number;
  totalTokens: number;
  quantity: number;
}

/** 用量响应 */
export interface UsageResponse {
  totals: { requests: number; llmTokens: number };
  byModel: UsageBucket[];
  byDay: UsageBucket[];
  byKind: UsageBucket[];
}

/** 判断是否为自定义 TTS 提供商 */
export function isCustomTTSProvider(id: string): id is `custom-tts-${string}` {
  return id.startsWith('custom-tts-');
}

/** 判断是否为自定义 ASR 提供商 */
export function isCustomASRProvider(id: string): id is `custom-asr-${string}` {
  return id.startsWith('custom-asr-');
}
