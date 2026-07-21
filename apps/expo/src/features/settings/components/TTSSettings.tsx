/**
 * @file TTSSettings.tsx
 * @description TTS 提供商设置面板（移动端）。
 *
 * 允许配置 API Key、Base URL、启用状态、模型 ID、音色、语速等，
 * 并支持调用后端 `/api/generate/tts` 接口进行连通性测试。
 *
 * 设计说明：
 * - 由于 `settingsStore` 仅暴露 `setTTSProviderConfig`，无法直接修改全局
 *   `ttsVoice` / `ttsSpeed`，因此音色与语速会被持久化到对应提供商的
 *   `providerOptions.voice` / `providerOptions.speed` 中（按提供商隔离）。
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
import { TTS_PROVIDERS } from '../constants';
import type { TTSProviderId } from '../types';

/** TTS 测试 API 路径（相对于 API origin）。 */
const TTS_TEST_PATH = '/api/generate/tts';

/** 默认 API origin，可通过 EXPO_PUBLIC_API_ORIGIN 环境变量覆盖。 */
const DEFAULT_API_ORIGIN = 'http://localhost:3000';

/** 语速滑块最小值。 */
const SPEED_MIN = 0.5;
/** 语速滑块最大值。 */
const SPEED_MAX = 2.0;

/**
 * 解析 TTS 测试 API 完整 URL。
 * 优先使用 `EXPO_PUBLIC_API_ORIGIN` 环境变量，否则回退到 localhost。
 */
function resolveTtsTestUrl(): string {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN;
  return `${origin}${TTS_TEST_PATH}`;
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

/** 安全读取 providerOptions 中的数字字段。 */
function readOptNumber(
  opts: Record<string, unknown> | undefined,
  key: string,
): number | null {
  if (!opts) return null;
  const v = opts[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** 将语速映射为 0~1 的进度比例。 */
function speedToRatio(speed: number): number {
  return (speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
}

/** 将 0~1 的进度比例映射为语速。 */
function ratioToSpeed(ratio: number): number {
  const clamped = Math.min(1, Math.max(0, ratio));
  const speed = SPEED_MIN + clamped * (SPEED_MAX - SPEED_MIN);
  return Math.round(speed * 100) / 100;
}

/** TTS 设置面板 Props。 */
export interface TTSSettingsProps {
  /** 当前选中的 TTS 提供商 ID。 */
  selectedProviderId: TTSProviderId;
}

/**
 * TTS 设置面板组件。
 *
 * 提供以下能力：
 * - 启用/禁用当前 TTS 提供商（写入 `TTSProviderConfig.enabled`）
 * - 配置 API Key（带显隐切换）与 Base URL
 * - 选择模型 ID（若提供商声明了 `customModels` 则展示为芯片组）
 * - 选择音色（若 `customVoices` 存在则展示为芯片组，否则文本输入）
 * - 调节语速滑块（0.5 ~ 2.0，写入 `providerOptions.speed`）
 * - 调用后端 TTS 接口进行连通性测试
 *
 * @param props - 组件属性，参见 {@link TTSSettingsProps}
 */
export function TTSSettings({ selectedProviderId }: TTSSettingsProps) {
  const ttsProvidersConfig = useSettingsStore((s) => s.ttsProvidersConfig);
  const setTTSProviderConfig = useSettingsStore((s) => s.setTTSProviderConfig);
  const globalTtsVoice = useSettingsStore((s) => s.ttsVoice);
  const globalTtsSpeed = useSettingsStore((s) => s.ttsSpeed);

  const [showApiKey, setShowApiKey] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const providerConfig = ttsProvidersConfig[selectedProviderId];
  const providerMeta = TTS_PROVIDERS[selectedProviderId];
  const isServerConfigured = !!providerConfig?.isServerConfigured;
  const requiresApiKey =
    providerConfig?.requiresApiKey ?? !providerConfig?.isBuiltIn;

  // 从 providerOptions 读取音色/语速，回退到全局状态
  const providerOpts = providerConfig?.providerOptions ?? {};
  const voice =
    readOptString(providerOpts, 'voice') ?? globalTtsVoice ?? '';
  const speed = readOptNumber(providerOpts, 'speed') ?? globalTtsSpeed;

  if (!providerConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>未找到该提供商的配置</Text>
      </View>
    );
  }

  /** 更新 providerOptions 中指定字段。 */
  const updateProviderOption = (key: string, value: unknown): void => {
    setTTSProviderConfig(selectedProviderId, {
      providerOptions: { ...providerOpts, [key]: value },
    });
  };

  /** 处理 TTS 测试按钮点击。 */
  const handleTest = async (): Promise<void> => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await fetch(resolveTtsTestUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          modelId: providerConfig.modelId ?? '',
          voice,
          speed,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          text: '你好，这是一个 TTS 连通性测试。',
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (response.ok && data.success !== false) {
        setTestStatus('success');
        setTestMessage('TTS 测试成功');
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

  const customVoices = providerConfig.customVoices ?? [];
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
            <Text style={styles.hint}>启用后在音色选择器中可见</Text>
          </View>
          <Switch
            value={providerConfig.enabled}
            onValueChange={(checked) =>
              setTTSProviderConfig(selectedProviderId, { enabled: checked })
            }
            disabled={!!providerConfig.serverDisabled}
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
                    setTTSProviderConfig(selectedProviderId, { apiKey: text })
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
                setTTSProviderConfig(selectedProviderId, { baseUrl: text })
              }
              placeholder={
                providerConfig.customDefaultBaseUrl ?? 'http://localhost:8000/v1'
              }
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />
          </View>
        </Card>
      )}

      {/* 模型与音色 */}
      <Card style={styles.section}>
        <SectionHeader title="模型与音色" />
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
                      setTTSProviderConfig(selectedProviderId, { modelId: m.id })
                    }
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
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
                setTTSProviderConfig(selectedProviderId, { modelId: text })
              }
              placeholder="例如 tts-1"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        </View>

        <View style={styles.field}>
          <Label>音色</Label>
          {customVoices.length > 0 ? (
            <View style={styles.chipRow}>
              {customVoices.map((v) => {
                const active = voice === v.id;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => updateProviderOption('voice', v.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {v.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Input
              value={voice}
              onChangeText={(text) => updateProviderOption('voice', text)}
              placeholder="例如 alloy"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        </View>

        <View style={styles.field}>
          <Label>语速：{speed.toFixed(2)}x</Label>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>0.5x</Text>
            <View
              style={styles.sliderTrack}
              onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={(e) => {
                  if (sliderWidth === 0) return;
                  const x = Math.min(
                    sliderWidth,
                    Math.max(0, e.nativeEvent.locationX),
                  );
                  updateProviderOption('speed', ratioToSpeed(x / sliderWidth));
                }}
              >
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${speedToRatio(speed) * 100}%` },
                  ]}
                />
              </Pressable>
              <View
                pointerEvents="none"
                style={[
                  styles.sliderThumb,
                  {
                    left: `${speedToRatio(speed) * 100}%`,
                    marginLeft: -10,
                  },
                ]}
              />
            </View>
            <Text style={styles.sliderLabel}>2.0x</Text>
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
            (requiresApiKey &&
              !providerConfig.apiKey.trim() &&
              !isServerConfigured)
          }
        >
          测试 TTS
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
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40 },
  sliderLabel: { fontSize: 11, color: colors.muted },
  sliderTrack: {
    flex: 1,
    height: 32,
    backgroundColor: colors.mutedLight,
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    top: 6,
  },
  testResult: { marginTop: 8, padding: 10, borderRadius: 8 },
  testResultSuccess: { backgroundColor: '#DCFCE7' },
  testResultError: { backgroundColor: colors.destructiveLight },
  testResultText: { fontSize: 12 },
  testResultTextSuccess: { color: colors.success },
  testResultTextError: { color: colors.destructive },
});
