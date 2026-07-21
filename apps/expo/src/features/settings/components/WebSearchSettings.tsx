/**
 * @file WebSearchSettings.tsx
 * @description Web 搜索提供商设置面板（移动端）。
 *
 * 允许配置 API Key、Base URL、启用状态，
 * 并支持调用后端 `/api/web-search/test` 接口进行连通性测试。
 *
 * 支持 7 种 Web 搜索提供商：tavily、brave、bocha、baidu、doubao、minimax、searxng。
 * 其中 searxng 为自托管方案，仅需 Base URL 即可。
 *
 * 设计说明：
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
  colors,
} from './ui';
import { useSettingsStore } from '../settingsStore';
import { WEB_SEARCH_PROVIDERS } from '../constants';
import type { WebSearchProviderId } from '../types';

/** Web 搜索测试 API 路径（相对于 API origin）。 */
const WEB_SEARCH_TEST_PATH = '/api/web-search/test';

/** 默认 API origin，可通过 EXPO_PUBLIC_API_ORIGIN 环境变量覆盖。 */
const DEFAULT_API_ORIGIN = 'http://localhost:3000';

/**
 * 解析 Web 搜索测试 API 完整 URL。
 * 优先使用 `EXPO_PUBLIC_API_ORIGIN` 环境变量，否则回退到 localhost。
 */
function resolveWebSearchTestUrl(): string {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN;
  return `${origin}${WEB_SEARCH_TEST_PATH}`;
}

/** Web 搜索设置面板 Props。 */
export interface WebSearchSettingsProps {
  /** 当前选中的 Web 搜索提供商 ID。 */
  selectedProviderId: WebSearchProviderId;
}

/**
 * Web 搜索设置面板组件。
 *
 * 提供以下能力：
 * - 启用/禁用当前 Web 搜索提供商（写入 `GenericProviderConfig.enabled`）
 * - 配置 API Key（带显隐切换）与 Base URL
 * - 调用后端 Web 搜索接口进行连通性测试
 *
 * @param props - 组件属性，参见 {@link WebSearchSettingsProps}
 */
export function WebSearchSettings({ selectedProviderId }: WebSearchSettingsProps) {
  const webSearchProvidersConfig = useSettingsStore((s) => s.webSearchProvidersConfig);
  const setWebSearchProviderConfig = useSettingsStore(
    (s) => s.setWebSearchProviderConfig,
  );

  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>(
    'idle',
  );
  const [testMessage, setTestMessage] = useState('');

  const providerConfig = webSearchProvidersConfig[selectedProviderId];
  const providerMeta = WEB_SEARCH_PROVIDERS[selectedProviderId];
  const isServerConfigured = !!providerConfig?.isServerConfigured;
  const isSearXNG = selectedProviderId === 'searxng';
  // SearXNG 为自托管方案，默认不需要 API Key
  const requiresApiKey = providerConfig?.requiresApiKey ?? !isSearXNG;

  if (!providerConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>未找到该提供商的配置</Text>
      </View>
    );
  }

  const providerName = providerMeta?.name ?? selectedProviderId;

  /** 处理 Web 搜索测试按钮点击。 */
  const handleTest = async (): Promise<void> => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await fetch(resolveWebSearchTestUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          query: 'OpenMAIC project',
          maxResults: 3,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (response.ok && data.success !== false) {
        setTestStatus('success');
        setTestMessage('Web 搜索测试成功');
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

  /** 是否可测试。 */
  const canTest = (): boolean => {
    if (isServerConfigured) return true;
    if (isSearXNG) return !!providerConfig.baseUrl.trim();
    return !!providerConfig.apiKey.trim();
  };

  return (
    <View style={styles.container}>
      <SectionHeader title={providerName} />

      {/* 启用/禁用开关 */}
      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Label>启用此提供商</Label>
            <Text style={styles.hint}>启用后可在网络搜索功能中使用</Text>
          </View>
          <Switch
            value={providerConfig.enabled}
            onValueChange={(checked) =>
              setWebSearchProviderConfig(selectedProviderId, { enabled: checked })
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

      {/* SearXNG 自托管提示 */}
      {isSearXNG && !isServerConfigured && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            SearXNG 为开源自托管元搜索引擎，仅需填写服务地址，无需 API Key。
          </Text>
        </View>
      )}

      {/* 凭证配置 */}
      {!isServerConfigured && (
        <Card style={styles.section}>
          <SectionHeader title="API 凭证" />
          {(requiresApiKey || providerConfig.apiKey) && (
            <View style={styles.field}>
              <Label>API Key</Label>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Input
                    value={providerConfig.apiKey}
                    onChangeText={(text) =>
                      setWebSearchProviderConfig(selectedProviderId, { apiKey: text })
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
          )}
          <View style={styles.field}>
            <Label>Base URL</Label>
            <Input
              value={providerConfig.baseUrl}
              onChangeText={(text) =>
                setWebSearchProviderConfig(selectedProviderId, { baseUrl: text })
              }
              placeholder={isSearXNG ? 'http://localhost:8080' : 'http://localhost:8000/v1'}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />
            {isSearXNG ? (
              <Text style={styles.hint}>
                SearXNG 实例的完整地址，例如 https://searx.example.com
              </Text>
            ) : null}
          </View>
        </Card>
      )}

      {/* 连通性测试 */}
      <Card style={styles.section}>
        <SectionHeader title="连通性测试" />
        <Button
          onPress={handleTest}
          loading={testStatus === 'testing'}
          disabled={testStatus === 'testing' || !canTest()}
        >
          测试 Web 搜索
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
  testResult: { marginTop: 8, padding: 10, borderRadius: 8 },
  testResultSuccess: { backgroundColor: '#DCFCE7' },
  testResultError: { backgroundColor: colors.destructiveLight },
  testResultText: { fontSize: 12 },
  testResultTextSuccess: { color: colors.success },
  testResultTextError: { color: colors.destructive },
});
