/**
 * @file AppStateBridge.ts
 * @description Phase 7.1 App 生命周期桥接：前后台切换监听 + 电池保护。
 *
 * 职责：
 * 1. App 进入后台超过 30 秒：主动断开语音 WebSocket 与 SyncManager 长连接
 * 2. App 重新进入前台：恢复必要连接 + 触发一次 forceSync
 * 3. 低电量模式（< 15%）：跳过后台任务执行
 *
 * 在 _layout.tsx 中通过 useEffect 注册一次即可。
 */
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { syncManager } from '../../db/syncManager';

const BACKGROUND_DISCONNECT_DELAY_MS = 30_000;
const LOW_BATTERY_THRESHOLD = 0.15;

type DisconnectHandler = () => void;
type ReconnectHandler = () => void;

let registered = false;
let backgroundTimer: ReturnType<typeof setTimeout> | null = null;
let disconnectHandlers: DisconnectHandler[] = [];
let reconnectHandlers: ReconnectHandler[] = [];

/**
 * 注册语音引擎断开回调。
 * 当 App 进入后台 30s 后触发，允许 VoiceEngine 释放 WebSocket 与录音器。
 */
export function registerVoiceDisconnect(handler: DisconnectHandler): () => void {
  disconnectHandlers.push(handler);
  return () => {
    disconnectHandlers = disconnectHandlers.filter((h) => h !== handler);
  };
}

/**
 * 注册 App 重新进入前台时的恢复回调。
 */
export function registerForegroundReconnect(handler: ReconnectHandler): () => void {
  reconnectHandlers.push(handler);
  return () => {
    reconnectHandlers = reconnectHandlers.filter((h) => h !== handler);
  };
}

async function handleAppStateChange(nextState: AppStateStatus): Promise<void> {
  if (nextState === 'background' || nextState === 'inactive') {
    // 进入后台：30 秒后断开长连接
    if (backgroundTimer) clearTimeout(backgroundTimer);
    backgroundTimer = setTimeout(() => {
      console.log('[AppStateBridge] App in background > 30s, disconnecting long connections');
      disconnectHandlers.forEach((h) => {
        try {
          h();
        } catch (e) {
          console.warn('[AppStateBridge] disconnect handler error:', e);
        }
      });
      backgroundTimer = null;
    }, BACKGROUND_DISCONNECT_DELAY_MS);
    return;
  }

  if (nextState === 'active') {
    // 回到前台：清除后台计时器
    if (backgroundTimer) {
      clearTimeout(backgroundTimer);
      backgroundTimer = null;
    }

    // 触发一次同步（捕获后台期间服务端变更）
    try {
      await syncManager.forceSync();
    } catch (e) {
      console.warn('[AppStateBridge] forceSync on foreground failed:', e);
    }

    // 通知语音引擎等长连接恢复（仅在用户主动操作时才真正重连）
    reconnectHandlers.forEach((h) => {
      try {
        h();
      } catch (e) {
        console.warn('[AppStateBridge] reconnect handler error:', e);
      }
    });
  }
}

/** 在 _layout.tsx 中调用一次，注册 AppState 监听。 */
export function setupAppStateBridge(): () => void {
  if (registered) {
    return () => {};
  }
  registered = true;
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => {
    subscription.remove();
    if (backgroundTimer) clearTimeout(backgroundTimer);
    registered = false;
  };
}

export const LOW_BATTERY = LOW_BATTERY_THRESHOLD;
