import React, { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import RootLayout from './_layout';
import HomePage from './index';
import { DeepLinkRouter } from '../core/navigation';
import type { DeepLinkTarget } from '../types';

/**
 * App 根组件。
 *
 * 职责：
 * 1. 监听 App 已启动时的 Deep Link 打开事件（`Linking.getInitialURL`）
 * 2. 监听 App 运行时的 Deep Link 打开事件（`Linking.addEventListener`）
 * 3. 将解析后的路由目标传递给 RootLayout → HomePage
 */
const App: React.FC = () => {
  const [initialDeepLink, setInitialDeepLink] = useState<DeepLinkTarget | null>(null);
  const [linkConsumed, setLinkConsumed] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const target = DeepLinkRouter.parse(url);
          if (target) {
            setInitialDeepLink(target);
            setLinkConsumed(false);
          }
        }
      } catch {
        // 静默忽略初始化 URL 解析失败
      }
    };
    void init();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const target = DeepLinkRouter.parse(url);
      if (target) {
        setInitialDeepLink(target);
        setLinkConsumed(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <RootLayout>
      {(layoutDeepLink, onLayoutConsumed) => (
        <>
          <HomePage
            pendingDeepLink={linkConsumed ? layoutDeepLink : initialDeepLink}
            onDeepLinkConsumed={() => {
              setLinkConsumed(true);
              setInitialDeepLink(null);
              onLayoutConsumed();
            }}
          />
        </>
      )}
    </RootLayout>
  );
};

export default App;
