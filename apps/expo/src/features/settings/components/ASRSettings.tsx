/**
 * @file ASRSettings.tsx
 * @description ASR（自动语音识别）提供商设置面板（移动端）。
 *
 * 允许配置 API Key、Base URL、启用状态、模型 ID、识别语言等，
 * 并支持调用后端 `/api/generate/asr` 接口进行连通性测试。
 *
 * 设计说明：
 * - 与 TTSSettings 类似，但不包含音色与语速；新增「识别语言」选择。
 * - 由于 `settingsStore` 仅暴露 `setASRProviderConfig`，无法直接修改全局
 *   `asrLanguage`，因此语言会被持久化到对应提供商的
 *   `providerOptions.language` 中（按提供商隔离）。
 *   读取时优先使用 providerOptions，缺失则回退到全局状态。
 * - 严格隔离：仅依赖 react-native 原生组件、./ui 共享组件、../settingsStore、
 *   ../constants、../types，不引用任何 Web 端包或 @openmaic/storage 运行时。
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Button,
  Input,
  Label,
  Switch,
  Card,
  SectionHeader,
  IconButton,
  colors,
} from './ui';
import { useSettingsStore } from '../settingsStore';
import { ASR_PROVIDERS } from '../constants';
import type { ASRProviderId } from '../types';

/** ASR 测试 API 路径（相对于 API origin）。 */
const ASR_TEST_PATH = '/api/generate/asr';

/** 默认 API origin，可通过 EXPO_PUBLIC_API_ORIGIN 环境变量覆盖。 */
const DEFAULT_API_ORIGIN = 'http://localhost:3000';

/** 常见 ASR 识别语言代码列表（auto 表示自动检测）。 */
const ASR_LANGUAGES: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'auto', name: '自动检测' },
  { id: 'zh', name: '中文' },
  { id: 'en', name: '英语' },
  { id: 'ja', name: '日语' },
  { id: 'ko', name: '韩语' },
  { id: 'fr', name: '法语' },
  { id: 'de', name: '德语' },
  { id: 'es', name: '西班牙语' },
];

/**
 * 解析 ASR 测试 API 完整 URL。
 * 优先使用 `EXPO_PUBLIC_API_ORIGIN` 环境变量，否则回退到 localhost。
 */
function resolveAsrTestUrl(): string {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN;
  return `${origin}${ASR_TEST_PATH}`;
}

/** 安全读取 providerOptions 中的字符串字段。 */
function readOptString(
  opts: Record<string, unknown> | undefined,
  key: string,
): string | null {
  if (!opts) return null;
  const v = opts[key];
  return typeof v === 'string' ? v : null;
}

/** ASR 设置面板 Props。 */
export interface ASRSettingsProps {
  /** 当前选中的 ASR 提供商 ID。 */
  selectedProviderId: ASRProviderId;
}

/**
 * ASR 设置面板组件。
 *
 * 提供以下能力：
 * - 启用/禁用当前 ASR 提供商（写入 `ASRProviderConfig.enabled`）
 * - 配置 API Key（带显隐切换）与 Base URL
 * - 选择模型 ID（若提供商声明了 `customModels` 则展示为芯片组）
 * - 选择识别语言（常见语言代码 chip 选择器，写入 `providerOptions.language`）
 * - 调用后端 ASR 接口进行连通性测试
 *
 * @param props - 组件属性，参见 {@link ASRSettingsProps}
 */
export function ASRSettings({ selectedProviderId }: ASRSettingsProps) {
  const asrProvidersConfig = useSettingsStore((s) => s.asrProvidersConfig);
  const setASRProviderConfig = useSettingsStore((s) => s.setASRProviderConfig);
  const globalAsrLanguage = useSettingsStore((s) => s.asrLanguage);

  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>(
    'idle',
  );
  const [testMessage, setTestMessage] = useState('');

  const providerConfig = asrProvidersConfig[selectedProviderId];
  const providerMeta = ASR_PROVIDERS[selectedProviderId];
  const isServerConfigured = !!providerConfig?.isServerConfigured;
  const requiresApiKey =
    providerConfig?.requiresApiKey ?? !providerConfig?.isBuiltIn;

  // 从 providerOptions 读取语言，回退到全局状态
  const providerOpts = providerConfig?.providerOptions ?? {};
  const language = readOptString(providerOpts, 'language') ?? globalAsrLanguage ?? 'auto';

  if (!providerConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>未找到该提供商的配置</Text>
      </View>
    );
  }

  /** 更新 providerOptions 中指定字段。 */
  const updateProviderOption = (key: string, value: unknown): void => {
    setASRProviderConfig(selectedProviderId, {
      providerOptions: { ...providerOpts, [key]: value },
    });
  };

  /** 处理 ASR 测试按钮点击。 */
  const handleTest = async (): Promise<void> => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await fetch(resolveAsrTestUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          modelId: providerConfig.modelId ?? '',
          language,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          audio: '',
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (response.ok && data.success !== false) {
        setTestStatus('success');
        setTestMessage('ASR 测试成功');
      } else {
        setTestStatus('error');
        setTestMessage(`测试失败：${data.error ?? response.statusText}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(
        `测试失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const customModels = providerConfig.customModels ?? [];
  const providerName = providerConfig.customName ?? providerMeta?.name ?? selectedProviderId;

  return (
    <View style={styles.container}>
      <SectionHeader title={providerName} />

      {/* 启用/禁用开关 */}
      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Label>启用此提供商</Label>
            <Text style={styles.hint}>启用后可在语音识别功能中使用</Text>
          </View>
          <Switch
            value={providerConfig.enabled}
            onValueChange={(checked) =>
              setASRProviderConfig(selectedProviderId, { enabled: checked })
            }
            disabled={!!providerConfig.isServerConfigured && false}
          />
        </View>
      </Card>

      {/* 服务器托管提示 */}
      {isServerConfigured && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            此提供商由服务器统一配置，无需在此填写凭证。
          </Text>
        </View>
      )}

      {/* 凭证配置 */}
      {!isServerConfigured && (requiresApiKey || providerConfig.apiKey) && (
        <Card style={styles.section}>
          <SectionHeader title="API 凭证" />
          <View style={styles.field}>
            <Label>API Key</Label>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  value={providerConfig.apiKey}
                  onChangeText={(text) =>
                    setASRProviderConfig(selectedProviderId, { apiKey: text })
                  }
                  placeholder="请输入 API Key"
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>
              <IconButton
                icon={showApiKey ? 'eye-slash' : 'eye'}
                onPress={() => setShowApiKey((v) => !v)}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Label>Base URL</Label>
            <Input
              value={providerConfig.baseUrl}
              onChangeText={(text) =>
                setASRProviderConfig(selectedProviderId, { baseUrl: text })
              }
              placeholder={providerConfig.customDefaultBaseUrl ?? 'http://localhost:8000/v1'}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />
          </View>
        </Card>
      )}

      {/* 模型与语言 */}
      <Card style={styles.section}>
        <SectionHeader title="模型与语言" />
        <View style={styles.field}>
          <Label>模型 ID</Label>
          {customModels.length > 0 ? (
            <View style={styles.chipRow}>
              {customModels.map((m) => {
                const active = providerConfig.modelId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() =>
                      setASRProviderConfig(selectedProviderId, { modelId: m.id })
                    }
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {m.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Input
              value={providerConfig.modelId ?? ''}
              onChangeText={(text) =>
                setASRProviderConfig(selectedProviderId, { modelId: text })
              }
              placeholder="例如 whisper-1"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        </View>

        <View style={styles.field}>
          <Label>识别语言</Label>
          <View style={styles.chipRow}>
            {ASR_LANGUAGES.map((lang) => {
              const active = language === lang.id;
              return (
                <Pressable
                  key={lang.id}
                  onPress={() => updateProviderOption('language', lang.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {lang.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* 连通性测试 */}
      <Card style={styles.section}>
        <SectionHeader title="连通性测试" />
        <Button
          onPress={handleTest}
          loading={testStatus === 'testing'}
          disabled={
            testStatus === 'testing' ||
            (requiresApiKey && !providerConfig.apiKey.trim() && !isServerConfigured)
          }
        >
          测试 ASR
        </Button>
        {testMessage ? (
          <View
            style={[
              styles.testResult,
              testStatus === 'success' && styles.testResultSuccess,
              testStatus === 'error' && styles.testResultError,
            ]}
          >
            <Text
              style={[
                styles.testResultText,
                testStatus === 'success' && styles.testResultTextSuccess,
                testStatus === 'error' && styles.testResultTextError,
              ]}
            >
              {testMessage}
            </Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  section: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex1: { flex: 1 },
  field: { gap: 6, marginBottom: 8 },
  hint: { fontSize: 11, color: colors.muted, marginTop: 2 },
  emptyText: { color: colors.muted, textAlign: 'center', padding: 24 },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: { color: '#1D4ED8', fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.mutedLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.foreground },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  testResult: { marginTop: 8, padding: 10, borderRadius: 8 },
  testResultSuccess: { backgroundColor: '#DCFCE7' },
  testResultError: { backgroundColor: colors.destructiveLight },
  testResultText: { fontSize: 12 },
  testResultTextSuccess: { color: colors.success },
  testResultTextError: { color: colors.destructive },
});
