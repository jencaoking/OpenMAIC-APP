/**
 * @file TokenPlanSettings.tsx
 * @description Token 套餐设置面板（移动端）。
 *
 * 显示当前 LLM 提供商对应的 Token 套餐信息，包括：
 * - 当前套餐名称（基于 LLM providerId 推断显示名称）
 * - Token 使用进度条（已用 / 总额）
 * - 升级按钮（跳转外部购买链接）
 *
 * 设计说明：
 * - 当前为只读展示版本，使用量数据为占位实现（来自本地估算）。
 *   生产环境应通过 `useSettingsStore` 中的 usage 数据或调用后端
 *   `/api/usage` 接口获取真实用量。
 * - 升级链接通过 `react-native` 的 `Linking` 模块打开系统浏览器。
 * - 严格隔离：仅依赖 react-native 原生组件、./ui 共享组件、../settingsStore、
 *   ../constants、../types，不引用任何 Web 端包或 @openmaic/storage 运行时。
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { Button, Card, SectionHeader, Badge, colors } from './ui';
import { useSettingsStore } from '../settingsStore';
import { PROVIDERS } from '../constants';
import type { ProviderId } from '../types';

/** 升级购买链接（外部站点）。 */
const UPGRADE_URL = 'https://buy.openmaic.com/plans';

/** 默认 Token 配额（占位数据）。 */
const DEFAULT_QUOTA = 100_000;

/** 已用 Token 数量（占位数据，实际应从服务器获取）。 */
const DEFAULT_USED = 30_000;

/**
 * 千分位格式化数字（例如 100000 → "100,000"）。
 *
 * @param value - 待格式化的整数
 * @returns 千分位分隔的字符串
 */
function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * 根据用量比例返回对应的进度条颜色。
 *
 * @param ratio - 用量比例（0~1）
 * @returns 进度条颜色（绿色/黄色/红色）
 */
function getProgressColor(ratio: number): string {
  if (ratio >= 0.9) return colors.destructive;
  if (ratio >= 0.7) return colors.warning;
  return colors.success;
}

/**
 * Token 套餐设置面板组件。
 *
 * 展示当前 Token 套餐状态与用量，并提供升级入口。
 *
 * 注意：此组件不接受 props，全部状态从 `useSettingsStore` 读取。
 */
export function TokenPlanSettings() {
  const providerId = useSettingsStore((s) => s.providerId);
  const providersConfig = useSettingsStore((s) => s.providersConfig);

  const [usedTokens] = useState<number>(DEFAULT_USED);
  const [quotaTokens] = useState<number>(DEFAULT_QUOTA);

  const providerConfig = providersConfig[providerId as ProviderId];
  const providerMeta = PROVIDERS[providerId as ProviderId];
  const planName = providerConfig?.name ?? providerMeta?.name ?? providerId;
  const planType = providerConfig?.isBuiltIn ? '内置套餐' : '自定义套餐';

  const ratio = Math.min(1, Math.max(0, usedTokens / quotaTokens));
  const progressColor = getProgressColor(ratio);
  const remaining = Math.max(0, quotaTokens - usedTokens);

  /** 处理升级按钮点击，打开外部购买链接。 */
  const handleUpgrade = async (): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(UPGRADE_URL);
      if (supported) {
        await Linking.openURL(UPGRADE_URL);
      } else {
        console.warn(`[TokenPlanSettings] Cannot open URL: ${UPGRADE_URL}`);
      }
    } catch (error) {
      console.error('[TokenPlanSettings] Failed to open upgrade URL:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Token 套餐" />

      {/* 当前套餐展示 */}
      <Card style={styles.section}>
        <SectionHeader title="当前套餐" action={<Badge variant="default">{planType}</Badge>} />
        <View style={styles.planRow}>
          <View style={styles.flex1}>
            <Text style={styles.planName}>{planName}</Text>
            <Text style={styles.planId}>提供商 ID：{providerId}</Text>
          </View>
        </View>
      </Card>

      {/* Token 用量进度 */}
      <Card style={styles.section}>
        <SectionHeader title="Token 使用情况" />
        <View style={styles.usageBox}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageLabel}>已使用</Text>
            <Text style={styles.usageValue}>
              {formatNumber(usedTokens)} / {formatNumber(quotaTokens)}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${ratio * 100}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <View style={styles.usageFooter}>
            <Text style={[styles.usageRemaining, { color: progressColor }]}>
              剩余 {formatNumber(remaining)} Token
            </Text>
            <Text style={styles.usagePercent}>{Math.round(ratio * 100)}% 已用</Text>
          </View>
        </View>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            * 用量数据为预估值，实际用量以服务商账单为准。
            {'\n'}* 升级套餐后请刷新页面以同步最新配额。
          </Text>
        </View>
      </Card>

      {/* 升级套餐 */}
      <Card style={styles.section}>
        <SectionHeader title="升级套餐" />
        <Text style={styles.upgradeDesc}>
          升级到更高套餐以获得更多 Token 配额、更高并发限制和优先支持。 点击下方按钮前往购买页面。
        </Text>
        <Button onPress={handleUpgrade} style={styles.upgradeButton}>
          立即升级
        </Button>
        <Text style={styles.upgradeUrl}>跳转至：{UPGRADE_URL}</Text>
      </Card>

      {/* 平台说明 */}
      <Card style={styles.section}>
        <SectionHeader title="平台说明" />
        <Text style={styles.platformText}>
          当前运行平台：{Platform.OS}
          {'\n'}
          {'\n'}
          Token 套餐由服务端统一管理，本地仅做展示。如需切换套餐或修改配额，
          请通过升级按钮联系服务商或登录管理后台。
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  section: { padding: 12 },
  flex1: { flex: 1 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  planName: { fontSize: 18, fontWeight: '600', color: colors.foreground },
  planId: { fontSize: 12, color: colors.muted, marginTop: 4 },
  usageBox: { gap: 8, marginTop: 8 },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLabel: { fontSize: 14, color: colors.muted },
  usageValue: { fontSize: 14, fontWeight: '500', color: colors.foreground },
  progressTrack: {
    height: 12,
    backgroundColor: colors.mutedLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  usageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageRemaining: { fontSize: 12, fontWeight: '500' },
  usagePercent: { fontSize: 12, color: colors.muted },
  noticeBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  noticeText: { fontSize: 11, color: colors.muted, lineHeight: 18 },
  upgradeDesc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradeButton: { marginTop: 4 },
  upgradeUrl: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  platformText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
});
