/**
 * 流式文本缓冲器。
 * 管理语音文本的逐字显示效果。
 *
 * 移植自 Web 端 StreamBuffer 的核心逻辑。
 */

export interface StreamBufferCallbacks {
  /** 文本更新回调 */
  onTextUpdate?: (text: string) => void;
  /** 流式完成回调 */
  onStreamComplete?: () => void;
}

export class StreamBuffer {
  private buffer: string = '';
  private displayText: string = '';
  private isStreaming: boolean = false;
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private callbacks: StreamBufferCallbacks = {};

  // 流式显示配置
  private charsPerTick: number = 2; // 每次显示的字符数
  private tickInterval: number = 30; // 毫秒

  constructor(callbacks: StreamBufferCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /** 开始流式输出 */
  startStream() {
    this.buffer = '';
    this.displayText = '';
    this.isStreaming = true;
    this.startDisplayTimer();
  }

  /** 追加文本到缓冲区 */
  appendText(text: string) {
    this.buffer += text;
  }

  /** 结束流式输出 */
  endStream() {
    this.isStreaming = false;
    this.stopDisplayTimer();

    // 显示剩余所有文本
    if (this.buffer.length > this.displayText.length) {
      this.displayText = this.buffer;
      this.callbacks.onTextUpdate?.(this.displayText);
    }

    this.callbacks.onStreamComplete?.();
  }

  /** 获取当前显示的文本 */
  getDisplayText(): string {
    return this.displayText;
  }

  /** 获取完整文本 */
  getFullText(): string {
    return this.buffer;
  }

  /** 是否正在流式输出 */
  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  /** 清空缓冲区 */
  clear() {
    this.stopDisplayTimer();
    this.buffer = '';
    this.displayText = '';
    this.isStreaming = false;
  }

  /** 销毁 */
  destroy() {
    this.stopDisplayTimer();
    this.callbacks = {};
  }

  // ============ Private Methods ============

  private startDisplayTimer() {
    this.stopDisplayTimer();

    this.streamTimer = setInterval(() => {
      if (!this.isStreaming) return;

      const remaining = this.buffer.length - this.displayText.length;
      if (remaining <= 0) return;

      // 逐字显示
      const charsToShow = Math.min(this.charsPerTick, remaining);
      this.displayText += this.buffer.slice(
        this.displayText.length,
        this.displayText.length + charsToShow,
      );

      this.callbacks.onTextUpdate?.(this.displayText);
    }, this.tickInterval);
  }

  private stopDisplayTimer() {
    if (this.streamTimer) {
      clearInterval(this.streamTimer);
      this.streamTimer = null;
    }
  }
}
