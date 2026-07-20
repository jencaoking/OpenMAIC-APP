/**
 * @file LiveActivityBridge.ts
 * @description iOS Live Activity / 灵动岛桥接层。
 *
 * 设计说明：
 * iOS 的 ActivityKit (Live Activity) 在 Expo managed workflow 中无原生支持，
 * 需通过 Config Plugin 注入原生 Swift 代码。这里提供一个 TypeScript 桥接层：
 *   - 通过 NativeModules 检测是否已注册原生模块
 *   - 暴露 start / update / end 三个核心 API
 *   - 在原生模块未注册时降级为 no-op 并打印警告
 *
 * 原生侧实现要点（需在 app.plugin.ts 中注入）：
 *   1. 创建 LiveActivityModule.swift，继承 RCTEventEmitter
 *   2. 暴露 startActivity(attrs: [String: Any]) -> String
 *   3. 暴露 updateActivity(id: String, attrs: [String: Any]) -> Void
 *   4. 暴露 endActivity(id: String, dismissToken: [String: Any]?) -> Void
 *   5. 在 Info.plist 启用 NSSupportsLiveActivities
 *   6. 创建 Widget Extension，定义 ActivityConfiguration
 *
 * 适用场景：
 *   - 限时 Quiz 倒计时（startTime + endTime + remainingSeconds）
 *   - AI 语音课程播放进度（chapterTitle + progress）
 */
import { NativeModules, Platform } from 'react-native';

/** Live Activity 状态。 */
export type LiveActivityStatus = 'active' | 'stale' | 'ended';

/** Quiz 倒计时场景的内容属性。 */
export interface QuizCountdownAttributes {
  kind: 'quiz-countdown';
  quizId: string;
  quizTitle: string;
  totalSeconds: number;
  startedAt: number; // epoch ms
  endsAt: number; // epoch ms
}

/** AI 语音课程场景的内容属性。 */
export interface VoiceLectureAttributes {
  kind: 'voice-lecture';
  sessionId: string;
  chapterTitle: string;
  chapterIndex: number;
  totalChapters: number;
}

/** Live Activity 通用内容属性。 */
export type LiveActivityAttributes = QuizCountdownAttributes | VoiceLectureAttributes;

/** Live Activity 实例句柄。 */
export interface LiveActivityHandle {
  id: string;
  status: LiveActivityStatus;
}

/** 原生模块接口契约。 */
interface NativeLiveActivityModule {
  startActivity(attributes: LiveActivityAttributes): Promise<string>;
  updateActivity(id: string, attributes: Partial<LiveActivityAttributes>): Promise<void>;
  endActivity(id: string): Promise<void>;
  getActiveActivities(): Promise<LiveActivityHandle[]>;
}

const NATIVE_MODULE_NAME = 'LiveActivityBridge';

/**
 * 检测原生模块是否已注册。
 */
function getNativeModule(): NativeLiveActivityModule | null {
  if (Platform.OS !== 'ios') return null;
  const mod = NativeModules[NATIVE_MODULE_NAME];
  if (!mod) return null;
  return mod as NativeLiveActivityModule;
}

/**
 * Live Activity 桥接器。
 *
 * 在原生模块不可用时所有方法降级为 no-op，便于在开发阶段直接调试，
 * 而不会因为没有原生模块而崩溃。
 */
class LiveActivityBridge {
  private native: NativeLiveActivityModule | null;
  private activeHandles: Map<string, LiveActivityHandle> = new Map();

  constructor() {
    this.native = getNativeModule();
    if (!this.native && Platform.OS === 'ios') {
      console.warn(
        '[LiveActivityBridge] Native module not registered. Live Activity will be no-op. ' +
          'Please add the iOS ActivityKit widget extension via config plugin.',
      );
    }
  }

  /**
   * 当前桥接器是否可用（iOS + 原生模块已注册）。
   */
  isAvailable(): boolean {
    return this.native !== null;
  }

  /**
   * 启动一个 Live Activity。
   * @returns 活动实例 ID；不可用时返回空字符串。
   */
  async start(attributes: LiveActivityAttributes): Promise<string> {
    if (!this.native) return '';
    try {
      const id = await this.native.startActivity(attributes);
      this.activeHandles.set(id, { id, status: 'active' });
      return id;
    } catch (error) {
      console.warn('[LiveActivityBridge] start failed:', error);
      return '';
    }
  }

  /**
   * 更新已存在的 Live Activity 内容。
   */
  async update(id: string, attributes: Partial<LiveActivityAttributes>): Promise<void> {
    if (!this.native || !id) return;
    try {
      await this.native.updateActivity(id, attributes);
    } catch (error) {
      console.warn('[LiveActivityBridge] update failed:', error);
    }
  }

  /**
   * 结束 Live Activity。
   */
  async end(id: string): Promise<void> {
    if (!this.native || !id) return;
    try {
      await this.native.endActivity(id);
      this.activeHandles.delete(id);
    } catch (error) {
      console.warn('[LiveActivityBridge] end failed:', error);
    }
  }

  /**
   * 获取当前活跃的 Live Activity 列表。
   * 用于 App 启动时恢复状态（如用户在 Quiz 进行中切到后台又回来）。
   */
  async getActive(): Promise<LiveActivityHandle[]> {
    if (!this.native) return [];
    try {
      return await this.native.getActiveActivities();
    } catch {
      return [];
    }
  }

  /**
   * 结束所有当前活跃的 Live Activity。
   * 在 App 退出登录或用户主动结束时调用。
   */
  async endAll(): Promise<void> {
    const handles = await this.getActive();
    await Promise.all(handles.map((h) => this.end(h.id)));
    this.activeHandles.clear();
  }
}

/** 全局 Live Activity 桥接单例（延迟初始化，避免 NativeModules 在模块加载时未就绪）。 */
let _liveActivityBridge: LiveActivityBridge | null = null;
export function getLiveActivityBridge(): LiveActivityBridge {
  if (!_liveActivityBridge) {
    _liveActivityBridge = new LiveActivityBridge();
  }
  return _liveActivityBridge;
}
export const liveActivityBridge = {
  start: (attrs: LiveActivityAttributes) => getLiveActivityBridge().start(attrs),
  update: (id: string, attrs: Partial<LiveActivityAttributes>) => getLiveActivityBridge().update(id, attrs),
  end: (id: string) => getLiveActivityBridge().end(id),
  getActive: () => getLiveActivityBridge().getActive(),
  endAll: () => getLiveActivityBridge().endAll(),
};
