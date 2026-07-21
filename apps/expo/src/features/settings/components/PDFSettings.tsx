/**
 * @file PDFSettings.tsx
 * @description PDF 解析提供商设置面板（移动端）。
 *
 * 允许配置 API Key 或阿里云 AK/SK、Base URL、启用状态，
 * 并支持调用后端 `/api/verify-pdf-provider` 接口进行连通性测试。
 *
 * 三种 PDF 提供商的差异：
 * - `mineru`：自托管服务，仅需 Base URL（不需要 API Key）
 * - `alidocmind`：阿里云文档智能，需要 accessKeyId + accessKeySecret
 * - `unpdf`：内置基于 unpdf 包，无需任何凭证
 *
 * 设计说明：
 * - 由于 `settingsStore` 中 `GenericProviderConfig` 不包含 `accessKeyId` /
 *   `accessKeySecret` 字段，因此阿里云的 AK/SK 会被持久化到对应提供商的
 *   `providerOptions.accessKeyId` / `providerOptions.accessKeySecret` 中。
 * - 严格隔离：仅依赖 react-native 原生组件、./ui 共享组件、../settingsStore、
 *   ../constants、../types，不引用任何 Web 端包或 @openmaic/storage 运行时。
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Button,
  Input,
  Label,
  Switch,
  Card,
  SectionHeader,
  IconButton,
  Badge,
  colors,
} from './ui';
import { useSettingsStore } from '../settingsStore';
import { PDF_PROVIDERS } from '../constants';
import type { PDFProviderId } from '../types';

/** PDF 测试 API 路径（相对于 API origin）。 */
const PDF_TEST_PATH = '/api/verify-pdf-provider';

/** 默认 API origin，可通过 EXPO_PUBLIC_API_ORIGIN 环境变量覆盖。 */
const DEFAULT_API_ORIGIN = 'http://localhost:3000';

/**
 * 解析 PDF 测试 API 完整 URL。
 * 优先使用 `EXPO_PUBLIC_API_ORIGIN` 环境变量，否则回退到 localhost。
 */
function resolvePdfTestUrl(): string {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN;
  return `${origin}${PDF_TEST_PATH}`;
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

/** PDF 设置面板 Props。 */
export interface PDFSettingsProps {
  /** 当前选中的 PDF 提供商 ID。 */
  selectedProviderId: PDFProviderId;
}

/**
 * PDF 解析设置面板组件。
 *
 * 提供以下能力：
 * - 启用/禁用当前 PDF 提供商（写入 `GenericProviderConfig.enabled`）
 * - 配置 API Key 或阿里云 AK/SK（按提供商类型动态展示）
 * - 配置 Base URL（仅 mineru 等需要自托管的提供商）
 * - 调用后端 PDF 解析接口进行连通性测试
 *
 * @param props - 组件属性，参见 {@link PDFSettingsProps}
 */
export function PDFSettings({ selectedProviderId }: PDFSettingsProps) {
  const pdfProvidersConfig = useSettingsStore((s) => s.pdfProvidersConfig);
  const setPDFProviderConfig = useSettingsStore((s) => s.setPDFProviderConfig);

  const [showApiKey, setShowApiKey] = useState(false);
  const [showAccessKeyId, setShowAccessKeyId] = useState(false);
  const [showAccessKeySecret, setShowAccessKeySecret] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>(
    'idle',
  );
  const [testMessage, setTestMessage] = useState('');

  const providerConfig = pdfProvidersConfig[selectedProviderId];
  const providerMeta = PDF_PROVIDERS[selectedProviderId];
  const isServerConfigured = !!providerConfig?.isServerConfigured;

  const isAliDocMind = selectedProviderId === 'alidocmind';
  const isMineru = selectedProviderId === 'mineru';
  const isUnpdf = selectedProviderId === 'unpdf';

  // 从 providerOptions 读取阿里云 AK/SK
  const providerOpts = providerConfig?.providerOptions ?? undefined;
  const accessKeyId = readOptString(providerOpts, 'accessKeyId') ?? '';
  const accessKeySecret = readOptString(providerOpts, 'accessKeySecret') ?? '';

  if (!providerConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>未找到该提供商的配置</Text>
      </View>
    );
  }

  const providerName = providerMeta?.name ?? selectedProviderId;

  /** 更新 providerOptions 中指定字段。 */
  const updateProviderOption = (key: string, value: unknown): void => {
    setPDFProviderConfig(selectedProviderId, {
      providerOptions: { ...providerOpts, [key]: value },
    });
  };

  /** 处理 PDF 测试按钮点击。 */
  const handleTest = async (): Promise<void> => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await fetch(resolvePdfTestUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          apiKey: providerConfig.apiKey ?? '',
          baseUrl: providerConfig.baseUrl ?? '',
          accessKeyId,
          accessKeySecret,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (response.ok && data.success !== false) {
        setTestStatus('success');
        setTestMessage('PDF 解析测试成功');
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

  /** 判断是否可测试。 */
  const canTest = (): boolean => {
    if (isServerConfigured) return true;
    if (isAliDocMind) {
      return !!accessKeyId.trim() && !!accessKeySecret.trim();
    }
    if (isMineru) {
      return !!providerConfig.baseUrl.trim();
    }
    if (isUnpdf) {
      return true;
    }
    return !!providerConfig.apiKey.trim();
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title={providerName}
        action={
          <Badge variant={isUnpdf ? 'success' : 'default'}>
            {isUnpdf ? '内置' : isAliDocMind ? '阿里云' : '自托管'}
          </Badge>
        }
      />

      {/* 启用/禁用开关 */}
      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Label>启用此提供商</Label>
            <Text style={styles.hint}>启用后可在文档解析功能中使用</Text>
          </View>
          <Switch
            value={providerConfig.enabled}
            onValueChange={(checked) =>
              setPDFProviderConfig(selectedProviderId, { enabled: checked })
            }
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

      {/* 内置 unpdf 提示 */}
      {isUnpdf && !isServerConfigured && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            unpdf 为内置 PDF 解析方案，基于 unpdf JavaScript 库在客户端/服务器解析，
            无需任何凭证配置。
          </Text>
        </View>
      )}

      {/* 凭证配置 - 阿里云 AliDocMind */}
      {isAliDocMind && !isServerConfigured && (
        <Card style={styles.section}>
          <SectionHeader title="阿里云凭证" />
          <View style={styles.field}>
            <Label>Access Key ID</Label>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  value={accessKeyId}
                  onChangeText={(text) => updateProviderOption('accessKeyId', text)}
                  placeholder="LTAI..."
                  secureTextEntry={!showAccessKeyId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>
              <IconButton
                icon={showAccessKeyId ? 'eye-slash' : 'eye'}
                onPress={() => setShowAccessKeyId((v) => !v)}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Label>Access Key Secret</Label>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  value={accessKeySecret}
                  onChangeText={(text) => updateProviderOption('accessKeySecret', text)}
                  placeholder="请输入 Access Key Secret"
                  secureTextEntry={!showAccessKeySecret}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>
              <IconButton
                icon={showAccessKeySecret ? 'eye-slash' : 'eye'}
                onPress={() => setShowAccessKeySecret((v) => !v)}
              />
            </View>
          </View>
        </Card>
      )}

      {/* 凭证配置 - MinerU (仅需 Base URL) */}
      {isMineru && !isServerConfigured && (
        <Card style={styles.section}>
          <SectionHeader title="服务地址" />
          <View style={styles.field}>
            <Label>Base URL</Label>
            <Input
              value={providerConfig.baseUrl}
              onChangeText={(text) =>
                setPDFProviderConfig(selectedProviderId, { baseUrl: text })
              }
              placeholder="http://localhost:8888"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />
            <Text style={styles.hint}>
              MinerU 自托管服务的完整地址，例如 http://localhost:8888
            </Text>
          </View>
        </Card>
      )}

      {/* 凭证配置 - 其他需要 API Key 的提供商 */}
      {!isAliDocMind && !isMineru && !isUnpdf && !isServerConfigured && (
        <Card style={styles.section}>
          <SectionHeader title="API 凭证" />
          <View style={styles.field}>
            <Label>API Key</Label>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  value={providerConfig.apiKey}
                  onChangeText={(text) =>
                    setPDFProviderConfig(selectedProviderId, { apiKey: text })
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
                setPDFProviderConfig(selectedProviderId, { baseUrl: text })
              }
              placeholder="http://localhost:8000/v1"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />
          </View>
        </Card>
      )}

      {/* 连通性测试 */}
      {!isUnpdf || isServerConfigured ? (
        <Card style={styles.section}>
          <SectionHeader title="连通性测试" />
          <Button
            onPress={handleTest}
            loading={testStatus === 'testing'}
            disabled={testStatus === 'testing' || !canTest()}
          >
            测试 PDF 解析
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
      ) : null}
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
  testResult: { marginTop: 8, padding: 10, borderRadius: 8 },
  testResultSuccess: { backgroundColor: '#DCFCE7' },
  testResultError: { backgroundColor: colors.destructiveLight },
  testResultText: { fontSize: 12 },
  testResultTextSuccess: { color: colors.success },
  testResultTextError: { color: colors.destructive },
});
