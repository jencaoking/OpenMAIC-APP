/**
 * @file VadDetector.ts
 * @description 语音活动检测（Voice Activity Detection）。
 *
 * 实现策略：定时读取 expo-av 录音器的当前_meteringInfo（dBFS），
 * 滑动窗口平滑后与阈值比较。当连续 N 帧超过阈值时触发 `onSpeechStart`，
 * 当连续 M 帧低于阈值时触发 `onSpeechEnd`。
 *
 * 该实现不依赖第三方 VAD SDK，纯 TS 完成，体积小、可跨端。
 */
import { Audio } from 'expo-av';

export interface VadDetectorConfig {
  /** 触发说话开始的音量阈值（0~1，归一化后）。默认 0.18。 */
  speechThreshold: number;
  /** 触发说话结束的音量阈值（0~1）。默认 0.08。 */
  silenceThreshold: number;
  /** 触发 speechStart 需要连续超阈值的帧数。默认 6（≈600ms）。 */
  speechStartFrames: number;
  /** 触发 speechEnd 需要连续低阈值的帧数。默认 20（≈2s）。 */
  speechEndFrames: number;
  /** 采样间隔（ms）。默认 100ms。 */
  sampleIntervalMs: number;
  /** 滑动窗口长度（帧数）。默认 5。 */
  smoothingWindow: number;
}

export interface VadDetectorCallbacks {
  /** 检测到用户开始说话。 */
  onSpeechStart?: () => void;
  /** 检测到用户停止说话。 */
  onSpeechEnd?: () => void;
  /** 每帧音量更新，用于驱动 UI 波形。 */
  onLevel?: (level: number) => void;
}

const DEFAULT_CONFIG: VadDetectorConfig = {
  speechThreshold: 0.18,
  silenceThreshold: 0.08,
  speechStartFrames: 6,
  speechEndFrames: 20,
  sampleIntervalMs: 100,
  smoothingWindow: 5,
};

/**
 * 将 dBFS（-160 ~ 0）归一化为 0~1 的音量值。
 * -160 dBFS → 0；0 dBFS → 1。
 */
function normalizeDbfs(dbfs: number): number {
  if (!Number.isFinite(dbfs)) return 0;
  const clamped = Math.max(-160, Math.min(0, dbfs));
  return Math.max(0, (clamped + 160) / 160);
}

/**
 * VAD 检测器。
 * 不持有录音器实例，由调用方注入 `Recording` 引用。
 */
export class VadDetector {
  private config: VadDetectorConfig;
  private callbacks: VadDetectorCallbacks;
  private recording: Audio.Recording | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private levelBuffer: number[] = [];
  private consecutiveSpeech = 0;
  private consecutiveSilence = 0;
  private isSpeaking = false;
  private isRunning = false;

  constructor(
    config: Partial<VadDetectorConfig> = {},
    callbacks: VadDetectorCallbacks = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  /**
   * 启动 VAD 检测。需要在 `recording.startAsync()` 完成后调用。
   */
  start(recording: Audio.Recording): void {
    if (this.isRunning) return;
    this.recording = recording;
    this.isRunning = true;
    this.resetCounters();

    this.timer = setInterval(() => {
      void this.tick();
    }, this.config.sampleIntervalMs);
  }

  /**
   * 停止 VAD 检测，清理定时器。
   */
  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.recording = null;
    this.resetCounters();
  }

  /**
   * 更新回调引用。UI 卸载时用于解绑。
   */
  updateCallbacks(callbacks: VadDetectorCallbacks): void {
    this.callbacks = callbacks;
  }

  /** 当前是否处于说话状态。 */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  private resetCounters(): void {
    this.levelBuffer = [];
    this.consecutiveSpeech = 0;
    this.consecutiveSilence = 0;
    this.isSpeaking = false;
  }

  private async tick(): Promise<void> {
    if (!this.recording || !this.isRunning) return;

    let level = 0;
    try {
      const status = await this.recording.getStatusAsync();
      // expo-av 在 iOS/Android 都提供 metering 字段（dBFS）
      const metering = (status as { metering?: number }).metering;
      if (typeof metering === 'number') {
        level = normalizeDbfs(metering);
      }
    } catch {
      // 录音器状态读取失败时静默降级
      level = 0;
    }

    const smoothed = this.pushAndSmooth(level);
    this.callbacks.onLevel?.(smoothed);

    if (smoothed >= this.config.speechThreshold) {
      this.consecutiveSpeech += 1;
      this.consecutiveSilence = 0;
      if (!this.isSpeaking && this.consecutiveSpeech >= this.config.speechStartFrames) {
        this.isSpeaking = true;
        this.callbacks.onSpeechStart?.();
      }
    } else if (smoothed <= this.config.silenceThreshold) {
      this.consecutiveSilence += 1;
      this.consecutiveSpeech = 0;
      if (this.isSpeaking && this.consecutiveSilence >= this.config.speechEndFrames) {
        this.isSpeaking = false;
        this.callbacks.onSpeechEnd?.();
      }
    } else {
      // 中间区间：维持当前状态，避免抖动
    }
  }

  private pushAndSmooth(level: number): number {
    this.levelBuffer.push(level);
    if (this.levelBuffer.length > this.config.smoothingWindow) {
      this.levelBuffer.shift();
    }
    return this.levelBuffer.reduce((a, b) => a + b, 0) / this.levelBuffer.length;
  }
}
