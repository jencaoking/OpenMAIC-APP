/**
 * @file UsageDashboard.tsx
 * @description 用量统计仪表板（移动端）。
 *
 * 1:1 对应 Web 端 `components/settings/usage-dashboard.tsx` 的功能，
 * 但完全使用 React Native 原生组件实现，禁用 ECharts。
 *
 * 主要功能：
 * - 从 `${EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/usage` 拉取用量数据
 * - 总览卡片：总请求数 + 各模态（LLM/Image/Video/TTS/ASR）用量汇总
 * - 每日趋势柱状图：纯 RN 实现（View + Animated），最多显示 14 天
 * - 按模态分组的表格：每个模态一个 Card，内含模型名 + 请求数 + 用量
 *
 * 严格隔离规则：
 * - 仅依赖 `react-native`、`./ui`、`../types`、`../i18n`
 * - 不引用 `@openmaic/storage`、`echarts`、`react-native-chart-kit` 等运行时
 * - 不引用 Web 端 `@/components/ui/*` 或 `@/lib/hooks/use-i18n`
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import { Button, Card, colors } from './ui';
import type { ButtonProps } from './ui';
import { useSettingsI18n } from '../i18n';
import type { TranslateFn } from '../i18n';
import type { UsageBucket, UsageResponse } from '../types';

/**
 * API 基础 URL。
 *
 * 通过 Expo 公共环境变量 `EXPO_PUBLIC_API_URL` 在构建时内联，
 * 缺省回退到本地开发服务器。
 */
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/** 用量模态类型（与 `UsageBucket.kind` 一致）。 */
type UsageKind = 'llm' | 'image' | 'video' | 'tts' | 'asr';

/** 用量单位类型（与 `UsageBucket.unit` 一致）。 */
type UsageUnit = 'token' | 'image' | 'second' | 'character';

/** 模态 → i18n key 映射。 */
const KIND_LABEL_KEY: Record<UsageKind, string> = {
  llm: 'settings.usage.kindLlm',
  image: 'settings.usage.kindImage',
  video: 'settings.usage.kindVideo',
  tts: 'settings.usage.kindTts',
  asr: 'settings.usage.kindAsr',
};

/** 单位 → i18n key 映射。 */
const UNIT_LABEL_KEY: Record<UsageUnit, string> = {
  token: 'settings.usage.unitToken',
  image: 'settings.usage.unitImage',
  second: 'settings.usage.unitSecond',
  character: 'settings.usage.unitCharacter',
};

/** 模态显示顺序（与 Web 端一致）。 */
const KIND_ORDER: UsageKind[] = ['llm', 'image', 'video', 'tts', 'asr'];

/** 每日趋势图最多显示的天数。 */
const MAX_DAYS_TO_SHOW = 14;

/** 趋势图柱子的最大高度（pt）。 */
const BAR_MAX_HEIGHT = 120;

/** 趋势图柱子的宽度（pt）。 */
const BAR_WIDTH = 14;

/**
 * 格式化大数字为带 K/M 后缀的紧凑表示。
 *
 * @param n - 原始数字
 * @returns 紧凑表示，如 `1.2K`、`3.4M`
 */
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

/**
 * 格式化日期 key（YYYY-MM-DD）为 MM/DD 短格式。
 *
 * @param key - ISO 日期字符串
 * @returns 短格式日期，解析失败时原样返回
 */
function fmtDateShort(key: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return key;
  return `${match[2]}/${match[3]}`;
}

/**
 * 计算某个 bucket 的用量数值（LLM 用 token，其他模态用 quantity）。
 *
 * @param b - 用量桶
 * @returns 用量数值
 */
function usageValue(b: UsageBucket): number {
  return b.kind === 'llm' ? b.totalTokens : b.quantity;
}

/**
 * 计算某个 bucket 的用量显示文本（数值 + 单位）。
 *
 * @param b - 用量桶
 * @param t - 翻译函数
 * @returns 形如 `1.2K Token` 的字符串
 */
function usageDisplay(b: UsageBucket, t: TranslateFn): string {
  const unitKey = b.kind === 'llm' ? 'token' : b.unit;
  return `${fmtNum(usageValue(b))} ${t(UNIT_LABEL_KEY[unitKey])}`;
}

/**
 * UsageDashboard 组件属性。
 *
 * 目前无外部属性，预留以备未来扩展（如传入自定义 API URL）。
 */
export interface UsageDashboardProps {
  /** 可选的自定义 API 基础 URL，缺省使用 `EXPO_PUBLIC_API_URL` 环境变量。 */
  apiBaseUrl?: string;
}

/**
 * 用量统计仪表板组件。
 *
 * 在挂载时自动拉取一次数据，并提供刷新按钮触发重新拉取。
 * 数据结构遵循 `UsageResponse` 类型契约。
 *
 * @param props - 组件属性
 * @returns React 节点
 */
export function UsageDashboard({ apiBaseUrl = API_BASE }: UsageDashboardProps): ReactNode {
  const { t } = useSettingsI18n();
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 拉取用量数据。
   *
   * - 成功：写入 `data`，清空 `error`
   * - 失败：写入 `error`，保留上次成功的 `data`
   * - 任何情况：最后将 `loading` 置为 false
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/usage`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as UsageResponse & { success?: boolean };
      if (json.success === false) {
        throw new Error('Server returned success=false');
      }
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDay = useMemo<UsageBucket[]>(() => data?.byDay ?? [], [data]);

  /**
   * 按模态分组的 sections：
   * - 每个 section 含模态汇总（kindBucket）与该模态下的模型列表
   * - 跳过空模态
   * - 模型按请求数降序排列
   */
  const sections = useMemo(() => {
    const byKind = new Map<UsageKind, { kindBucket?: UsageBucket; models: UsageBucket[] }>();
    for (const m of data?.byModel ?? []) {
      const existing = byKind.get(m.kind as UsageKind);
      if (existing) {
        existing.models.push(m);
      } else {
        byKind.set(m.kind as UsageKind, { models: [m] });
      }
    }
    for (const k of data?.byKind ?? []) {
      const entry = byKind.get(k.kind as UsageKind);
      if (entry) entry.kindBucket = k;
    }
    return KIND_ORDER.filter((k) => byKind.has(k)).map((k) => {
      const entry = byKind.get(k)!;
      return {
        kind: k,
        summary: entry.kindBucket,
        models: [...entry.models].sort((a, b) => b.requests - a.requests),
      };
    });
  }, [data]);

  const totals = data?.totals;

  return (
    <View style={styles.container}>
      {/* 标题 + 刷新按钮 */}
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>{t('settings.usage.title')}</Text>
        <RefreshButton onClick={load} loading={loading} t={t} />
      </View>

      <Text style={styles.disclaimerText}>{t('settings.usage.disclaimer')}</Text>

      {/* 错误提示 */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{t('settings.usage.empty')}</Text>
          <Text style={styles.errorDetailText} numberOfLines={2}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* 总览 + 模态汇总 chips */}
      {sections.length > 0 ? (
        <View style={styles.summaryWrap}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryChipLabel}>{t('settings.usage.totalRequests')}</Text>
            <Text style={styles.summaryChipValue}>{totals?.requests ?? 0}</Text>
          </View>
          {sections.map((s) =>
            s.summary ? (
              <View key={s.kind} style={styles.summaryChip}>
                <Text style={styles.summaryChipLabel}>{t(KIND_LABEL_KEY[s.kind])}</Text>
                <Text style={styles.summaryChipValue}>{usageDisplay(s.summary, t)}</Text>
                <Text style={styles.summaryChipSub}>({s.summary.requests})</Text>
              </View>
            ) : null,
          )}
        </View>
      ) : null}

      {/* 每日请求趋势柱状图 */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>{t('settings.usage.dailyTrend')}</Text>
        {byDay.length > 0 ? (
          <DailyTrendChart buckets={byDay} maxDays={MAX_DAYS_TO_SHOW} t={t} />
        ) : (
          <View style={styles.emptyChartBox}>
            <Text style={styles.emptyChartText}>{t('settings.usage.empty')}</Text>
          </View>
        )}
      </Card>

      {/* 按模态分组的表格 */}
      {sections.map((s) => (
        <Card key={s.kind} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKindLabel}>{t(KIND_LABEL_KEY[s.kind])}</Text>
            {s.summary ? (
              <Text style={styles.sectionSummaryText}>
                {usageDisplay(s.summary, t)} · {s.summary.requests} {t('settings.usage.reqs')}
              </Text>
            ) : null}
          </View>

          {/* 表头 */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, styles.tableColModel]}>
              {t('settings.usage.model')}
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableColReqs]}>
              {t('settings.usage.reqs')}
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableColUsage]}>
              {t('settings.usage.usage')}
            </Text>
          </View>

          {/* 表体 */}
          {s.models.map((m) => (
            <View key={m.key} style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.tableColModel, styles.modelCellText]}>
                {m.key}
              </Text>
              <Text style={[styles.tableCellText, styles.tableColReqs, styles.rightAlign]}>
                {m.requests}
              </Text>
              <Text style={[styles.tableCellText, styles.tableColUsage, styles.rightAlign]}>
                {usageDisplay(m, t)}
              </Text>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

// =========================================================================
// DailyTrendChart — 纯 RN 实现的简单柱状图
// =========================================================================

/**
 * DailyTrendChart 组件属性。
 */
interface DailyTrendChartProps {
  /** 用量桶数据，按 day 维度聚合。 */
  buckets: UsageBucket[];
  /** 最多显示的天数（取最近 N 天）。 */
  maxDays: number;
  /** 翻译函数。 */
  t: TranslateFn;
}

/**
 * 每日请求趋势柱状图（纯 RN 实现）。
 *
 * 实现细节：
 * - 取最近 `maxDays` 天的数据
 * - 每根柱子是一个 `Animated.View`，挂载时从高度 0 弹簧动画到目标高度
 * - 柱子高度按当前数据集最大值等比缩放，上限 `BAR_MAX_HEIGHT`
 * - 横向滚动（数据超出屏宽时）
 * - 每根柱子顶部显示数值（紧凑格式），底部显示日期（MM/DD）
 *
 * @param props - 组件属性
 * @returns React 节点
 */
function DailyTrendChart({ buckets, maxDays, t }: DailyTrendChartProps): ReactNode {
  // 取最近 N 天
  const recent = useMemo(
    () => buckets.slice(Math.max(0, buckets.length - maxDays)),
    [buckets, maxDays],
  );

  // 计算最大请求数（用于等比缩放）
  const maxRequests = useMemo(() => {
    const m = recent.reduce((acc, b) => (b.requests > acc ? b.requests : acc), 0);
    return m > 0 ? m : 1;
  }, [recent]);

  if (recent.length === 0) {
    return (
      <View style={styles.emptyChartBox}>
        <Text style={styles.emptyChartText}>{t('settings.usage.empty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
      <View style={styles.chartRow}>
        {recent.map((b, i) => {
          const ratio = b.requests / maxRequests;
          const targetHeight = Math.max(2, Math.round(ratio * BAR_MAX_HEIGHT));
          return (
            <BarColumn
              key={`${b.key}-${i}`}
              dateLabel={fmtDateShort(b.key)}
              valueLabel={fmtNum(b.requests)}
              targetHeight={targetHeight}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

/**
 * BarColumn 组件属性。
 */
interface BarColumnProps {
  /** 顶部数值文本。 */
  valueLabel: string;
  /** 底部日期文本。 */
  dateLabel: string;
  /** 目标柱子高度（pt）。 */
  targetHeight: number;
}

/**
 * 单根柱子（含数值标签、柱体、日期标签）。
 *
 * 柱体高度通过 `Animated.spring` 从 0 弹簧动画到 `targetHeight`。
 *
 * @param props - 组件属性
 * @returns React 节点
 */
function BarColumn({ valueLabel, dateLabel, targetHeight }: BarColumnProps): ReactNode {
  // 初始化高度为 0，挂载后动画到目标高度
  const heightRef = useRef(new Animated.Value(0));
  // 持有最新目标高度，避免在依赖数组中传入 targetHeight 导致每次重渲染都重置
  const targetRef = useRef(targetHeight);
  targetRef.current = targetHeight;

  useEffect(() => {
    Animated.spring(heightRef.current, {
      toValue: targetRef.current,
      useNativeDriver: false,
      damping: 18,
      stiffness: 200,
      overshootClamping: true,
    }).start();
  }, []);

  const animatedStyle: Animated.WithAnimatedValue<ViewStyle> = {
    height: heightRef.current,
    width: BAR_WIDTH,
    backgroundColor: colors.primary,
    borderRadius: 3,
  };

  return (
    <View style={styles.barColumn}>
      <Text style={styles.barValueLabel} numberOfLines={1}>
        {valueLabel}
      </Text>
      <View style={styles.barTrack} testID="usage-bar-track">
        <Animated.View style={animatedStyle} />
      </View>
      <Text style={styles.barDateLabel} numberOfLines={1}>
        {dateLabel}
      </Text>
    </View>
  );
}

// =========================================================================
// RefreshButton — 刷新按钮（封装图标 + loading 指示器）
// =========================================================================

/**
 * RefreshButton 组件属性。
 */
interface RefreshButtonProps extends ButtonProps {
  /** 点击回调。 */
  onClick: () => void;
  /** 是否正在加载。 */
  loading: boolean;
  /** 翻译函数。 */
  t: TranslateFn;
}

/**
 * 刷新按钮：variant=outline，size=sm，含 ↻ 字形与 loading 指示器。
 *
 * @param props - 组件属性
 * @returns React 节点
 */
function RefreshButton({ onClick, loading, t }: RefreshButtonProps): ReactNode {
  return (
    <Button variant="outline" size="sm" onPress={onClick} disabled={loading}>
      {loading ? (
        <View style={styles.refreshButtonContent}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.refreshButtonText}>{t('settings.usage.refresh')}</Text>
        </View>
      ) : (
        <View style={styles.refreshButtonContent}>
          <Text style={styles.refreshIconGlyph}>{'\u21BB'}</Text>
          <Text style={styles.refreshButtonText}>{t('settings.usage.refresh')}</Text>
        </View>
      )}
    </Button>
  );
}

// =========================================================================
// Styles
// =========================================================================

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: -4,
    lineHeight: 16,
  },

  // Error
  errorBox: {
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.destructiveLight,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.destructive,
    marginBottom: 4,
  },
  errorDetailText: {
    fontSize: 11,
    color: colors.muted,
  },

  // Summary chips
  summaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  summaryChipLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  summaryChipValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  summaryChipSub: {
    fontSize: 11,
    color: colors.muted,
  },

  // Chart
  chartCard: {
    padding: 12,
  },
  chartTitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },
  chartScroll: {
    marginHorizontal: -4,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 4,
    minHeight: BAR_MAX_HEIGHT + 32,
  },
  emptyChartBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    color: colors.muted,
  },

  // Bar column
  barColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    width: BAR_WIDTH + 8,
    gap: 4,
  },
  barValueLabel: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: '500',
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barDateLabel: {
    fontSize: 9,
    color: colors.muted,
  },

  // Refresh button
  refreshButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshIconGlyph: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '500',
  },
  refreshButtonText: {
    fontSize: 12,
    color: colors.foreground,
    fontWeight: '600',
  } as TextStyle,

  // Section / table
  sectionCard: {
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  sectionKindLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  sectionSummaryText: {
    fontSize: 11,
    color: colors.muted,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  } as TextStyle,
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tableCellText: {
    fontSize: 12,
    color: colors.foreground,
  } as TextStyle,
  tableColModel: {
    flex: 2,
    textAlign: 'left',
  } as TextStyle,
  tableColReqs: {
    flex: 1,
    textAlign: 'right',
  } as TextStyle,
  tableColUsage: {
    flex: 1.2,
    textAlign: 'right',
  } as TextStyle,
  rightAlign: {
    textAlign: 'right',
  } as TextStyle,
  modelCellText: {
    fontFamily: 'monospace',
    fontSize: 11,
  } as TextStyle,
});
