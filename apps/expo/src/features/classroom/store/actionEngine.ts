/**
 * 动作引擎。
 * 管理课堂中的各种动作（语音、高亮、白板等）。
 *
 * 移植自 Web 端 ActionEngine 的核心逻辑。
 */

export type ActionType =
  | 'speech'
  | 'highlight'
  | 'spotlight'
  | 'laser'
  | 'whiteboard'
  | 'discussion'
  | 'delay';

export interface Action {
  id: string;
  type: ActionType;
  /** 动作参数 */
  params: Record<string, any>;
  /** 动作时长（毫秒），0 表示持续到下一个动作 */
  duration?: number;
  /** 动作延迟（毫秒） */
  delay?: number;
}

export interface ActionEngineCallbacks {
  /** 动作开始 */
  onActionStart?: (action: Action) => void;
  /** 动作结束 */
  onActionEnd?: (action: Action) => void;
  /** 语音文本更新 */
  onSpeechUpdate?: (text: string) => void;
  /** 高亮元素 */
  onHighlight?: (elementId: string | null) => void;
  /** 聚光灯 */
  onSpotlight?: (elementId: string | null) => void;
  /** 激光笔 */
  onLaser?: (elementId: string | null) => void;
}

export class ActionEngine {
  private actionQueue: Action[] = [];
  private currentActionIndex: number = 0;
  private isRunning: boolean = false;
  private actionTimer: ReturnType<typeof setTimeout> | null = null;
  private callbacks: ActionEngineCallbacks = {};

  constructor(callbacks: ActionEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /** 设置动作序列 */
  setActions(actions: Action[]) {
    this.actionQueue = actions;
    this.currentActionIndex = 0;
  }

  /** 开始执行动作序列 */
  start() {
    if (this.actionQueue.length === 0) return;
    this.isRunning = true;
    this.currentActionIndex = 0;
    this.executeNextAction();
  }

  /** 停止执行 */
  stop() {
    this.isRunning = false;
    this.clearTimer();
    this.currentActionIndex = 0;
    this.callbacks.onHighlight?.(null);
    this.callbacks.onSpotlight?.(null);
    this.callbacks.onLaser?.(null);
  }

  /** 暂停 */
  pause() {
    this.isRunning = false;
    this.clearTimer();
  }

  /** 恢复 */
  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.executeNextAction();
    }
  }

  /** 跳转到指定动作 */
  goToAction(index: number) {
    if (index < 0 || index >= this.actionQueue.length) return;
    this.currentActionIndex = index;
    this.clearTimer();
    if (this.isRunning) {
      this.executeNextAction();
    }
  }

  /** 获取当前动作索引 */
  getCurrentActionIndex(): number {
    return this.currentActionIndex;
  }

  /** 获取动作总数 */
  getActionCount(): number {
    return this.actionQueue.length;
  }

  /** 销毁引擎 */
  destroy() {
    this.stop();
    this.callbacks = {};
  }

  // ============ Private Methods ============

  private executeNextAction() {
    if (!this.isRunning || this.currentActionIndex >= this.actionQueue.length) {
      this.isRunning = false;
      return;
    }

    const action = this.actionQueue[this.currentActionIndex];
    const delay = action.delay || 0;

    this.actionTimer = setTimeout(() => {
      this.executeAction(action);
    }, delay);
  }

  private executeAction(action: Action) {
    this.callbacks.onActionStart?.(action);

    switch (action.type) {
      case 'speech':
        this.handleSpeech(action);
        break;
      case 'highlight':
        this.handleHighlight(action);
        break;
      case 'spotlight':
        this.handleSpotlight(action);
        break;
      case 'laser':
        this.handleLaser(action);
        break;
      case 'delay':
        // 延迟动作，直接进入下一个
        break;
      case 'discussion':
        // 讨论动作，暂停引擎等待用户输入
        this.pause();
        break;
    }

    // 如果有持续时间，设置定时器结束动作
    const duration = action.duration || 0;
    if (duration > 0) {
      this.actionTimer = setTimeout(() => {
        this.callbacks.onActionEnd?.(action);
        this.currentActionIndex++;
        this.executeNextAction();
      }, duration);
    } else {
      // 无持续时间，立即结束并执行下一个
      this.callbacks.onActionEnd?.(action);
      this.currentActionIndex++;
      this.executeNextAction();
    }
  }

  private handleSpeech(action: Action) {
    const text = action.params.text || '';
    this.callbacks.onSpeechUpdate?.(text);
  }

  private handleHighlight(action: Action) {
    const elementId = action.params.elementId || null;
    this.callbacks.onHighlight?.(elementId);
  }

  private handleSpotlight(action: Action) {
    const elementId = action.params.elementId || null;
    this.callbacks.onSpotlight?.(elementId);
  }

  private handleLaser(action: Action) {
    const elementId = action.params.elementId || null;
    this.callbacks.onLaser?.(elementId);
  }

  private clearTimer() {
    if (this.actionTimer) {
      clearTimeout(this.actionTimer);
      this.actionTimer = null;
    }
  }
}
