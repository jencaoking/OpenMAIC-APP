/**
 * @file SettingsScreen.tsx
 * @description 移动端设置主屏幕。
 *
 * 对应 Web 端 `components/settings/index.tsx` 的 `SettingsDialog`。
 *
 * Web 端是三栏布局（左侧导航 + 中间提供商列表 + 右侧配置面板），
 * 移动端适配为单栏"列表 → 详情"导航式布局：
 * - 顶部 Header（标题 + 关闭按钮）
 * - 水平滚动的分区标签条（替代 Web 端左侧导航栏）
 * - 主内容区域：
 *   - 当未选中 provider 时：显示 `ProviderListColumn`
 *   - 当选中 provider 时：显示 `ProviderConfigPanel`（仅 LLM providers 分区）
 *     或占位面板（其他分区，本次任务未要求实现完整配置面板）
 *
 * 严格隔离规则：
 * - 仅使用 react-native 原生组件 + settings 模块内的组件
 * - 不引用任何 Web 端包
 * - 不引用 @openmaic/storage 运行时
 */

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSettingsI18n } from './i18n';
import { useSettingsStore } from './settingsStore';
import {
  ASR_PROVIDERS,
  IMAGE_PROVIDERS,
  PDF_PROVIDERS,
  PROVIDERS,
  TTS_PROVIDERS,
  VIDEO_PROVIDERS,
  WEB_SEARCH_PROVIDERS,
} from './constants';
import { ProviderConfigPanel } from './components/ProviderConfigPanel';
import type { ProviderConfigPanelProps } from './components/ProviderConfigPanel';
import { ProviderListColumn } from './components/ProviderListColumn';
import type { ProviderListItem } from './components/ProviderListColumn';
import { colors, IconButton } from './components/ui';
import type {
  ProviderConfig,
  ProviderId,
  ProvidersConfig,
  SettingsSection,
} from './types';

/**
 * `SettingsScreen` 组件 props。
 */
export interface SettingsScreenProps {
  /** 关闭设置屏幕的回调（由父级导航调用） */
  onBack: () => void;
  /** 初始打开的分区，默认为 `providers` */
  initialSection?: SettingsSection;
}

/**
 * 分区标签元数据。
 */
interface SectionTab {
  /** 分区 ID */
  id: SettingsSection;
  /** 显示文本（已翻译） */
  label: string;
  /** Unicode 字形（用作图标占位） */
  glyph: string;
}

/**
 * 需要显示 provider 列表的分区集合。
 */
const SECTIONS_WITH_PROVIDER_LIST: ReadonlySet<SettingsSection> = new Set<SettingsSection>([
  'providers',
  'pdf',
  'web-search',
  'image',
  'video',
  'tts',
  'asr',
]);

/**
 * Image provider id → i18n key 后缀映射。
 * 例：'openai-image' → 'settings.providerOpenAIImage'
 */
const IMAGE_PROVIDER_NAME_KEYS: Record<string, string> = {
  seedream: 'settings.providerSeedream',
  'openai-image': 'settings.providerOpenAIImage',
  'qwen-image': 'settings.providerQwenImage',
  'nano-banana': 'settings.providerNanoBanana',
  'minimax-image': 'settings.providerMiniMaxImage',
  'grok-image': 'settings.providerGrokImage',
  'comfyui-image': 'settings.providerComfyUIImage',
  lemonade: 'settings.providerLemonadeImage',
};

/**
 * Video provider id → i18n key 后缀映射。
 * 例：'minimax-video' → 'settings.providerMiniMaxVideo'
 */
const VIDEO_PROVIDER_NAME_KEYS: Record<string, string> = {
  seedance: 'settings.providerSeedance',
  kling: 'settings.providerKling',
  veo: 'settings.providerVeo',
  sora: 'settings.providerSora',
  'minimax-video': 'settings.providerMiniMaxVideo',
  'grok-video': 'settings.providerGrokVideo',
  happyhorse: 'settings.providerHappyHorse',
};

/**
 * TTS provider id → i18n key 映射。
 */
const TTS_PROVIDER_NAME_KEYS: Record<string, string> = {
  'openai-tts': 'settings.providerOpenAITTS',
  'azure-tts': 'settings.providerAzureTTS',
  'glm-tts': 'settings.providerGLMTTS',
  'qwen-tts': 'settings.providerQwenTTS',
  'voxcpm-tts': 'settings.providerVoxCPMTTS',
  'doubao-tts': 'settings.providerDoubaoTTS',
  'elevenlabs-tts': 'settings.providerElevenLabsTTS',
  'minimax-tts': 'settings.providerMiniMaxTTS',
  'lemonade-tts': 'settings.providerLemonadeTTS',
  'browser-native-tts': 'settings.providerBrowserNativeTTS',
};

/**
 * ASR provider id → i18n key 映射。
 */
const ASR_PROVIDER_NAME_KEYS: Record<string, string> = {
  'openai-whisper': 'settings.providerOpenAIWhisper',
  'browser-native': 'settings.providerBrowserNative',
  'qwen-asr': 'settings.providerQwenASR',
  'azure-asr': 'settings.providerAzureASR',
  'lemonade-asr': 'settings.providerLemonadeASR',
};

/**
 * 设置主屏幕（RN 版）。
 *
 * @example
 * ```tsx
 * <SettingsScreen onBack={() => navigation.goBack()} initialSection="providers" />
 * ```
 */
export function SettingsScreen({ onBack, initialSection }: SettingsScreenProps): ReactNode {
  const { t } = useSettingsI18n();

  // ===== Store 状态 =====
  const providersConfig = useSettingsStore((s) => s.providersConfig);
  const setProviderConfig = useSettingsStore((s) => s.setProviderConfig);
  const pdfProvidersConfig = useSettingsStore((s) => s.pdfProvidersConfig);
  const webSearchProvidersConfig = useSettingsStore((s) => s.webSearchProvidersConfig);
  const imageProvidersConfig = useSettingsStore((s) => s.imageProvidersConfig);
  const videoProvidersConfig = useSettingsStore((s) => s.videoProvidersConfig);
  const ttsProvidersConfig = useSettingsStore((s) => s.ttsProvidersConfig);
  const asrProvidersConfig = useSettingsStore((s) => s.asrProvidersConfig);

  // ===== 本地导航状态 =====
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    initialSection ?? 'providers',
  );
  /** 每个分区独立的"已选 provider id"，null 表示显示列表 */
  const [selectedBySection, setSelectedBySection] = useState<Record<string, string | null>>({});

  // 当 initialSection 变化时同步
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // ===== 分区标签 =====
  const sectionTabs: SectionTab[] = useMemo(
    () => [
      { id: 'token-plan', label: t('settings.tokenPlan.nav'), glyph: '\u{1F4B3}' },
      { id: 'providers', label: t('settings.providers'), glyph: '\u{1F4E6}' },
      { id: 'image', label: t('settings.imageSettings'), glyph: '\u{1F5BC}' },
      { id: 'video', label: t('settings.videoSettings'), glyph: '\u{1F3AC}' },
      { id: 'tts', label: t('settings.ttsSettings'), glyph: '\u{1F50A}' },
      { id: 'asr', label: t('settings.asrSettings'), glyph: '\u{1F3A4}' },
      { id: 'pdf', label: t('settings.documentParsingSettings'), glyph: '\u{1F4C4}' },
      { id: 'web-search', label: t('settings.webSearchSettings'), glyph: '\u{1F50D}' },
      { id: 'general', label: t('settings.systemSettings'), glyph: '\u2699' },
    ],
    [t],
  );

  // ===== 当前选中 provider =====
  const currentSelectedId = selectedBySection[activeSection] ?? null;

  /**
   * 设置某分区的选中 provider。
   */
  const setSelectedProvider = (section: SettingsSection, id: string | null): void => {
    setSelectedBySection((prev) => ({ ...prev, [section]: id }));
  };

  /**
   * 顶部返回按钮：
   * - 若当前在 provider 详情视图，则回到列表
   * - 否则关闭整个设置屏幕
   */
  const handleBack = (): void => {
    if (currentSelectedId !== null) {
      setSelectedProvider(activeSection, null);
    } else {
      onBack();
    }
  };

  // ===== 当前分区的 provider 列表与配置查询表 =====
  const { providerList, configsLookup } = useMemo<{
    providerList: ProviderListItem<string>[];
    configsLookup: Record<string, { isServerConfigured?: boolean }>;
  }>(() => {
    return buildProviderListForSection(
      activeSection,
      providersConfig,
      pdfProvidersConfig,
      webSearchProvidersConfig,
      imageProvidersConfig,
      videoProvidersConfig,
      ttsProvidersConfig,
      asrProvidersConfig,
      t,
    );
  }, [
    activeSection,
    providersConfig,
    pdfProvidersConfig,
    webSearchProvidersConfig,
    imageProvidersConfig,
    videoProvidersConfig,
    ttsProvidersConfig,
    asrProvidersConfig,
    t,
  ]);

  // ===== 当前选中 provider 的元信息（仅 providers 分区需要传给 ProviderConfigPanel） =====
  const selectedProviderConfig: ProviderConfig | null = useMemo(() => {
    if (activeSection !== 'providers' || currentSelectedId === null) {
      return null;
    }
    const cfg = providersConfig[currentSelectedId];
    if (!cfg) return null;
    const builtin = PROVIDERS[currentSelectedId];
    return {
      id: currentSelectedId as ProviderId,
      name: cfg.name,
      type: cfg.type,
      defaultBaseUrl: cfg.defaultBaseUrl,
      baseUrlPlaceholder: builtin?.baseUrlPlaceholder,
      supportsModelDiscovery: builtin?.supportsModelDiscovery,
      alternateBaseUrls: builtin?.alternateBaseUrls,
      requiresApiKey: cfg.requiresApiKey,
      icon: cfg.icon,
      models: cfg.models,
    };
  }, [activeSection, currentSelectedId, providersConfig]);

  // ===== ProviderConfigPanel 回调 =====
  const handleConfigChange: ProviderConfigPanelProps['onConfigChange'] = (
    apiKey,
    baseUrl,
    requiresApiKey,
  ) => {
    if (currentSelectedId === null) return;
    setProviderConfig(currentSelectedId as ProviderId, { apiKey, baseUrl, requiresApiKey });
  };

  const handleResetProvider = (): void => {
    if (currentSelectedId === null) return;
    const builtin = PROVIDERS[currentSelectedId];
    if (!builtin) return;
    setProviderConfig(currentSelectedId as ProviderId, { models: [...builtin.models] });
  };

  // ===== 渲染：当前层级 =====
  const renderContent = (): ReactNode => {
    // general / token-plan 直接显示占位
    if (activeSection === 'general') {
      return <PlaceholderPanel title={t('settings.systemSettings')} desc={t('settings.description')} />;
    }
    if (activeSection === 'token-plan') {
      return (
        <PlaceholderPanel title={t('settings.tokenPlan.nav')} desc={t('settings.tokenPlan.desc')} />
      );
    }

    // 不在 SECTIONS_WITH_PROVIDER_LIST 中的分区（理论不会到这里，仅兜底）
    if (!SECTIONS_WITH_PROVIDER_LIST.has(activeSection)) {
      return <PlaceholderPanel title={t(`settings.${activeSection}`)} desc={t('settings.description')} />;
    }

    // 列表层
    if (currentSelectedId === null) {
      return (
        <ProviderListColumn
          providers={providerList}
          configs={configsLookup}
          selectedId={currentSelectedId ?? ''}
          onSelect={(id) => setSelectedProvider(activeSection, id)}
          t={t}
        />
      );
    }

    // 详情层
    if (activeSection === 'providers' && selectedProviderConfig) {
      const cfg = providersConfig[currentSelectedId];
      return (
        <ProviderConfigPanel
          provider={selectedProviderConfig}
          initialApiKey={cfg?.apiKey ?? ''}
          initialBaseUrl={cfg?.baseUrl ?? ''}
          initialRequiresApiKey={cfg?.requiresApiKey ?? true}
          providersConfig={providersConfig}
          onConfigChange={handleConfigChange}
          onSave={() => {
            /* 移动端配置变更已即时写回 store，此处无需额外动作 */
          }}
          onEditModel={() => {
            /* 模型编辑对话框待后续实现 */
          }}
          onDeleteModel={(index) => {
            if (currentSelectedId === null) return;
            const currentModels = providersConfig[currentSelectedId]?.models ?? [];
            const nextModels = currentModels.filter((_, i) => i !== index);
            setProviderConfig(currentSelectedId as ProviderId, { models: nextModels });
          }}
          onAddModel={() => {
            /* 添加模型对话框待后续实现 */
          }}
          onModelsFetched={(ids) => {
            if (currentSelectedId === null) return 0;
            const currentModels = providersConfig[currentSelectedId]?.models ?? [];
            const kept = currentModels.filter((m) => m.source !== 'probed');
            const keptIds = new Set(kept.map((m) => m.id));
            const additions = ids
              .filter((id) => !keptIds.has(id))
              .map((id) => ({ id, name: id, source: 'probed' as const }));
            const next = [...kept, ...additions];
            if (additions.length > 0 || next.length !== currentModels.length) {
              setProviderConfig(currentSelectedId as ProviderId, { models: next });
            }
            return additions.length;
          }}
          modelsUrl={cfg?.modelsUrl}
          onResetToDefault={handleResetProvider}
          isBuiltIn={cfg?.isBuiltIn ?? true}
        />
      );
    }

    // 非 providers 分区选中 provider 后：占位面板
    const selectedName =
      providerList.find((p) => p.id === currentSelectedId)?.name ?? currentSelectedId;
    return <PlaceholderPanel title={selectedName} desc={t('settings.description')} />;
  };

  // ===== 顶部 Header 标题 =====
  const headerTitle = useMemo(() => {
    if (currentSelectedId !== null) {
      const selectedName =
        providerList.find((p) => p.id === currentSelectedId)?.name ?? currentSelectedId;
      return selectedName;
    }
    const tab = sectionTabs.find((s) => s.id === activeSection);
    return tab?.label ?? t('settings.title');
  }, [activeSection, currentSelectedId, providerList, sectionTabs, t]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={handleBack} size={22} color={colors.foreground} />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <IconButton icon="close" onPress={onBack} size={20} color={colors.muted} />
      </View>

      {/* 分区标签条 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabsBar}
      >
        {sectionTabs.map((tab) => {
          const active = tab.id === activeSection;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                setActiveSection(tab.id);
                setSelectedProvider(tab.id, null);
              }}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={styles.tabGlyph}>{tab.glyph}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 主内容区 */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

/**
 * 占位面板 props。
 */
interface PlaceholderPanelProps {
  /** 占位面板标题 */
  title: string;
  /** 占位描述文本 */
  desc: string;
}

/**
 * 占位面板（用于 general / token-plan / 未实现的分区配置面板）。
 *
 * 提示用户该分区配置面板将在后续迭代中实现。
 */
function PlaceholderPanel({ title, desc }: PlaceholderPanelProps): ReactNode {
  return (
    <ScrollView
      contentContainerStyle={styles.placeholderContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderDesc}>{desc}</Text>
        <View style={styles.placeholderBadge}>
          <Text style={styles.placeholderBadgeText}>{'TODO'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * 根据当前分区构造对应的 provider 列表与配置查询表。
 *
 * - providers: 取自 `providersConfig`（含内置 + 自定义 LLM 提供商）
 * - pdf: 取自 `PDF_PROVIDERS` 常量
 * - web-search: 取自 `WEB_SEARCH_PROVIDERS` 常量
 * - image: 取自 `IMAGE_PROVIDERS` 常量
 * - video: 取自 `VIDEO_PROVIDERS` 常量
 * - tts: 取自 `TTS_PROVIDERS` 常量 + 自定义 TTS 提供商
 * - asr: 取自 `ASR_PROVIDERS` 常量 + 自定义 ASR 提供商
 */
function buildProviderListForSection(
  section: SettingsSection,
  providersConfig: ProvidersConfig,
  pdfProvidersConfig: Record<string, { isServerConfigured?: boolean }>,
  webSearchProvidersConfig: Record<string, { isServerConfigured?: boolean }>,
  imageProvidersConfig: Record<string, { isServerConfigured?: boolean }>,
  videoProvidersConfig: Record<string, { isServerConfigured?: boolean }>,
  ttsProvidersConfig: Record<string, { customName?: string; isServerConfigured?: boolean }>,
  asrProvidersConfig: Record<string, { customName?: string; isServerConfigured?: boolean }>,
  t: (key: string) => string,
): {
  providerList: ProviderListItem<string>[];
  configsLookup: Record<string, { isServerConfigured?: boolean }>;
} {
  switch (section) {
    case 'providers': {
      const list: ProviderListItem<string>[] = Object.entries(providersConfig).map(
        ([id, cfg]) => {
          const translationKey = `settings.providerNames.${id}`;
          const translated = t(translationKey);
          return {
            id,
            name: translated !== translationKey ? translated : cfg.name,
            icon: cfg.icon,
          };
        },
      );
      return { providerList: list, configsLookup: providersConfig };
    }
    case 'pdf': {
      const list: ProviderListItem<string>[] = Object.values(PDF_PROVIDERS).map((p) => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
      }));
      return { providerList: list, configsLookup: pdfProvidersConfig };
    }
    case 'web-search': {
      const list: ProviderListItem<string>[] = Object.values(WEB_SEARCH_PROVIDERS).map((p) => {
        const translationKey = `settings.providerNames.${p.id}`;
        const translated = t(translationKey);
        return {
          id: p.id,
          name: translated !== translationKey ? translated : p.name,
        };
      });
      return { providerList: list, configsLookup: webSearchProvidersConfig };
    }
    case 'image': {
      const list: ProviderListItem<string>[] = Object.values(IMAGE_PROVIDERS).map((p) => {
        const key = IMAGE_PROVIDER_NAME_KEYS[p.id];
        const translated = key ? t(key) : null;
        return {
          id: p.id,
          name: translated && translated !== key ? translated : p.name,
        };
      });
      return { providerList: list, configsLookup: imageProvidersConfig };
    }
    case 'video': {
      const list: ProviderListItem<string>[] = Object.values(VIDEO_PROVIDERS).map((p) => {
        const key = VIDEO_PROVIDER_NAME_KEYS[p.id];
        const translated = key ? t(key) : null;
        return {
          id: p.id,
          name: translated && translated !== key ? translated : p.name,
        };
      });
      return { providerList: list, configsLookup: videoProvidersConfig };
    }
    case 'tts': {
      const list: ProviderListItem<string>[] = [
        ...Object.values(TTS_PROVIDERS).map((p) => {
          const key = TTS_PROVIDER_NAME_KEYS[p.id];
          const translated = key ? t(key) : null;
          return {
            id: p.id,
            name: translated && translated !== key ? translated : p.name,
            icon: p.icon,
          };
        }),
        ...Object.entries(ttsProvidersConfig)
          .filter(([id]) => id.startsWith('custom-tts-'))
          .map(([id, cfg]) => ({
            id,
            name: cfg.customName || id,
            icon: undefined,
          })),
      ];
      return { providerList: list, configsLookup: ttsProvidersConfig };
    }
    case 'asr': {
      const list: ProviderListItem<string>[] = [
        ...Object.values(ASR_PROVIDERS).map((p) => {
          const key = ASR_PROVIDER_NAME_KEYS[p.id];
          const translated = key ? t(key) : null;
          return {
            id: p.id,
            name: translated && translated !== key ? translated : p.name,
            icon: p.icon,
          };
        }),
        ...Object.entries(asrProvidersConfig)
          .filter(([id]) => id.startsWith('custom-asr-'))
          .map(([id, cfg]) => ({
            id,
            name: cfg.customName || id,
            icon: undefined,
          })),
      ];
      return { providerList: list, configsLookup: asrProvidersConfig };
    }
    default:
      return { providerList: [], configsLookup: {} };
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 52,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabsBar: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabsContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 32,
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabGlyph: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  placeholderContent: {
    padding: 16,
    paddingBottom: 32,
  },
  placeholderCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  placeholderDesc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  placeholderBadge: {
    marginTop: 8,
    backgroundColor: colors.warning,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  placeholderBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
