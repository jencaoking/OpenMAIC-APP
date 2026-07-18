/**
 * @file WidgetBridge.ts
 * @description 桌面 Widget 桥接层（iOS WidgetKit + Android AppWidgetProvider）。
 *
 * 设计说明：
 * 与 LiveActivityBridge 类似，通过 NativeModules 桥接原生 Widget 实现。
 * TS 侧仅负责"数据投递"（App → Widget），不负责 Widget 渲染（由原生代码完成）。
 *
 * 2x2 Widget 数据契约（与原生 Widget UI 对齐）：
 *   - dailyProgress: 0~1，今日学习进度
 *   - unreadHint: AI 助教的一条未读提示
 *   - streakDays: 连续学习天数
 *
 * 投递方式：
 *   - iOS：使用 UserDefaults(suiteName: "group.com.openmaic.shared") 共享存储
 *   - Android：使用 SharedPreferences 或 ContentProvider
 *   - React Native 侧统一通过原生模块的 setData 方法写入
 */
import { NativeModules, Platform } from 'react-native';

/** 2x2 桌面 Widget 数据契约。 */
export interface DailyProgressWidgetData {
  /** 今日学习进度（0~1）。 */
  dailyProgress: number;
  /** AI 助教的未读提示文本（≤30 字）。 */
  unreadHint: string;
  /** 连续学习天数。 */
  streakDays: number;
  /** 最后更新时间（epoch ms）。 */
  updatedAt: number;
}

/** 原生模块接口契约。 */
interface NativeWidgetModule {
  setData(data: DailyProgressWidgetData): Promise<void>;
  getData(): Promise<DailyProgressWidgetData | null>;
  reloadAllTimelines(): Promise<void>;
}

const NATIVE_MODULE_NAME = 'WidgetBridge';

function getNativeModule(): NativeWidgetModule | null {
  const mod = NativeModules[NATIVE_MODULE_NAME];
  if (!mod) return null;
  return mod as NativeWidgetModule;
}

/**
 * Widget 桥接器。
 */
class WidgetBridge {
  private native: NativeWidgetModule | null;
  private cachedData: DailyProgressWidgetData | null = null;

  constructor() {
    this.native = getNativeModule();
    if (!this.native) {
      console.info(
        '[WidgetBridge] Native module not registered. Widget will be no-op. ' +
          'Add the iOS WidgetKit extension or Android AppWidgetProvider via config plugin.',
      );
    }
  }

  /**
   * 当前桥接器是否可用。
   */
  isAvailable(): boolean {
    return this.native !== null;
  }

  /**
   * 写入 Widget 数据并通知原生刷新时间线。
   */
  async setData(data: DailyProgressWidgetData): Promise<void> {
    this.cachedData = data;
    if (!this.native) return;
    try {
      await this.native.setData(data);
      await this.native.reloadAllTimelines();
    } catch (error) {
      console.warn('[WidgetBridge] setData failed:', error);
    }
  }

  /**
   * 读取缓存的 Widget 数据。
   */
  async getData(): Promise<DailyProgressWidgetData | null> {
    if (!this.native) return this.cachedData;
    try {
      return await this.native.getData();
    } catch {
      return this.cachedData;
    }
  }

  /**
   * 通知所有 Widget 刷新时间线（不修改数据）。
   * 适用于 App 内关键状态变更（如完成 Quiz、提交作业）。
   */
  async refresh(): Promise<void> {
    if (!this.native) return;
    try {
      await this.native.reloadAllTimelines();
    } catch (error) {
      console.warn('[WidgetBridge] refresh failed:', error);
    }
  }
}

/** 全局 Widget 桥接单例。 */
export const widgetBridge = new WidgetBridge();

/**
 * 构造一条"未读提示"文本的工具方法。
 * 根据最近的学习记录生成，截断到 30 字以适配 2x2 Widget 显示。
 */
export function buildUnreadHint(
  pendingQuizCount: number,
  pendingAssignmentCount: number,
  lastMessageSnippet?: string,
): string {
  if (pendingAssignmentCount > 0) {
    return truncate(`你昨天的代码作业有 ${pendingAssignmentCount} 个 Bug 待修复`, 30);
  }
  if (pendingQuizCount > 0) {
    return truncate(`还有 ${pendingQuizCount} 道题待完成`, 30);
  }
  if (lastMessageSnippet) {
    return truncate(lastMessageSnippet, 30);
  }
  return '今天还没有学习，去练一题吧！';
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

// 抑制 Platform 未使用的告警（保留以备未来按平台分流）
void Platform;
