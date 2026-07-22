/**
 * @file constants.ts
 * @description 移动端设置模块提供商常量定义。
 *
 * 从 Web 端 `lib/ai/providers.ts`、`lib/audio/constants.ts`、`lib/pdf/constants.ts`、
 * `lib/media/image-providers.ts`、`lib/media/video-providers.ts`、`lib/web-search/constants.ts`
 * 移植并简化为纯数据（无 SDK import），保证零 Node.js / Web 端依赖。
 *
 * 严格隔离规则：
 * - 不引用 `@openmaic/storage` 运行时
 * - 不引用 `@ai-sdk/*` / `lib/ai/*` / `lib/audio/*` / `lib/media/*` / `lib/pdf/*` / `lib/web-search/*`
 * - 仅依赖 `./types` 中的纯类型契约
 */

import type {
  ProviderConfig,
  TTSProviderId,
  ASRProviderId,
  PDFProviderId,
  ImageProviderId,
  VideoProviderId,
  WebSearchProviderId,
} from './types';

/**
 * LLM 提供商预设映射。
 *
 * 每个内置 LLM 提供商（openai, azure, anthropic, ... ollama）的基础元信息，
 * 用于初始化 `providersConfig` 以及设置面板 UI 渲染。键即 ProviderId。
 */
export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    icon: '/logos/openai.svg',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        contextWindow: 128000,
        outputWindow: 16384,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        contextWindow: 1047576,
        outputWindow: 32768,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  azure: {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'azure',
    baseUrlPlaceholder: 'https://YOUR-RESOURCE.openai.azure.com/openai',
    supportsModelDiscovery: false,
    requiresApiKey: true,
    icon: '/logos/azure.svg',
    // Azure 使用用户自定义的 deployment name 而非 model ID，因此内置模型为空
    models: [],
  },

  anthropic: {
    id: 'anthropic',
    name: 'Claude',
    type: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    icon: '/logos/claude.svg',
    models: [
      {
        id: 'claude-opus-4-5',
        name: 'Claude Opus 4.5',
        contextWindow: 200000,
        outputWindow: 32000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-sonnet-4-5',
        name: 'Claude Sonnet 4.5',
        contextWindow: 200000,
        outputWindow: 16000,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'claude-haiku-4-5',
        name: 'Claude Haiku 4.5',
        contextWindow: 200000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  google: {
    id: 'google',
    name: 'Gemini',
    type: 'google',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    icon: '/logos/gemini.svg',
    models: [
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        contextWindow: 1048576,
        outputWindow: 65536,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        contextWindow: 1048576,
        outputWindow: 65536,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        contextWindow: 1048576,
        outputWindow: 65536,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    requiresApiKey: true,
    icon: '/logos/deepseek.svg',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        contextWindow: 64000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        contextWindow: 64000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  qwen: {
    id: 'qwen',
    name: 'Qwen',
    type: 'openai',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    requiresApiKey: true,
    icon: '/logos/qwen.svg',
    models: [
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        contextWindow: 131072,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        contextWindow: 32768,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        contextWindow: 1000000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  kimi: {
    id: 'kimi',
    name: 'Kimi',
    type: 'openai',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    alternateBaseUrls: [
      { label: 'settings.baseUrlRegion.china', url: 'https://api.moonshot.cn/v1' },
      { label: 'settings.baseUrlRegion.international', url: 'https://api.moonshot.ai/v1' },
    ],
    requiresApiKey: true,
    icon: '/logos/kimi.png',
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot V1 8K',
        contextWindow: 8000,
        outputWindow: 2048,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot V1 32K',
        contextWindow: 32000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot V1 128K',
        contextWindow: 128000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    type: 'anthropic',
    defaultBaseUrl: 'https://api.minimaxi.com/anthropic/v1',
    alternateBaseUrls: [
      { label: 'settings.baseUrlRegion.china', url: 'https://api.minimaxi.com/anthropic/v1' },
      { label: 'settings.baseUrlRegion.international', url: 'https://api.minimax.io/anthropic/v1' },
    ],
    requiresApiKey: true,
    icon: '/logos/minimax.svg',
    models: [
      {
        id: 'MiniMax-M1',
        name: 'MiniMax M1',
        contextWindow: 1000000,
        outputWindow: 32768,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'MiniMax-M2',
        name: 'MiniMax M2',
        contextWindow: 245760,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  glm: {
    id: 'glm',
    name: 'GLM',
    type: 'openai',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    alternateBaseUrls: [
      { label: 'settings.baseUrlRegion.china', url: 'https://open.bigmodel.cn/api/paas/v4' },
      { label: 'settings.baseUrlRegion.international', url: 'https://api.z.ai/api/paas/v4' },
    ],
    requiresApiKey: true,
    icon: '/logos/glm.svg',
    models: [
      {
        id: 'glm-4-plus',
        name: 'GLM-4 Plus',
        contextWindow: 128000,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'glm-4-air',
        name: 'GLM-4 Air',
        contextWindow: 128000,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'glm-4v',
        name: 'GLM-4V',
        contextWindow: 2000,
        outputWindow: 1024,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    type: 'openai',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1',
    requiresApiKey: true,
    icon: '/logos/siliconflow.svg',
    models: [
      {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek V3',
        contextWindow: 64000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen2.5 72B Instruct',
        contextWindow: 64000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  doubao: {
    id: 'doubao',
    name: '豆包',
    type: 'openai',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    requiresApiKey: true,
    icon: '/logos/doubao.svg',
    models: [
      {
        id: 'doubao-pro-32k',
        name: 'Doubao Pro 32K',
        contextWindow: 32000,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'doubao-pro-128k',
        name: 'Doubao Pro 128K',
        contextWindow: 128000,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'doubao-vision-pro-32k',
        name: 'Doubao Vision Pro 32K',
        contextWindow: 32000,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    icon: '/logos/openrouter.svg',
    models: [
      {
        id: 'openrouter/auto',
        name: 'OpenRouter Auto',
        contextWindow: 200000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet (via OpenRouter)',
        contextWindow: 200000,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  grok: {
    id: 'grok',
    name: 'Grok',
    type: 'openai',
    defaultBaseUrl: 'https://api.x.ai/v1',
    requiresApiKey: true,
    icon: '/logos/grok.svg',
    models: [
      {
        id: 'grok-2',
        name: 'Grok 2',
        contextWindow: 131072,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'grok-2-vision',
        name: 'Grok 2 Vision',
        contextWindow: 32768,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: true },
      },
    ],
  },

  'tencent-hunyuan': {
    id: 'tencent-hunyuan',
    name: 'Tencent Hunyuan',
    type: 'openai',
    defaultBaseUrl: 'https://api.hunyuan.cloud.tencent.com/v1',
    alternateBaseUrls: [
      { label: 'settings.baseUrlRegion.china', url: 'https://api.hunyuan.cloud.tencent.com/v1' },
      {
        label: 'settings.baseUrlRegion.international',
        url: 'https://api.hunyuan-intl.cloud.tencent.com/v1',
      },
    ],
    requiresApiKey: true,
    icon: '/logos/hunyuan.svg',
    models: [
      {
        id: 'hunyuan-pro',
        name: 'Hunyuan Pro',
        contextWindow: 32768,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'hunyuan-standard',
        name: 'Hunyuan Standard',
        contextWindow: 32768,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  xiaomi: {
    id: 'xiaomi',
    name: 'Xiaomi MiMo',
    type: 'openai',
    defaultBaseUrl: 'https://api.xiaomimimo.com/v1',
    alternateBaseUrls: [
      { label: 'settings.baseUrlRegion.xiaomiPayg', url: 'https://api.xiaomimimo.com/v1' },
      {
        label: 'settings.baseUrlRegion.xiaomiTokenPlanCN',
        url: 'https://token-plan-cn.xiaomimimo.com/v1',
      },
    ],
    requiresApiKey: true,
    icon: '/logos/xiaomi.svg',
    models: [
      {
        id: 'mimo-v2-pro',
        name: 'MiMo V2 Pro',
        contextWindow: 131072,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'mimo-v2-flash',
        name: 'MiMo V2 Flash',
        contextWindow: 32768,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
    ],
  },

  lemonade: {
    id: 'lemonade',
    name: 'Lemonade',
    type: 'openai',
    defaultBaseUrl: 'http://localhost:13305/v1',
    requiresApiKey: false,
    icon: '/logos/lemonade.svg',
    models: [
      {
        id: 'Gemma-2-9B-it-GGUF',
        name: 'Gemma 2 9B IT GGUF',
        capabilities: { streaming: true, tools: false, vision: false },
      },
      {
        id: 'Qwen2.5-7B-Instruct-GGUF',
        name: 'Qwen2.5 7B Instruct GGUF',
        capabilities: { streaming: true, tools: false, vision: false },
      },
    ],
  },

  ollama: {
    id: 'ollama',
    name: 'Ollama',
    type: 'openai',
    defaultBaseUrl: 'http://localhost:11434/v1',
    requiresApiKey: false,
    icon: '/logos/ollama.svg',
    models: [
      {
        id: 'llama3.3',
        name: 'Llama 3.3 70B',
        contextWindow: 131072,
        outputWindow: 4096,
        capabilities: { streaming: true, tools: true, vision: false },
      },
      {
        id: 'gemma3',
        name: 'Gemma 3 12B',
        contextWindow: 131072,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: true, vision: true },
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1',
        contextWindow: 131072,
        outputWindow: 8192,
        capabilities: { streaming: true, tools: false, vision: false },
      },
    ],
  },
};

/**
 * 需要 `dark:invert` 滤镜的单色 logo 提供商集合。
 *
 * 这些提供商的 logo 是单色深色图标，在暗色主题下需要 CSS 反色处理。
 * 与 Web 端 `lib/ai/providers.ts` 中的 `MONO_LOGO_PROVIDERS` 保持一致。
 */
export const MONO_LOGO_PROVIDERS: Set<string> = new Set(['openai', 'openrouter', 'ollama']);

/**
 * TTS 提供商映射（仅元信息，用于 UI 展示与下拉选择）。
 *
 * 详细配置（apiKey / baseUrl / voices 等）由 `settingsStore.ttsProvidersConfig` 持久化。
 */
export const TTS_PROVIDERS: Record<TTSProviderId, { id: string; name: string; icon?: string }> = {
  'openai-tts': { id: 'openai-tts', name: 'OpenAI TTS', icon: '/logos/openai.svg' },
  'azure-tts': { id: 'azure-tts', name: 'Azure TTS', icon: '/logos/azure.svg' },
  'glm-tts': { id: 'glm-tts', name: 'GLM TTS', icon: '/logos/glm.svg' },
  'qwen-tts': { id: 'qwen-tts', name: 'Qwen TTS (阿里云百炼)', icon: '/logos/bailian.svg' },
  'voxcpm-tts': { id: 'voxcpm-tts', name: 'VoxCPM2', icon: '/logos/voxcpm-icon.png' },
  'doubao-tts': { id: 'doubao-tts', name: '豆包 TTS 2.0（火山引擎）', icon: '/logos/doubao.svg' },
  'elevenlabs-tts': {
    id: 'elevenlabs-tts',
    name: 'ElevenLabs TTS',
    icon: '/logos/elevenlabs.svg',
  },
  'minimax-tts': { id: 'minimax-tts', name: 'MiniMax TTS', icon: '/logos/minimax.svg' },
  'lemonade-tts': { id: 'lemonade-tts', name: 'Lemonade TTS', icon: '/logos/lemonade.svg' },
  'browser-native-tts': {
    id: 'browser-native-tts',
    name: '浏览器原生 (Web Speech API)',
    icon: '/logos/browser.svg',
  },
};

/**
 * ASR 提供商映射（仅元信息，用于 UI 展示与下拉选择）。
 *
 * 详细配置由 `settingsStore.asrProvidersConfig` 持久化。
 */
export const ASR_PROVIDERS: Record<ASRProviderId, { id: string; name: string; icon?: string }> = {
  'openai-whisper': {
    id: 'openai-whisper',
    name: 'OpenAI Whisper',
    icon: '/logos/openai.svg',
  },
  'browser-native': {
    id: 'browser-native',
    name: '浏览器原生 ASR (Web Speech API)',
    icon: '/logos/browser.svg',
  },
  'qwen-asr': { id: 'qwen-asr', name: 'Qwen ASR (阿里云百炼)', icon: '/logos/bailian.svg' },
  'azure-asr': { id: 'azure-asr', name: 'Azure STT', icon: '/logos/azure.svg' },
  'lemonade-asr': { id: 'lemonade-asr', name: 'Lemonade ASR', icon: '/logos/lemonade.svg' },
};

/**
 * PDF 提供商映射（仅元信息，用于 UI 展示与下拉选择）。
 *
 * 详细配置由 `settingsStore.pdfProvidersConfig` 持久化。
 */
export const PDF_PROVIDERS: Record<PDFProviderId, { id: string; name: string; icon?: string }> = {
  mineru: { id: 'mineru', name: 'MinerU', icon: '/logos/mineru.png' },
  alidocmind: { id: 'alidocmind', name: 'AliDocMind', icon: '/logos/aliyun.svg' },
  unpdf: { id: 'unpdf', name: 'unpdf', icon: '/logos/unpdf.svg' },
};

/**
 * 图片生成提供商映射（仅 id 与 name，用于 UI 下拉选择）。
 *
 * 模型与 baseUrl 配置由 `settingsStore.imageProvidersConfig` 持久化。
 */
export const IMAGE_PROVIDERS: Record<ImageProviderId, { id: string; name: string }> = {
  seedream: { id: 'seedream', name: 'Seedream' },
  'openai-image': { id: 'openai-image', name: 'OpenAI Image' },
  'qwen-image': { id: 'qwen-image', name: 'Qwen Image' },
  'nano-banana': { id: 'nano-banana', name: 'Nano Banana (Gemini)' },
  'minimax-image': { id: 'minimax-image', name: 'MiniMax Image' },
  'grok-image': { id: 'grok-image', name: 'Grok Image' },
  'comfyui-image': { id: 'comfyui-image', name: 'ComfyUI Image' },
  lemonade: { id: 'lemonade', name: 'Lemonade' },
};

/**
 * 视频生成提供商映射（仅 id 与 name，用于 UI 下拉选择）。
 *
 * 模型与 baseUrl 配置由 `settingsStore.videoProvidersConfig` 持久化。
 */
export const VIDEO_PROVIDERS: Record<VideoProviderId, { id: string; name: string }> = {
  seedance: { id: 'seedance', name: 'Seedance' },
  kling: { id: 'kling', name: 'Kling' },
  veo: { id: 'veo', name: 'Veo' },
  sora: { id: 'sora', name: 'Sora' },
  'minimax-video': { id: 'minimax-video', name: 'MiniMax Video' },
  'grok-video': { id: 'grok-video', name: 'Grok Video' },
  happyhorse: { id: 'happyhorse', name: 'Happy Horse' },
};

/**
 * Web 搜索提供商映射（仅 id 与 name，用于 UI 下拉选择）。
 *
 * 详细配置由 `settingsStore.webSearchProvidersConfig` 持久化。
 */
export const WEB_SEARCH_PROVIDERS: Record<WebSearchProviderId, { id: string; name: string }> = {
  tavily: { id: 'tavily', name: 'Tavily' },
  brave: { id: 'brave', name: 'Brave Search' },
  bocha: { id: 'bocha', name: 'Bocha' },
  baidu: { id: 'baidu', name: 'Baidu' },
  doubao: { id: 'doubao', name: 'Doubao' },
  minimax: { id: 'minimax', name: 'MiniMax' },
  searxng: { id: 'searxng', name: 'SearXNG' },
};
