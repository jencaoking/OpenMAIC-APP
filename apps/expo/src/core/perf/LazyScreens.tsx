/**
 * @file LazyScreens.tsx
 * @description Phase 7.1 路由级代码分割：重型页面懒加载包装器。
 *
 * 将 Quiz/Voice/Dsl 等重型页面用 React.lazy + Suspense 包装，
 * 避免首屏 Bundle 包含所有原生模块依赖，减小启动体积。
 */
import React, { Suspense, lazy, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/** 通用 Suspense 加载占位组件。 */
const LoadingFallback: React.FC<{ label?: string }> = ({ label }) => (
  <View style={styles.container} accessibilityLabel={label ?? '加载中'}>
    <ActivityIndicator size="large" color="#3b82f6" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

/**
 * 懒加载的 Quiz 页面。
 * 仅当用户首次进入 Quiz 时才加载 QuizScreen + Reanimated + Haptics 依赖。
 */
export const LazyQuizScreen = lazy(() =>
  import(/* webpackChunkName: "quiz" */ '../../features/quiz/QuizScreen').then((m) => ({
    default: (m as any).QuizScreen,
  })),
);

export const LazyVoiceModeScreen = lazy(() =>
  import(/* webpackChunkName: "voice" */ '../../features/chat-flow/VoiceModeScreen').then((m) => ({
    default: (m as any).VoiceModeScreen,
  })),
);

export const LazyDslRenderScreen = lazy(() =>
  import(/* webpackChunkName: "dsl" */ '../../features/dsl/DslRenderScreen').then((m) => ({
    default: (m as any).default,
  })),
);

export const LazyCreateSessionScreen = lazy(() =>
  import(
    /* webpackChunkName: "create-session" */ '../../features/sessions/CreateSessionScreen'
  ).then((m) => ({ default: (m as any).default })),
);

/** 高阶组件：将任意 Lazy 组件包装在 Suspense 中。 */
export function withSuspense<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  label?: string,
): React.FC<P> {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback label={label} />}>
      <Component {...props} />
    </Suspense>
  );
}

/** 统一导出已包装 Suspense 的懒加载页面。 */
export function useLazyScreens() {
  return useMemo(
    () => ({
      QuizScreen: withSuspense(LazyQuizScreen, '加载答题页'),
      VoiceModeScreen: withSuspense(LazyVoiceModeScreen, '加载语音模式'),
      DslRenderScreen: withSuspense(LazyDslRenderScreen, '加载内容'),
      CreateSessionScreen: withSuspense(LazyCreateSessionScreen, '加载创建页'),
    }),
    [],
  );
}
