/**
 * @file settingsStore.ts
 * @description 移动端设置状态 Zustand store。
 *
 * 使用 `zustand` + `persist` 中间件持久化整个设置状态。
 *
 * 持久化后端：`expo-secure-store`（iOS Keychain / Android Keystore）。
 *
 * 📌 生产环境迁移说明：
 * 本实现将所有设置（包括 API Key 等敏感数据）统一序列化为一个 JSON 字符串，
 * 通过 `expo-secure-store` 单 key 存储。这简化了实现，但牺牲了细粒度的密钥
 * 轮换与隔离能力。生产环境若需要更严格的密钥管理（例如：每个 provider 的
 * apiKey 单独存储在独立的 Keychain item 中，支持生物识别解锁、密钥轮换等），
 * 应迁移到基于 `SecureKeyStore`（apps/expo/src/core/security/SecureKeyStore.ts）
 * 的分片存储方案，并将非敏感字段（如 providerId、modelId）降级到 AsyncStorage。
 *
 * 严格隔离规则：
 * - 仅依赖 `zustand`、`expo-secure-store`、`./types`、`./constants`
 * - 不引用 `@openmaic/storage` 运行时
 * - 不引用 `@ai-sdk/*` / `lib/ai/*` / `lib/audio/*` 等 Web 端包
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type {
  ProviderId,
  ProvidersConfig,
  ProviderSettings,
  TTSProviderId,
  TTSProviderConfig,
  ASRProviderId,
  ASRProviderConfig,
  PDFProviderId,
  GenericProviderConfig,
  ImageProviderId,
  VideoProviderId,
  WebSearchProviderId,
} from './types';
import { PROVIDERS, TTS_PROVIDERS, ASR_PROVIDERS } from './constants';

/** 持久化到 SecureStore 的 key 名（命名空间：openmaic_）。 */
const STORAGE_KEY = 'openmaic_settings_v1';

/**
 * 自定义 zustand persist 的 StateStorage 适配器。
 * 使用 `expo-secure-store` 作为底层存储，仅在设备解锁后可访问。
 */
const secureStorage = {
  /** 读取持久化 JSON 字符串。 */
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.warn(`[settingsStore] Failed to read "${name}" from SecureStore:`, error);
      return null;
    }
  },
  /** 写入持久化 JSON 字符串。 */
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      console.warn(`[settingsStore] Failed to write "${name}" to SecureStore:`, error);
    }
  },
  /** 删除持久化项。 */
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.warn(`[settingsStore] Failed to delete "${name}" from SecureStore:`, error);
    }
  },
};

/**
 * 遍历 `PROVIDERS` 常量生成默认 LLM 提供商配置。
 *
 * 每个内置提供商的初始状态：
 * - `apiKey: ''`（未配置）
 * - `baseUrl`: 取自常量的 `defaultBaseUrl`
 * - `isBuiltIn: true`
 * - `requiresApiKey` / `models` / `name` / `type` / `icon` 全部取自常量
 */
function buildDefaultProvidersConfig(): ProvidersConfig {
  const config: ProvidersConfig = {};
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    const settings: ProviderSettings = {
      apiKey: '',
      baseUrl: provider.defaultBaseUrl ?? '',
      models: provider.models,
      name: provider.name,
      type: provider.type,
      defaultBaseUrl: provider.defaultBaseUrl,
      icon: provider.icon,
      requiresApiKey: provider.requiresApiKey,
      isBuiltIn: true,
    };
    config[providerId] = settings;
  }
  return config;
}

/**
 * 遍历 `TTS_PROVIDERS` 常量生成默认 TTS 提供商配置。
 * 所有内置 TTS 提供商默认 `enabled: false`、`apiKey: ''`、`baseUrl: ''`。
 */
function buildDefaultTTSProvidersConfig(): Record<string, TTSProviderConfig> {
  const config: Record<string, TTSProviderConfig> = {};
  for (const providerId of Object.keys(TTS_PROVIDERS)) {
    config[providerId] = {
      apiKey: '',
      baseUrl: '',
      enabled: false,
      isBuiltIn: true,
    };
  }
  return config;
}

/**
 * 遍历 `ASR_PROVIDERS` 常量生成默认 ASR 提供商配置。
 * 所有内置 ASR 提供商默认 `enabled: false`、`apiKey: ''`、`baseUrl: ''`。
 */
function buildDefaultASRProvidersConfig(): Record<string, ASRProviderConfig> {
  const config: Record<string, ASRProviderConfig> = {};
  for (const providerId of Object.keys(ASR_PROVIDERS)) {
    config[providerId] = {
      apiKey: '',
      baseUrl: '',
      enabled: false,
      isBuiltIn: true,
    };
  }
  return config;
}

/** 生成 PDF 提供商默认配置（mineru / alidocmind / unpdf）。 */
function buildDefaultPDFProvidersConfig(): Record<string, GenericProviderConfig> {
  return {
    mineru: { apiKey: '', baseUrl: '', enabled: false },
    alidocmind: { apiKey: '', baseUrl: '', enabled: false },
    unpdf: { apiKey: '', baseUrl: '', enabled: false },
  };
}

/** 生成图片生成提供商默认配置。 */
function buildDefaultImageProvidersConfig(): Record<string, GenericProviderConfig> {
  return {
    seedream: { apiKey: '', baseUrl: '', enabled: false },
    'openai-image': { apiKey: '', baseUrl: '', enabled: false },
    'qwen-image': { apiKey: '', baseUrl: '', enabled: false },
    'nano-banana': { apiKey: '', baseUrl: '', enabled: false },
    'minimax-image': { apiKey: '', baseUrl: '', enabled: false },
    'grok-image': { apiKey: '', baseUrl: '', enabled: false },
    'comfyui-image': { apiKey: '', baseUrl: '', enabled: false },
    lemonade: { apiKey: '', baseUrl: '', enabled: false },
  };
}

/** 生成视频生成提供商默认配置。 */
function buildDefaultVideoProvidersConfig(): Record<string, GenericProviderConfig> {
  return {
    seedance: { apiKey: '', baseUrl: '', enabled: false },
    kling: { apiKey: '', baseUrl: '', enabled: false },
    veo: { apiKey: '', baseUrl: '', enabled: false },
    sora: { apiKey: '', baseUrl: '', enabled: false },
    'minimax-video': { apiKey: '', baseUrl: '', enabled: false },
    'grok-video': { apiKey: '', baseUrl: '', enabled: false },
    happyhorse: { apiKey: '', baseUrl: '', enabled: false },
  };
}

/** 生成 Web 搜索提供商默认配置。 */
function buildDefaultWebSearchProvidersConfig(): Record<string, GenericProviderConfig> {
  return {
    tavily: { apiKey: '', baseUrl: '', enabled: false },
    brave: { apiKey: '', baseUrl: '', enabled: false },
    bocha: { apiKey: '', baseUrl: '', enabled: false },
    baidu: { apiKey: '', baseUrl: '', enabled: false },
    doubao: { apiKey: '', baseUrl: '', enabled: false },
    minimax: { apiKey: '', baseUrl: '', enabled: false },
    searxng: { apiKey: '', baseUrl: '', enabled: false },
  };
}

/**
 * 设置状态 Store 接口。
 *
 * 包含 LLM / TTS / ASR / PDF / Image / Video / WebSearch 七类提供商的
 * 当前选择、配置映射以及对应的 action 方法。
 */
export interface SettingsState {
  // ===== LLM 提供商 =====
  /** 当前选中的 LLM 提供商 ID。 */
  providerId: ProviderId;
  /** 当前选中的 LLM 模型 ID（属于 providerId 对应的提供商）。 */
  modelId: string;
  /** 所有 LLM 提供商的配置映射（内置 + 自定义）。 */
  providersConfig: ProvidersConfig;

  // ===== TTS 提供商 =====
  /** 当前选中的 TTS 提供商 ID。 */
  ttsProviderId: TTSProviderId;
  /** 当前选中的 TTS 音色 ID。 */
  ttsVoice: string;
  /** TTS 播放速度（0.25 ~ 4.0，默认 1.0）。 */
  ttsSpeed: number;
  /** 全局 TTS 开关。 */
  ttsEnabled: boolean;
  /** 所有 TTS 提供商的配置映射。 */
  ttsProvidersConfig: Record<string, TTSProviderConfig>;

  // ===== ASR 提供商 =====
  /** 当前选中的 ASR 提供商 ID。 */
  asrProviderId: ASRProviderId;
  /** 当前 ASR 识别语言代码（如 'zh'、'en'、'auto'）。 */
  asrLanguage: string;
  /** 全局 ASR 开关。 */
  asrEnabled: boolean;
  /** 所有 ASR 提供商的配置映射。 */
  asrProvidersConfig: Record<string, ASRProviderConfig>;

  // ===== PDF 提供商 =====
  /** 当前选中的 PDF 解析提供商 ID。 */
  pdfProviderId: PDFProviderId;
  /** 所有 PDF 提供商的配置映射。 */
  pdfProvidersConfig: Record<string, GenericProviderConfig>;

  // ===== 图片生成提供商 =====
  /** 当前选中的图片生成提供商 ID。 */
  imageProviderId: ImageProviderId;
  /** 当前选中的图片生成模型 ID。 */
  imageModelId: string;
  /** 所有图片生成提供商的配置映射。 */
  imageProvidersConfig: Record<string, GenericProviderConfig>;

  // ===== 视频生成提供商 =====
  /** 当前选中的视频生成提供商 ID。 */
  videoProviderId: VideoProviderId;
  /** 当前选中的视频生成模型 ID。 */
  videoModelId: string;
  /** 所有视频生成提供商的配置映射。 */
  videoProvidersConfig: Record<string, GenericProviderConfig>;

  // ===== Web 搜索提供商 =====
  /** 当前选中的 Web 搜索提供商 ID。 */
  webSearchProviderId: WebSearchProviderId;
  /** 所有 Web 搜索提供商的配置映射。 */
  webSearchProvidersConfig: Record<string, GenericProviderConfig>;

  // ===== Actions: LLM =====
  /** 切换 LLM 提供商，并重置 modelId 为该提供商的第一个模型。 */
  setProvider: (providerId: ProviderId) => void;
  /** 切换当前 LLM 提供商下的模型。 */
  setModel: (modelId: string) => void;
  /** 更新单个 LLM 提供商的配置（Partial 合并）。 */
  setProviderConfig: (providerId: ProviderId, config: Partial<ProviderSettings>) => void;
  /** 替换整个 providersConfig。 */
  setProvidersConfig: (config: ProvidersConfig) => void;

  // ===== Actions: TTS =====
  /** 切换 TTS 提供商。 */
  setTTSProvider: (providerId: TTSProviderId) => void;
  /** 更新单个 TTS 提供商的配置（Partial 合并）。 */
  setTTSProviderConfig: (providerId: TTSProviderId, config: Partial<TTSProviderConfig>) => void;
  /** 新增一个自定义 TTS 提供商（以 `custom-tts-` 前缀）。 */
  addCustomTTSProvider: (providerId: `custom-tts-${string}`, config: TTSProviderConfig) => void;

  // ===== Actions: ASR =====
  /** 切换 ASR 提供商。 */
  setASRProvider: (providerId: ASRProviderId) => void;
  /** 更新单个 ASR 提供商的配置（Partial 合并）。 */
  setASRProviderConfig: (providerId: ASRProviderId, config: Partial<ASRProviderConfig>) => void;
  /** 新增一个自定义 ASR 提供商（以 `custom-asr-` 前缀）。 */
  addCustomASRProvider: (providerId: `custom-asr-${string}`, config: ASRProviderConfig) => void;

  // ===== Actions: PDF =====
  /** 切换 PDF 提供商。 */
  setPDFProvider: (providerId: PDFProviderId) => void;
  /** 更新单个 PDF 提供商的配置（Partial 合并）。 */
  setPDFProviderConfig: (providerId: PDFProviderId, config: Partial<GenericProviderConfig>) => void;

  // ===== Actions: Image =====
  /** 切换图片生成提供商。 */
  setImageProvider: (providerId: ImageProviderId) => void;
  /** 更新单个图片生成提供商的配置（Partial 合并）。 */
  setImageProviderConfig: (
    providerId: ImageProviderId,
    config: Partial<GenericProviderConfig>,
  ) => void;

  // ===== Actions: Video =====
  /** 切换视频生成提供商。 */
  setVideoProvider: (providerId: VideoProviderId) => void;
  /** 更新单个视频生成提供商的配置（Partial 合并）。 */
  setVideoProviderConfig: (
    providerId: VideoProviderId,
    config: Partial<GenericProviderConfig>,
  ) => void;

  // ===== Actions: WebSearch =====
  /** 切换 Web 搜索提供商。 */
  setWebSearchProvider: (providerId: WebSearchProviderId) => void;
  /** 更新单个 Web 搜索提供商的配置（Partial 合并）。 */
  setWebSearchProviderConfig: (
    providerId: WebSearchProviderId,
    config: Partial<GenericProviderConfig>,
  ) => void;
}

/**
 * 移动端设置状态 Zustand hook。
 *
 * 使用示例：
 * ```ts
 * const providerId = useSettingsStore((s) => s.providerId);
 * const setProvider = useSettingsStore((s) => s.setProvider);
 * ```
 *
 * 状态会在变更后自动异步持久化到 `expo-secure-store`。
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // ===== LLM =====
      providerId: 'openai',
      modelId: 'gpt-4o',
      providersConfig: buildDefaultProvidersConfig(),

      // ===== TTS =====
      ttsProviderId: 'openai-tts',
      ttsVoice: 'alloy',
      ttsSpeed: 1.0,
      ttsEnabled: false,
      ttsProvidersConfig: buildDefaultTTSProvidersConfig(),

      // ===== ASR =====
      asrProviderId: 'openai-whisper',
      asrLanguage: 'auto',
      asrEnabled: false,
      asrProvidersConfig: buildDefaultASRProvidersConfig(),

      // ===== PDF =====
      pdfProviderId: 'unpdf',
      pdfProvidersConfig: buildDefaultPDFProvidersConfig(),

      // ===== Image =====
      imageProviderId: 'seedream',
      imageModelId: '',
      imageProvidersConfig: buildDefaultImageProvidersConfig(),

      // ===== Video =====
      videoProviderId: 'seedance',
      videoModelId: '',
      videoProvidersConfig: buildDefaultVideoProvidersConfig(),

      // ===== WebSearch =====
      webSearchProviderId: 'tavily',
      webSearchProvidersConfig: buildDefaultWebSearchProvidersConfig(),

      // ===== Actions: LLM =====
      setProvider: (providerId) =>
        set((state) => {
          const providerConfig = state.providersConfig[providerId];
          const firstModel = providerConfig?.models?.[0]?.id ?? '';
          return { providerId, modelId: firstModel };
        }),

      setModel: (modelId) => set({ modelId }),

      setProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.providersConfig[providerId];
          if (!existing) return state;
          return {
            providersConfig: {
              ...state.providersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),

      setProvidersConfig: (config) => set({ providersConfig: config }),

      // ===== Actions: TTS =====
      setTTSProvider: (providerId) => set({ ttsProviderId: providerId }),

      setTTSProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.ttsProvidersConfig[providerId];
          if (!existing) return state;
          return {
            ttsProvidersConfig: {
              ...state.ttsProvidersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),

      addCustomTTSProvider: (providerId, config) =>
        set((state) => ({
          ttsProvidersConfig: {
            ...state.ttsProvidersConfig,
            [providerId]: { ...config, isBuiltIn: false },
          },
        })),

      // ===== Actions: ASR =====
      setASRProvider: (providerId) => set({ asrProviderId: providerId }),

      setASRProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.asrProvidersConfig[providerId];
          if (!existing) return state;
          return {
            asrProvidersConfig: {
              ...state.asrProvidersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),

      addCustomASRProvider: (providerId, config) =>
        set((state) => ({
          asrProvidersConfig: {
            ...state.asrProvidersConfig,
            [providerId]: { ...config, isBuiltIn: false },
          },
        })),

      // ===== Actions: PDF =====
      setPDFProvider: (providerId) => set({ pdfProviderId: providerId }),

      setPDFProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.pdfProvidersConfig[providerId];
          if (!existing) return state;
          return {
            pdfProvidersConfig: {
              ...state.pdfProvidersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),

      // ===== Actions: Image =====
      setImageProvider: (providerId) => set({ imageProviderId: providerId }),

      setImageProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.imageProvidersConfig[providerId];
          if (!existing) return state;
          return {
            imageProvidersConfig: {
              ...state.imageProvidersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),

      // ===== Actions: Video =====
      setVideoProvider: (providerId) => set({ videoProviderId: providerId }),

      setVideoProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.videoProvidersConfig[providerId];
          if (!existing) return state;
          return {
            videoProvidersConfig: {
              ...state.videoProvidersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),

      // ===== Actions: WebSearch =====
      setWebSearchProvider: (providerId) => set({ webSearchProviderId: providerId }),

      setWebSearchProviderConfig: (providerId, config) =>
        set((state) => {
          const existing = state.webSearchProvidersConfig[providerId];
          if (!existing) return state;
          return {
            webSearchProvidersConfig: {
              ...state.webSearchProvidersConfig,
              [providerId]: { ...existing, ...config },
            },
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),
      // 仅持久化数据字段，跳过所有 action 方法
      partialize: (state) => ({
        providerId: state.providerId,
        modelId: state.modelId,
        providersConfig: state.providersConfig,
        ttsProviderId: state.ttsProviderId,
        ttsVoice: state.ttsVoice,
        ttsSpeed: state.ttsSpeed,
        ttsEnabled: state.ttsEnabled,
        ttsProvidersConfig: state.ttsProvidersConfig,
        asrProviderId: state.asrProviderId,
        asrLanguage: state.asrLanguage,
        asrEnabled: state.asrEnabled,
        asrProvidersConfig: state.asrProvidersConfig,
        pdfProviderId: state.pdfProviderId,
        pdfProvidersConfig: state.pdfProvidersConfig,
        imageProviderId: state.imageProviderId,
        imageModelId: state.imageModelId,
        imageProvidersConfig: state.imageProvidersConfig,
        videoProviderId: state.videoProviderId,
        videoModelId: state.videoModelId,
        videoProvidersConfig: state.videoProvidersConfig,
        webSearchProviderId: state.webSearchProviderId,
        webSearchProvidersConfig: state.webSearchProvidersConfig,
      }),
      version: 1,
    },
  ),
);
