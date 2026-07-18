/**
 * @file AttConsent.ts
 * @description Phase 7.3 ATT (App Tracking Transparency) 授权管理。
 *
 * 职责：
 * 1. 在首次需要使用设备标识符（IDFA）前弹出 ATT 授权弹窗
 * 2. 缓存授权状态，避免重复弹窗
 * 3. 用户拒绝后，禁用所有 Tracking 相关功能
 *
 * 适用场景：
 * - 集成 AdMob / Facebook Audience Network 等广告 SDK
 * - 使用 IDFA 进行用户归因分析
 * - 跨 App 追踪用户行为
 *
 * 注意：OpenMAIC 当前不投放广告，但若未来接入分析 SDK（如 Firebase Analytics + IDFA），
 * 必须在首次调用前请求 ATT 授权。
 */
import { Platform } from 'react-native';

/** ATT 授权状态（与 iOS ATTrackingManager.AuthorizationStatus 对齐）。 */
export type AttAuthorizationStatus =
  | 'not_determined' // 未请求
  | 'restricted' // 受限（家长控制等）
  | 'denied' // 用户拒绝
  | 'authorized'; // 用户授权

let cachedStatus: AttAuthorizationStatus | null = null;

// NativeModules 桥接声明
interface AttNativeModule {
  requestTrackingAuthorization(): Promise<number>;
  getTrackingAuthorizationStatus(): Promise<number>;
}

declare global {
  // eslint-disable-next-line no-var
  var __OpenMaicAttBridge: AttNativeModule | undefined;
}

function getNativeModule(): AttNativeModule | null {
  if (Platform.OS !== 'ios') return null;
  return global.__OpenMaicAttBridge ?? null;
}

function mapStatus(code: number): AttAuthorizationStatus {
  // 0 = notDetermined, 1 = restricted, 2 = denied, 3 = authorized
  switch (code) {
    case 0:
      return 'not_determined';
    case 1:
      return 'restricted';
    case 2:
      return 'denied';
    case 3:
      return 'authorized';
    default:
      return 'not_determined';
  }
}

/**
 * ATT 授权服务。
 */
export const AttConsent = {
  /**
   * 获取当前 ATT 授权状态（不弹窗）。
   */
  async getStatus(): Promise<AttAuthorizationStatus> {
    if (cachedStatus) return cachedStatus;
    if (Platform.OS !== 'ios') {
      cachedStatus = 'authorized'; // Android 无 ATT 概念
      return cachedStatus;
    }

    const nativeModule = getNativeModule();
    if (!nativeModule) {
      cachedStatus = 'authorized'; // 原生模块未注册时降级为已授权（不阻塞功能）
      return cachedStatus;
    }

    try {
      const code = await nativeModule.getTrackingAuthorizationStatus();
      cachedStatus = mapStatus(code);
      return cachedStatus;
    } catch (e) {
      console.warn('[AttConsent] getStatus failed:', e);
      cachedStatus = 'not_determined';
      return cachedStatus;
    }
  },

  /**
   * 请求 ATT 授权（弹窗）。
   * 仅在 status === 'not_determined' 时才会真正弹窗。
   *
   * @returns 最终授权状态
   */
  async request(): Promise<AttAuthorizationStatus> {
    if (Platform.OS !== 'ios') {
      return 'authorized';
    }

    const current = await this.getStatus();
    if (current !== 'not_determined') {
      return current;
    }

    const nativeModule = getNativeModule();
    if (!nativeModule) {
      cachedStatus = 'authorized';
      return cachedStatus;
    }

    try {
      const code = await nativeModule.requestTrackingAuthorization();
      cachedStatus = mapStatus(code);
      return cachedStatus;
    } catch (e) {
      console.warn('[AttConsent] request failed:', e);
      cachedStatus = 'denied';
      return cachedStatus;
    }
  },

  /**
   * 用户是否已授权 Tracking。
   */
  async isAuthorized(): Promise<boolean> {
    const status = await this.getStatus();
    return status === 'authorized';
  },

  /**
   * 清除缓存（主要用于测试）。
   */
  clearCache(): void {
    cachedStatus = null;
  },
};
