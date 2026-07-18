/**
 * @file sentry.config.ts
 * @description Phase 7.4 Sentry 初始化与 Source Map 上传配置。
 *
 * 集成位置：
 * - 在 _layout.tsx 或 App.tsx 顶部导入此文件，确保 Sentry 在所有其他模块之前初始化
 * - CI/CD 流水线在 EAS Build 完成后自动上传 Source Map
 *
 * 关键配置项：
 * - dsn: 从 EAS Secrets 注入（SENTRY_DSN）
 * - release: 与 git tag 同步，便于版本回溯
 * - tracesSampleRate: 性能采样率（生产 0.1，开发 1.0）
 * - environment: development / preview / production
 */
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
const SENTRY_ENVIRONMENT =
  (process.env.APP_VARIANT ?? 'development') as 'development' | 'preview' | 'production';
const SENTRY_RELEASE = process.env.EXPO_PUBLIC_SENTRY_RELEASE ?? 'dev-local';

/**
 * 初始化 Sentry 监控。
 * 必须在 App 渲染前调用。
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    release: SENTRY_RELEASE,
    environment: SENTRY_ENVIRONMENT,
    dist: Platform.OS,

    // 性能采样：生产环境 10% 采样，开发/预览 100%
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // 启用自动崩溃捕获
    enableNativeCrashHandling: true,

    // 启用 Native 崩溃捕获（iOS Crash Reporter / Android NDK）
    enableNative: true,

    // 在 dev 模式下不上报
    beforeSend(event) {
      if (__DEV__) {
        console.log('[Sentry] Dev mode - skipping event:', event);
        return null;
      }
      return event;
    },

    // 启用 React Native 自动性能追踪
    integrations: [
      Sentry.reactNativeTracingIntegration({
        // 追踪 App 启动时间
        tracingOrigins: ['localhost', /^\//, /^https?:\/\/(api\.|staging\.|prod\.)?openmaic\.dev/],
        routingInstrumentation: undefined, // 由 _layout.tsx 注入
      }),
    ],
  });

  console.log(`[Sentry] Initialized: env=${SENTRY_ENVIRONMENT}, release=${SENTRY_RELEASE}`);
}

/**
 * 设置 Sentry 用户上下文。
 * 在用户登录后调用。
 */
export function setSentryUser(userId: string, email?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    platform: Platform.OS,
  });
}

/**
 * 清除 Sentry 用户上下文。
 * 在用户登出时调用。
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * 主动上报一个非致命错误。
 */
export function captureError(error: Error | string, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * 主动上报一条面包屑（用于追踪用户行为）。
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}
