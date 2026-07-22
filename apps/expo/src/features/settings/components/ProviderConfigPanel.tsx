/**
 * @file ProviderConfigPanel.tsx
 * @description 移动端提供商配置面板。
 *
 * 1:1 对应 Web 端 `components/settings/provider-config-panel.tsx`，
 * 适配 React Native 单栏滚动布局。
 *
 * 功能：
 * - API Key 输入（带显隐切换 + 测试连接按钮）
 * - Base URL 输入（带备选 URL 快选 chips）
 * - "Requires API Key" 复选框
 * - 模型列表（每项显示名称 + 能力图标 + 上下文窗口 + 编辑/删除按钮）
 * - 获取模型按钮（POST `${API_BASE}/api/provider/probe-models`）
 * - 重置按钮 + 确认对话框
 * - 测试连接（POST `${API_BASE}/api/verify-model`）
 *
 * 严格隔离规则：
 * - 仅使用 react-native 原生组件 + `./ui` 共享组件
 * - 不引用任何 Web 端包（shadcn/ui、lucide-react、@radix-ui/* 等）
 * - 不引用 `@openmaic/storage` 运行时
 */

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertDialog,
  Badge,
  Button,
  Card,
  Checkbox,
  colors,
  Divider,
  IconButton,
  Input,
  Label,
} from './ui';
import type { ModelInfo, ProviderConfig, ProvidersConfig, ProviderType } from '../types';
import { useSettingsI18n } from '../i18n';

/**
 * 移动端 API 基础 URL。
 *
 * 通过 Expo 公共环境变量 `EXPO_PUBLIC_API_URL` 注入（编译期内联），
 * 默认回退到 `http://localhost:3000`。注意：设置 API 路径不是
 * `/api/runtime`，而是 `/api/verify-model`、`/api/provider/probe-models` 等。
 */
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * `ProviderConfigPanel` 组件 props，与 Web 端同名 props 字段一一对应。
 */
export interface ProviderConfigPanelProps {
  /** 当前编辑的提供商元信息（含默认 baseUrl、备选 URL、模型列表等） */
  provider: ProviderConfig;
  /** 初始 API Key（来自持久化 store） */
  initialApiKey: string;
  /** 初始 Base URL（来自持久化 store） */
  initialBaseUrl: string;
  /** 初始 requiresApiKey 标志（来自持久化 store） */
  initialRequiresApiKey: boolean;
  /** 所有 LLM 提供商配置映射（用于查询 models、isServerConfigured 等） */
  providersConfig: ProvidersConfig;
  /** 配置变更回调（apiKey/baseUrl/requiresApiKey 任一变化时触发） */
  onConfigChange: (apiKey: string, baseUrl: string, requiresApiKey: boolean) => void;
  /** 失焦保存回调（用于触发持久化与 UI 反馈） */
  onSave: () => void;
  /** 编辑指定索引的模型 */
  onEditModel: (index: number) => void;
  /** 删除指定索引的模型 */
  onDeleteModel: (index: number) => void;
  /** 新增模型 */
  onAddModel: () => void;
  /** 拉取模型列表回调；返回新增条目数量 */
  onModelsFetched?: (ids: string[]) => number;
  /** 可选的 `/models` 端点 URL 覆盖（来自 preset） */
  modelsUrl?: string;
  /** 重置为默认配置回调 */
  onResetToDefault?: () => void;
  /** 是否为内置提供商（决定是否显示重置按钮） */
  isBuiltIn: boolean;
}

/** 测试连接状态 */
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

/** 拉取模型状态 */
type FetchStatus = 'idle' | 'fetching' | 'success' | 'error';

/**
 * 格式化上下文窗口大小（如 128000 → "128K"，1000000 → "1M"）。
 * 对应 Web 端 `formatContextWindow` 工具函数。
 */
function formatContextWindow(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(0)}K`;
  }
  return String(value);
}

/**
 * 构造 `verify-model` 请求体。
 * 对应 Web 端 `createVerifyModelRequest`。
 */
function buildVerifyModelBody(args: {
  providerId: string;
  modelId: string;
  apiKey: string;
  baseUrl: string;
  providerType: ProviderType;
  requiresApiKey: boolean;
}): Record<string, unknown> {
  return {
    providerId: args.providerId,
    modelId: args.modelId,
    apiKey: args.apiKey,
    baseUrl: args.baseUrl,
    providerType: args.providerType,
    requiresApiKey: args.requiresApiKey,
  };
}

/**
 * 根据 provider type 推断对应的请求 endpoint 后缀（用于展示完整请求 URL）。
 */
function getEndpointPath(providerType: ProviderType): string {
  switch (providerType) {
    case 'openai':
      return '/chat/completions';
    case 'azure':
      return '/v1/responses?api-version=v1';
    case 'anthropic':
      return '/messages';
    case 'google':
      return '/models/[model]';
    default:
      return '';
  }
}

/**
 * 提供商配置面板（RN 版）。
 *
 * 对应 Web 端 `ProviderConfigPanel`。Web 端使用 Tailwind 三栏栅格，
 * 移动端适配为单栏 `ScrollView` 垂直布局，触摸目标 ≥ 44pt。
 *
 * @example
 * ```tsx
 * <ProviderConfigPanel
 *   provider={selectedProvider}
 *   initialApiKey={providerConfig.apiKey}
 *   initialBaseUrl={providerConfig.baseUrl}
 *   initialRequiresApiKey={providerConfig.requiresApiKey}
 *   providersConfig={providersConfig}
 *   onConfigChange={(key, url, req) => handleConfigChange(key, url, req)}
 *   onSave={handleSave}
 *   onEditModel={(i) => handleEditModel(i)}
 *   onDeleteModel={(i) => handleDeleteModel(i)}
 *   onAddModel={handleAddModel}
 *   onModelsFetched={(ids) => handleModelsFetched(ids)}
 *   onResetToDefault={handleResetProvider}
 *   isBuiltIn={providerConfig.isBuiltIn}
 * />
 * ```
 */
export function ProviderConfigPanel({
  provider,
  initialApiKey,
  initialBaseUrl,
  initialRequiresApiKey,
  providersConfig,
  onConfigChange,
  onSave,
  onEditModel,
  onDeleteModel,
  onAddModel,
  onModelsFetched,
  modelsUrl,
  onResetToDefault,
  isBuiltIn,
}: ProviderConfigPanelProps): ReactNode {
  const { t } = useSettingsI18n();

  // 本地编辑态
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [baseUrl, setBaseUrl] = useState<string>(initialBaseUrl);
  const [requiresApiKey, setRequiresApiKey] = useState<boolean>(initialRequiresApiKey);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchMessage, setFetchMessage] = useState<string>('');
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);

  // provider 切换时同步本地状态
  useEffect(() => {
    setApiKey(initialApiKey);
    setBaseUrl(initialBaseUrl);
    setRequiresApiKey(initialRequiresApiKey);
    setTestStatus('idle');
    setTestMessage('');
    setFetchStatus('idle');
    setFetchMessage('');
  }, [provider.id, initialApiKey, initialBaseUrl, initialRequiresApiKey]);

  const handleApiKeyChange = (key: string): void => {
    setApiKey(key);
    onConfigChange(key, baseUrl, requiresApiKey);
  };

  const handleBaseUrlChange = (url: string): void => {
    setBaseUrl(url);
    onConfigChange(apiKey, url, requiresApiKey);
  };

  const handleRequiresApiKeyChange = (requires: boolean): void => {
    setRequiresApiKey(requires);
    onConfigChange(apiKey, baseUrl, requires);
  };

  const handleTestApi = useCallback(async (): Promise<void> => {
    setTestStatus('testing');
    setTestMessage('');

    const availableModels = providersConfig[provider.id]?.models ?? [];
    if (availableModels.length === 0) {
      setTestStatus('error');
      setTestMessage(t('settings.noModelsAvailable'));
      return;
    }

    const testModelId = availableModels[0].id;
    try {
      const response = await fetch(`${API_BASE}/api/verify-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildVerifyModelBody({
            providerId: provider.id,
            modelId: testModelId,
            apiKey,
            baseUrl,
            providerType: provider.type,
            requiresApiKey,
          }),
        ),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };
      if (data.success) {
        setTestStatus('success');
        setTestMessage(t('settings.connectionSuccess'));
      } else {
        setTestStatus('error');
        setTestMessage(data.error || t('settings.connectionFailed'));
      }
    } catch {
      setTestStatus('error');
      setTestMessage(t('settings.connectionFailed'));
    }
  }, [apiKey, baseUrl, provider.id, provider.type, requiresApiKey, providersConfig, t]);

  const effectiveBaseUrl = baseUrl || provider.defaultBaseUrl || '';

  const handleFetchModels = useCallback(async (): Promise<void> => {
    setFetchStatus('fetching');
    setFetchMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/provider/probe-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: effectiveBaseUrl, apiKey, modelsUrl }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        models?: Array<{ id: string }>;
        error?: string;
      };
      if (response.ok && data.success) {
        const ids: string[] = (data.models ?? []).map((m) => m.id);
        const added = onModelsFetched?.(ids) ?? 0;
        setFetchStatus('success');
        setFetchMessage(
          t('settings.fetchModelsResult')
            .replace('{added}', String(added))
            .replace('{total}', String(ids.length)),
        );
      } else if (response.status === 404) {
        setFetchStatus('error');
        setFetchMessage(t('settings.fetchModelsNoEndpoint'));
      } else if (response.status === 401) {
        setFetchStatus('error');
        setFetchMessage(t('settings.fetchModelsAuthError'));
      } else {
        setFetchStatus('error');
        setFetchMessage(data.error || t('settings.fetchModelsFailed'));
      }
    } catch {
      setFetchStatus('error');
      setFetchMessage(t('settings.fetchModelsFailed'));
    }
  }, [apiKey, effectiveBaseUrl, modelsUrl, onModelsFetched, t]);

  const models: ModelInfo[] = providersConfig[provider.id]?.models ?? [];
  const isServerConfigured = providersConfig[provider.id]?.isServerConfigured === true;
  const modelsLocked = (providersConfig[provider.id]?.serverModels?.length ?? 0) > 0;
  const endpointPath = getEndpointPath(provider.type);
  const fullRequestUrl = effectiveBaseUrl ? `${effectiveBaseUrl}${endpointPath}` : '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 服务端托管提示 */}
      {isServerConfigured ? (
        <View style={styles.serverNotice}>
          <Text style={styles.serverNoticeText}>{t('settings.serverConfiguredNotice')}</Text>
        </View>
      ) : null}

      {/* Azure 部署提示 */}
      {provider.id === 'azure' ? (
        <View style={styles.infoNotice}>
          <Text style={styles.infoNoticeText}>{t('settings.azureDeploymentHint')}</Text>
        </View>
      ) : null}

      {!isServerConfigured ? (
        <>
          {/* API Key 区 */}
          <View style={styles.section}>
            <Label>{t('settings.apiSecret')}</Label>

            <View style={styles.apiKeyRow}>
              <View style={styles.apiKeyInputWrap}>
                <Input
                  value={apiKey}
                  onChangeText={handleApiKeyChange}
                  onBlur={onSave}
                  placeholder="sk-..."
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  editable={requiresApiKey}
                  keyboardType="visible-password"
                  style={styles.apiKeyInput}
                />
                <IconButton
                  icon={showApiKey ? 'eye-slash' : 'eye'}
                  onPress={() => setShowApiKey((v) => !v)}
                  size={18}
                  color={colors.muted}
                  style={styles.apiKeyEyeBtn}
                />
              </View>
              <Button
                variant="outline"
                size="md"
                onPress={handleTestApi}
                loading={testStatus === 'testing'}
                disabled={testStatus === 'testing' || (requiresApiKey && !apiKey)}
              >
                {testStatus === 'testing' ? t('settings.testing') : t('settings.testConnection')}
              </Button>
            </View>

            {testMessage ? (
              <View
                style={[
                  styles.messageBox,
                  testStatus === 'success' && styles.messageSuccess,
                  testStatus === 'error' && styles.messageError,
                ]}
              >
                <Text style={styles.messageText}>{testMessage}</Text>
              </View>
            ) : null}

            <View style={styles.checkboxRow}>
              <Checkbox
                checked={requiresApiKey}
                onCheckedChange={(checked) => {
                  handleRequiresApiKeyChange(checked);
                  onSave();
                }}
                label={t('settings.requiresApiKey')}
              />
            </View>
          </View>

          <Divider />

          {/* Base URL 区 */}
          <View style={styles.section}>
            <Label>{t('settings.apiHost')}</Label>
            <Input
              value={baseUrl}
              onChangeText={handleBaseUrlChange}
              onBlur={onSave}
              placeholder={
                provider.baseUrlPlaceholder ||
                provider.defaultBaseUrl ||
                'https://api.example.com/v1'
              }
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />

            {provider.alternateBaseUrls && provider.alternateBaseUrls.length > 0 ? (
              <View style={styles.chipsRow}>
                {provider.alternateBaseUrls.map((alt) => {
                  const active = (baseUrl || provider.defaultBaseUrl) === alt.url;
                  return (
                    <Pressable
                      key={alt.url}
                      onPress={() => {
                        handleBaseUrlChange(alt.url);
                        onSave();
                      }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {t(alt.label)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {fullRequestUrl ? (
              <Text style={styles.requestUrlText} numberOfLines={2}>
                {t('settings.requestUrl')}: {fullRequestUrl}
              </Text>
            ) : null}
          </View>

          <Divider />
        </>
      ) : null}

      {/* 模型列表区 */}
      <View style={styles.section}>
        <View style={styles.modelsHeader}>
          <View style={styles.modelsTitleRow}>
            <Label style={styles.modelsTitle}>{t('settings.models')}</Label>
            {modelsLocked ? (
              <Badge variant="default">{t('settings.serverConfigured')}</Badge>
            ) : null}
          </View>
          {!modelsLocked ? (
            <View style={styles.modelsActions}>
              {isBuiltIn && onResetToDefault ? (
                <Button variant="outline" size="sm" onPress={() => setShowResetDialog(true)}>
                  {t('settings.reset')}
                </Button>
              ) : null}
              {provider.supportsModelDiscovery !== false ? (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleFetchModels}
                  loading={fetchStatus === 'fetching'}
                  disabled={fetchStatus === 'fetching' || (requiresApiKey && !apiKey)}
                >
                  {t('settings.fetchModels')}
                </Button>
              ) : null}
              <Button variant="outline" size="sm" onPress={onAddModel}>
                {`+ ${t('settings.addNewModel')}`}
              </Button>
            </View>
          ) : null}
        </View>

        {fetchMessage ? (
          <View
            style={[
              styles.messageBox,
              fetchStatus === 'success' && styles.messageSuccess,
              fetchStatus === 'error' && styles.messageWarning,
            ]}
          >
            <Text style={styles.messageText}>{fetchMessage}</Text>
          </View>
        ) : null}

        <View style={styles.modelList}>
          {models.length === 0 ? (
            <Text style={styles.emptyText}>{t('settings.noModelsAdded')}</Text>
          ) : (
            models.map((model, index) => (
              <ModelRow
                key={`${model.id}-${index}`}
                model={model}
                onEdit={() => onEditModel(index)}
                onDelete={() => onDeleteModel(index)}
                onResetToDefault={onResetToDefault}
                modelsLocked={modelsLocked}
                t={t}
              />
            ))
          )}
        </View>
      </View>

      {/* 重置确认对话框 */}
      <AlertDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title={t('settings.resetToDefault')}
        description={t('settings.resetConfirmDescription')}
        confirmText={t('settings.confirmReset')}
        cancelText={t('settings.cancelEdit')}
        onConfirm={() => {
          onResetToDefault?.();
        }}
      />
    </ScrollView>
  );
}

/**
 * 模型行渲染 props。
 */
interface ModelRowProps {
  /** 模型信息 */
  model: ModelInfo;
  /** 编辑按钮回调 */
  onEdit: () => void;
  /** 删除按钮回调 */
  onDelete: () => void;
  /** 重置回调（保留以兼容签名，未使用） */
  onResetToDefault?: () => void;
  /** 模型目录是否被服务端锁定（锁定时隐藏编辑/删除按钮） */
  modelsLocked: boolean;
  /** i18n 翻译函数 */
  t: (key: string) => string;
}

/**
 * 单个模型行：显示名称、能力图标、上下文窗口，以及编辑/删除按钮。
 */
function ModelRow({ model, onEdit, onDelete, modelsLocked, t }: ModelRowProps): ReactNode {
  const capabilities: Array<{ key: string; label: string; glyph: string }> = [];
  if (model.capabilities?.vision) {
    capabilities.push({
      key: 'vision',
      label: t('settings.capabilities.vision'),
      glyph: '\u{1F441}',
    });
  }
  if (model.capabilities?.tools) {
    capabilities.push({
      key: 'tools',
      label: t('settings.capabilities.tools'),
      glyph: '\u{1F527}',
    });
  }
  if (model.capabilities?.streaming) {
    capabilities.push({
      key: 'streaming',
      label: t('settings.capabilities.streaming'),
      glyph: '\u26A1',
    });
  }

  return (
    <Card style={styles.modelCard}>
      <View style={styles.modelCardLeft}>
        <Text style={styles.modelName} numberOfLines={1}>
          {model.name}
        </Text>
        <View style={styles.modelMetaRow}>
          {capabilities.length > 0 ? (
            <View style={styles.capRow}>
              {capabilities.map((cap) => (
                <Text key={cap.key} style={styles.capGlyph}>
                  {cap.glyph}
                </Text>
              ))}
            </View>
          ) : null}
          {model.contextWindow ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{formatContextWindow(model.contextWindow)}</Text>
            </View>
          ) : null}
          {model.outputWindow ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{formatContextWindow(model.outputWindow)}</Text>
            </View>
          ) : null}
        </View>
      </View>
      {!modelsLocked ? (
        <View style={styles.modelActions}>
          <IconButton icon="edit" onPress={onEdit} size={18} color={colors.muted} />
          <IconButton icon="trash" onPress={onDelete} size={18} color={colors.destructive} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  serverNotice: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
  },
  serverNoticeText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  infoNotice: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    padding: 12,
  },
  infoNoticeText: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
  },
  apiKeyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  apiKeyInputWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  apiKeyInput: {
    paddingRight: 40,
  },
  apiKeyEyeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    minHeight: 40,
    minWidth: 40,
  },
  checkboxRow: {
    marginTop: 4,
  },
  messageBox: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  messageError: {
    backgroundColor: colors.destructiveLight,
    borderColor: '#FECACA',
  },
  messageWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  messageText: {
    fontSize: 12,
    color: colors.foreground,
    lineHeight: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.white,
  },
  requestUrlText: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },
  modelsHeader: {
    gap: 8,
  },
  modelsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelsTitle: {
    fontSize: 16,
  },
  modelsActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelList: {
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  modelCardLeft: {
    flex: 1,
    gap: 6,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    fontFamily: 'Menlo', // 等宽字体以呼应 Web 端 font-mono
  },
  modelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  capRow: {
    flexDirection: 'row',
    gap: 4,
  },
  capGlyph: {
    fontSize: 12,
  },
  metaPill: {
    backgroundColor: colors.mutedLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaPillText: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '500',
  },
  modelActions: {
    flexDirection: 'row',
    gap: 2,
  },
});
