/**
 * @file TtsQueue.ts
 * @description TTS 音频队列播放器。
 *
 * 接收 LLM 流式返回的文本，按句/段落切片，并发请求 TTS 服务生成音频片段，
 * 按 FIFO 顺序使用 expo-av `Audio.Sound` 无缝拼接播放。
 *
 * 关键设计：
 * 1. 流式分片：以句号、问号、感叹号、换行作为切分点，最大不超过 `maxChars`。
 * 2. 预加载：当前片段播放时，下一段已发起 TTS 请求并缓存 base64。
 * 3. Barge-in 中断：调用 `interrupt()` 立即停止当前播放并清空队列。
 * 4. 进度回调：每段播放完毕触发 `onChunkComplete`，驱动 UI 进度条。
 */
import { Audio } from 'expo-av';

export interface TtsQueueConfig {
  /** TTS HTTP 端点。POST { text } → 音频流（audio/pcm 或 audio/mpeg）。 */
  ttsUrl: string;
  /** Bearer 鉴权 Token。 */
  authToken?: string;
  /** 单次 TTS 请求最大字符数，默认 80。 */
  maxChars: number;
  /** 同时预加载的片段数量，默认 2。 */
  prefetchCount: number;
  /** 请求超时（ms），默认 8000。 */
  requestTimeoutMs: number;
}

export interface TtsQueueCallbacks {
  /** 每段音频开始播放。 */
  onChunkStart?: (index: number, text: string) => void;
  /** 每段音频播放完成。 */
  onChunkComplete?: (index: number, text: string) => void;
  /** 整个队列播放完成（自然结束）。 */
  onAllComplete?: () => void;
  /** 播放被外部打断（barge-in）。 */
  onInterrupted?: () => void;
  /** 整体进度 0~1。 */
  onProgress?: (progress: number) => void;
  /** 错误回调。 */
  onError?: (error: Error) => void;
}

interface TtsChunk {
  index: number;
  text: string;
  /** TTS 服务返回的音频 base64（含 MIME 前缀）。 */
  audioDataUri: string;
  status: 'pending' | 'loading' | 'ready' | 'playing' | 'done' | 'error';
}

const DEFAULT_CONFIG: Omit<TtsQueueConfig, 'ttsUrl'> = {
  maxChars: 80,
  prefetchCount: 2,
  requestTimeoutMs: 8000,
};

/**
 * TTS 队列播放器。
 */
export class TtsQueue {
  private config: TtsQueueConfig;
  private callbacks: TtsQueueCallbacks;
  private chunks: TtsChunk[] = [];
  private currentIndex = 0;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private isInterrupted = false;

  constructor(config: Partial<TtsQueueConfig> & { ttsUrl: string }, callbacks: TtsQueueCallbacks = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  /**
   * 更新回调。
   */
  setCallbacks(callbacks: TtsQueueCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * 将 LLM 流式追加的文本切片入队。
   * @param fullText 当前累计的完整 AI 回复文本。
   */
  enqueueFromStream(fullText: string): void {
    const segments = this.splitText(fullText);
    // 与已有 chunks 比对，追加新增的段
    const existingCount = this.chunks.length;
    for (let i = existingCount; i < segments.length; i++) {
      this.chunks.push({
        index: i,
        text: segments[i],
        audioDataUri: '',
        status: 'pending',
      });
    }
    void this.prefetch();
  }

  /**
   * 开始播放队列。若已有播放进行中，则忽略。
   */
  async start(): Promise<void> {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isInterrupted = false;
    await this.playFrom(this.currentIndex);
  }

  /**
   * 立即中断播放，清空队列（Barge-in）。
   */
  async interrupt(): Promise<void> {
    this.isInterrupted = true;
    this.isPlaying = false;
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      } catch {
        // 忽略卸载错误
      }
      this.currentSound = null;
    }
    this.chunks = [];
    this.currentIndex = 0;
    this.callbacks.onInterrupted?.();
  }

  /**
   * 释放所有资源。组件卸载时必须调用。
   */
  async dispose(): Promise<void> {
    await this.interrupt();
  }

  /**
   * 将文本按句号/问号/感叹号/换行切分，每段不超过 `maxChars`。
   */
  private splitText(text: string): string[] {
    const result: string[] = [];
    const regex = /[^。？！\n.?!]+[。？！\n.?!]*/g;
    const matches = text.match(regex) ?? [text];
    for (const m of matches) {
      const trimmed = m.trim();
      if (!trimmed) continue;
      // 长段再按 maxChars 硬切
      for (let i = 0; i < trimmed.length; i += this.config.maxChars) {
        const slice = trimmed.slice(i, i + this.config.maxChars).trim();
        if (slice) result.push(slice);
      }
    }
    return result;
  }

  /**
   * 预加载当前 + 之后 N 个 pending 片段。
   */
  private async prefetch(): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (let i = 0; i < this.config.prefetchCount; i++) {
      const idx = this.currentIndex + i;
      if (idx >= this.chunks.length) break;
      const chunk = this.chunks[idx];
      if (chunk.status === 'pending') {
        chunk.status = 'loading';
        tasks.push(this.loadChunk(chunk));
      }
    }
    await Promise.all(tasks);
  }

  private async loadChunk(chunk: TtsChunk): Promise<void> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
      const response = await fetch(this.config.ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {}),
        },
        body: JSON.stringify({ text: chunk.text, voice: 'default', format: 'mp3' }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`TTS HTTP ${response.status}`);
      }
      // 优先解析 data URI；若后端返回二进制，则前端转 base64
      const contentType = response.headers.get('content-type') ?? 'audio/mpeg';
      if (contentType.startsWith('application/json')) {
        const body = (await response.json()) as { dataUri?: string; audio?: string };
        const uri = body.dataUri ?? body.audio;
        if (!uri) throw new Error('TTS response missing audio field');
        chunk.audioDataUri = uri;
      } else {
        const blob = await response.blob();
        chunk.audioDataUri = await this.blobToDataUri(blob, contentType);
      }
      chunk.status = 'ready';
    } catch (error) {
      chunk.status = 'error';
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private blobToDataUri(blob: Blob, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 从指定 index 开始顺序播放。
   */
  private async playFrom(index: number): Promise<void> {
    if (this.isInterrupted || !this.isPlaying) return;

    if (index >= this.chunks.length) {
      this.isPlaying = false;
      this.callbacks.onAllComplete?.();
      return;
    }

    const chunk = this.chunks[index];
    if (chunk.status === 'pending' || chunk.status === 'loading') {
      // 等待预加载完成
      await this.loadChunk(chunk);
    }
    if (chunk.status === 'error') {
      // 跳过错误片段，继续下一片段
      this.currentIndex = index + 1;
      await this.playFrom(this.currentIndex);
      return;
    }

    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: chunk.audioDataUri });
      this.currentSound = sound;
      chunk.status = 'playing';
      this.callbacks.onChunkStart?.(chunk.index, chunk.text);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (
          status.isLoaded &&
          'didJustFinish' in status &&
          status.didJustFinish
        ) {
          void this.handleChunkFinished(chunk);
        }
      });

      await sound.playAsync();
      void this.prefetch();
    } catch (error) {
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.currentIndex = index + 1;
      await this.playFrom(this.currentIndex);
    }
  }

  private async handleChunkFinished(chunk: TtsChunk): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.unloadAsync();
      } catch {
        // 忽略
      }
      this.currentSound = null;
    }
    chunk.status = 'done';
    this.callbacks.onChunkComplete?.(chunk.index, chunk.text);

    const progress = (chunk.index + 1) / this.chunks.length;
    this.callbacks.onProgress?.(progress);

    this.currentIndex = chunk.index + 1;
    await this.playFrom(this.currentIndex);
  }
}
