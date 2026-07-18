/**
 * @file NotificationService.ts
 * @description 推送通知服务。
 *
 * 核心能力：
 * 1. 动态请求通知权限（仅在用户触发相关功能时调用，绝不预请求）
 * 2. 注册 push token 并上报后端
 * 3. 监听前台通知展示与后台通知点击
 * 4. 解析 payload 并通过 `onDeepLink` 回调驱动路由跳转
 * 5. 调度本地通知（如 Quiz 倒计时提醒）
 *
 * 隐私合规：权限被拒时静默降级，UI 上由调用方展示引导。
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DeepLinkRouter } from '../navigation/DeepLinkRouter';
import type { DeepLinkTarget, PushNotificationPayload } from '../../types';

/**
 * 配置推送通知的前台展示行为。
 * 必须在 App 启动早期调用（_layout.tsx 的 useEffect 中）。
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
    handleSuccess: () => {
      // 通知成功展示后的钩子，可用于埋点
    },
    handleError: (notification, error) => {
      console.warn('[NotificationService] display error:', error, notification);
    },
  });
}

export interface NotificationServiceConfig {
  /** 后端 push token 注册端点。 */
  tokenRegisterUrl?: string;
  /** 鉴权 Token。 */
  authToken?: string;
}

/**
 * 推送通知服务单例。
 */
class NotificationServiceManager {
  private config: NotificationServiceConfig = {};
  private permissionGranted = false;
  private expoPushToken: string | null = null;
  private deepLinkListeners: Set<(target: DeepLinkTarget) => void> = new Set();
  private foregroundListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * 初始化服务。在 _layout.tsx 启动时调用一次。
   */
  async init(config: NotificationServiceConfig = {}): Promise<void> {
    this.config = config;
    configureNotifications();
    this.subscribeListeners();
  }

  /**
   * 动态请求通知权限。
   * 仅在用户触发相关功能时调用，遵守隐私合规原则。
   * @returns 是否授予权限。
   */
  async requestPermission(): Promise<boolean> {
    if (this.permissionGranted) return true;

    const settings = await Notifications.requestPermissionsAsync({
      android: {
        channelId: 'openmaic-default',
        channelIdToUse: 'openmaic-default',
      },
    });

    this.permissionGranted =
      settings.granted ||
      (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) ||
      (settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED);

    if (this.permissionGranted && !this.expoPushToken) {
      await this.registerForPushNotifications();
    }

    return this.permissionGranted;
  }

  /**
   * 注册并上报 push token。
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      this.expoPushToken = tokenResponse.data;

      if (this.config.tokenRegisterUrl && this.expoPushToken) {
        await fetch(this.config.tokenRegisterUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {}),
          },
          body: JSON.stringify({
            token: this.expoPushToken,
            platform: Platform.OS,
          }),
        });
      }
      return this.expoPushToken;
    } catch (error) {
      console.warn('[NotificationService] Failed to register push token:', error);
      return null;
    }
  }

  /**
   * 订阅 Deep Link 跳转事件。
   * 当用户点击通知时触发。
   */
  onDeepLink(listener: (target: DeepLinkTarget) => void): () => void {
    this.deepLinkListeners.add(listener);
    return () => this.deepLinkListeners.delete(listener);
  }

  /**
   * 调度本地通知（如 Quiz 倒计时提醒）。
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    payload?: PushNotificationPayload,
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: payload ? { payload: JSON.stringify(payload) } : {},
        sound: 'default',
      },
      trigger,
    });
  }

  /**
   * 取消指定的本地通知。
   */
  async cancelScheduledNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * 取消所有本地通知。
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * 设置 Android 通知渠道。
   * 必须在 Android 8.0+ 上调用，否则通知不显示。
   */
  async setupAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync('openmaic-default', {
      name: 'OpenMAIC 默认',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('openmaic-quiz', {
      name: '答题提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
      sound: 'default',
    });
  }

  /**
   * 释放监听器。App 退出时调用。
   */
  dispose(): void {
    this.foreignListenerCleanup();
    this.deepLinkListeners.clear();
  }

  /** 当前 push token。 */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /** 当前是否已授权。 */
  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }

  // ───────────────────────── 私有方法 ─────────────────────────

  private subscribeListeners(): void {
    // 前台通知展示由 setNotificationHandler 处理，这里仅监听点击响应
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const payload = this.extractPayload(response);
      const target = payload ? DeepLinkRouter.fromPayload(payload) : null;
      if (target) {
        this.deepLinkListeners.forEach((fn) => fn(target));
      }
    });
  }

  private foreignListenerCleanup(): void {
    if (this.foregroundListener) {
      this.foregroundListener.remove();
      this.foregroundListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * 从通知响应中提取 PushNotificationPayload。
   * 兼容 APNs / FCM / 本地通知三种来源的 payload 结构。
   */
  private extractPayload(
    response: Notifications.NotificationResponse,
  ): PushNotificationPayload | null {
    const data = response.notification.request.content.data ?? {};
    // 优先：直接 payload 字段
    if (typeof data.payload === 'string') {
      try {
        return JSON.parse(data.payload) as PushNotificationPayload;
      } catch {
        return null;
      }
    }
    // 次选：扁平字段
    if (typeof data.kind === 'string') {
      return {
        kind: data.kind as PushNotificationPayload['kind'],
        entityId: typeof data.entityId === 'string' ? data.entityId : undefined,
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        route: data.route ?? undefined,
      };
    }
    return null;
  }
}

/** 全局推送通知服务单例。 */
export const notificationService = new NotificationServiceManager();
