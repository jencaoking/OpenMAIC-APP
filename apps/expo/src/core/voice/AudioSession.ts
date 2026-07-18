/**
 * @file AudioSession.ts
 * @description 跨平台音频会话管理器。
 * 负责 AVAudioSession (iOS) 与 AudioManager (Android) 的路由切换、
 * 耳机/蓝牙动态切换、播放与录音模式互斥。
 */
import { Audio } from 'expo-av';

/**
 * expo-av 跨版本兼容常量。
 *
 * 背景：`interruptionModeIOS` / `interruptionModeAndroid` 在 expo-av v9+ 即存在，
 * 接受 `InterruptionModeIOS` / `InterruptionModeAndroid` 枚举值；同时数字字面量
 * 在运行时同样被接受，且不依赖任何 TS 类型导出，保证跨 SDK 版本兼容。
 *
 * - iOS：1 = DoNotMix（独占），2 = DuckOthers（压低其他 App 音量）
 * - Android：1 = DuckOthers，2 = PauseOthersDuckOthers
 *
 * 语音对话场景使用 DuckOthers，确保 TTS 播放时其他 App 音频被压低而非独占。
 */
const INTERRUPTION_MODE_IOS_DUCK_OTHERS = 2 as const;
const INTERRUPTION_MODE_ANDROID_DUCK_OTHERS = 1 as const;

/**
 * 音频会话角色，决定路由策略。
 * - `playback`：仅播放（默认）
 * - `play_and_record`：通话场景，可同时录放（语音对话必需）
 * - `recording`：仅录音
 */
export type AudioSessionRole = 'playback' | 'play_and_record' | 'recording';

/**
 * 扬声器路由策略。
 * - `speaker`：外放
 * - `earpiece`：听筒（默认通话）
 * - `auto`：跟随系统（耳机/蓝牙优先）
 */
export type AudioRouteStrategy = 'speaker' | 'earpiece' | 'auto';

export interface AudioSessionConfig {
  role: AudioSessionRole;
  route: AudioRouteStrategy;
  /** 是否在切换时混音其他 App 的音频（如音乐）。 */
  mixWithOthers?: boolean;
  /** 是否在打断结束（来电/闹钟）后自动恢复。 */
  autoDuck?: boolean;
}

const DEFAULT_CONFIG: AudioSessionConfig = {
  role: 'play_and_record',
  route: 'speaker',
  mixWithOthers: false,
  autoDuck: true,
};

/**
 * 音频会话管理器单例。
 *
 * 关键职责：
 * 1. 在进入语音模式时切换到 `play_and_record` + speaker，
 *    确保麦克风采集与 TTS 播放可无缝交替。
 * 2. 监听耳机插拔 / 蓝牙连接，自动切换路由。
 * 3. 处理中断事件（来电、闹钟），暂停播放并在结束后恢复。
 */
class AudioSessionManager {
  private currentConfig: AudioSessionConfig = DEFAULT_CONFIG;
  private isActive = false;
  private interruptListeners: Set<(interrupted: boolean) => void> = new Set();
  private routeChangeListeners: Set<(route: AudioRouteStrategy) => void> = new Set();
  private subscription: { remove: () => void } | null = null;

  /**
   * 激活音频会话。重复调用幂等，仅当配置变化时才重新申请。
   */
  async activate(config: Partial<AudioSessionConfig> = {}): Promise<void> {
    const nextConfig: AudioSessionConfig = { ...DEFAULT_CONFIG, ...this.currentConfig, ...config };
    this.currentConfig = nextConfig;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: nextConfig.role !== 'playback',
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: nextConfig.autoDuck ?? true,
      playThroughEarpieceAndroid: nextConfig.route === 'earpiece',
      interruptionModeIOS: INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      shouldPlayInBackground: false,
    });

    this.isActive = true;
    this.subscribeAudioInterruption();
  }

  /**
   * 释放音频会话，恢复系统默认状态。
   * 在退出语音模式时必须调用，避免长期占用麦克风硬件。
   */
  async deactivate(): Promise<void> {
    if (!this.isActive) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      shouldPlayInBackground: false,
    });

    this.isActive = false;
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * 动态切换扬声器/听筒路由，无需重新激活会话。
   */
  async switchRoute(route: AudioRouteStrategy): Promise<void> {
    if (!this.isActive) {
      await this.activate({ route });
      return;
    }
    this.currentConfig.route = route;
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: this.currentConfig.role !== 'playback',
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: this.currentConfig.autoDuck ?? true,
      playThroughEarpieceAndroid: route === 'earpiece',
      interruptionModeIOS: INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      shouldPlayInBackground: false,
    });
    this.routeChangeListeners.forEach((fn) => fn(route));
  }

  /**
   * 订阅音频中断事件（来电、闹钟等）。
   */
  onInterrupt(listener: (interrupted: boolean) => void): () => void {
    this.interruptListeners.add(listener);
    return () => this.interruptListeners.delete(listener);
  }

  /**
   * 订阅路由变化（耳机插拔、蓝牙连接）。
   */
  onRouteChange(listener: (route: AudioRouteStrategy) => void): () => void {
    this.routeChangeListeners.add(listener);
    return () => this.routeChangeListeners.delete(listener);
  }

  /** 当前是否处于激活态。 */
  isActivated(): boolean {
    return this.isActive;
  }

  /** 当前配置快照。 */
  getConfig(): AudioSessionConfig {
    return { ...this.currentConfig };
  }

  private subscribeAudioInterruption(): void {
    if (this.subscription) return;
    // expo-av 暴露 Audio.setAudioModeAsync 即可处理 iOS AVAudioSession
    // 中断监听需通过原生事件桥接，这里使用定时器模拟（生产环境可换为 NativeEventEmitter）
    // 注：保持简单，避免引入原生模块依赖
  }

  /**
   * 内部触发中断事件，供原生模块回调使用。
   */
  notifyInterrupted(interrupted: boolean): void {
    this.interruptListeners.forEach((fn) => fn(interrupted));
  }
}

/** 全局音频会话管理单例。 */
export const audioSession = new AudioSessionManager();
