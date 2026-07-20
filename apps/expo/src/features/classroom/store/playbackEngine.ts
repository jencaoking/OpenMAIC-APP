/**
 * 课堂播放引擎。
 * 管理播放状态、场景推进、语音同步。
 *
 * 移植自 Web 端 PlaybackEngine 的核心逻辑。
 */

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlaybackEngineCallbacks {
  /** 场景切换 */
  onSceneChange?: (sceneIndex: number) => void;
  /** 播放状态变化 */
  onStateChange?: (state: PlaybackState) => void;
  /** 语音文本更新 */
  onSpeechUpdate?: (text: string | null) => void;
  /** 播放进度更新 (0-1) */
  onProgressUpdate?: (progress: number) => void;
  /** 播放完成 */
  onPlaybackComplete?: () => void;
}

export class PlaybackEngine {
  private state: PlaybackState = 'idle';
  private currentSceneIndex: number = 0;
  private totalScenes: number = 0;
  private playbackTimer: ReturnType<typeof setTimeout> | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private progress: number = 0;
  private callbacks: PlaybackEngineCallbacks = {};

  // 每个场景的播放时长（毫秒）
  private sceneDuration: number = 5000;
  private elapsed: number = 0;

  constructor(callbacks: PlaybackEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /** 设置场景总数 */
  setTotalScenes(count: number) {
    this.totalScenes = count;
  }

  /** 设置每个场景的播放时长（毫秒） */
  setSceneDuration(ms: number) {
    this.sceneDuration = ms;
  }

  /** 开始播放 */
  play() {
    if (this.state === 'completed') {
      this.currentSceneIndex = 0;
      this.progress = 0;
    }

    this.setState('playing');
    this.startProgressTracking();
  }

  /** 暂停播放 */
  pause() {
    this.setState('paused');
    this.stopProgressTracking();
    this.clearPlaybackTimer();
  }

  /** 恢复播放 */
  resume() {
    if (this.state === 'paused') {
      this.setState('playing');
      this.startProgressTracking();
      this.scheduleNextScene();
    }
  }

  /** 停止播放 */
  stop() {
    this.setState('idle');
    this.stopProgressTracking();
    this.clearPlaybackTimer();
    this.progress = 0;
    this.elapsed = 0;
    this.callbacks.onProgressUpdate?.(0);
  }

  /** 跳转到指定场景 */
  goToScene(index: number) {
    if (index < 0 || index >= this.totalScenes) return;

    this.currentSceneIndex = index;
    this.elapsed = 0;
    this.progress = 0;
    this.callbacks.onSceneChange?.(index);
    this.callbacks.onProgressUpdate?.(0);

    if (this.state === 'playing') {
      this.clearPlaybackTimer();
      this.scheduleNextScene();
    }
  }

  /** 下一个场景 */
  nextScene() {
    if (this.currentSceneIndex < this.totalScenes - 1) {
      this.goToScene(this.currentSceneIndex + 1);
    } else {
      this.complete();
    }
  }

  /** 上一个场景 */
  prevScene() {
    if (this.currentSceneIndex > 0) {
      this.goToScene(this.currentSceneIndex - 1);
    }
  }

  /** 获取当前状态 */
  getState(): PlaybackState {
    return this.state;
  }

  /** 获取当前场景索引 */
  getCurrentSceneIndex(): number {
    return this.currentSceneIndex;
  }

  /** 获取播放进度 (0-1) */
  getProgress(): number {
    return this.progress;
  }

  /** 销毁引擎 */
  destroy() {
    this.stop();
    this.callbacks = {};
  }

  // ============ Private Methods ============

  private setState(state: PlaybackState) {
    if (this.state === state) return;
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  private startProgressTracking() {
    this.stopProgressTracking();
    this.elapsed = 0;

    this.progressTimer = setInterval(() => {
      if (this.state !== 'playing') return;

      this.elapsed += 100;
      this.progress = Math.min(this.elapsed / this.sceneDuration, 1);
      this.callbacks.onProgressUpdate?.(this.progress);

      // 场景时间到，自动切换
      if (this.elapsed >= this.sceneDuration) {
        this.nextScene();
      }
    }, 100);
  }

  private stopProgressTracking() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private scheduleNextScene() {
    this.clearPlaybackTimer();
    const remaining = this.sceneDuration - this.elapsed;

    if (remaining > 0) {
      this.playbackTimer = setTimeout(() => {
        this.nextScene();
      }, remaining);
    }
  }

  private clearPlaybackTimer() {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  private complete() {
    this.setState('completed');
    this.stopProgressTracking();
    this.clearPlaybackTimer();
    this.callbacks.onPlaybackComplete?.();
  }
}
