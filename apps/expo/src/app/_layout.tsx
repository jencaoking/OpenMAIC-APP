import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SessionProvider } from '../core/store/sessionStore';
import { syncManager } from '../db/syncManager';
import { NetworkBanner } from '../features/network/NetworkBanner';
import {
  notificationService,
  defineBackgroundSyncTask,
  registerBackgroundSyncTask,
} from '../core/notifications';
import { widgetBridge, buildUnreadHint } from '../core/notifications';
import type { DeepLinkTarget } from '../types';

interface RootLayoutProps {
  children: (deepLink: DeepLinkTarget | null, onDeepLinkConsumed: () => void) => React.ReactNode;
}

/**
 * App 根布局。
 *
 * 职责：
 * 1. 初始化本地数据库（Phase 5.4）
 * 2. 配置推送通知服务（Phase 6.3）
 * 3. 注册后台同步任务（Phase 6.3）
 * 4. 监听 Deep Link 跳转事件，并向下传递给 HomePage
 *
 * 注意：后台同步任务定义必须在模块顶层完成，确保 TaskManager 在 App 启动早期即可路由。
 */
defineBackgroundSyncTask();

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [pendingDeepLink, setPendingDeepLink] = useState<DeepLinkTarget | null>(null);
  const deepLinkConsumedRef = useRef(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await syncManager.init();
        setIsDbReady(true);

        // 初始化通知服务（不预先请求权限，仅配置 handler）
        await notificationService.init({
          tokenRegisterUrl: process.env.EXPO_PUBLIC_PUSH_TOKEN_URL,
          authToken: undefined,
        });
        await notificationService.setupAndroidChannel();

        // 注册后台同步任务（系统将根据使用频率调度，最小 15 分钟）
        await registerBackgroundSyncTask();

        // 刷新桌面 Widget 数据
        await widgetBridge.setData({
          dailyProgress: 0,
          unreadHint: buildUnreadHint(0, 0),
          streakDays: 0,
          updatedAt: Date.now(),
        });
      } catch (error) {
        setDbError(error instanceof Error ? error : new Error('Failed to initialize database'));
      }
    };

    initApp();
  }, []);

  // 订阅 Deep Link 跳转事件（来自推送通知点击）
  useEffect(() => {
    const unsubscribe = notificationService.onDeepLink((target) => {
      deepLinkConsumedRef.current = false;
      setPendingDeepLink(target);
    });
    return unsubscribe;
  }, []);

  const handleDeepLinkConsumed = () => {
    deepLinkConsumedRef.current = true;
    setPendingDeepLink(null);
  };

  if (!isDbReady) {
    if (dbError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Database initialization failed:</Text>
          <Text>{dbError.message}</Text>
        </View>
      );
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SessionProvider>
      <NetworkBanner />
      <View style={styles.container}>
        {children(deepLinkConsumedRef.current ? null : pendingDeepLink, handleDeepLinkConsumed)}
      </View>
    </SessionProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
});

export default RootLayout;
