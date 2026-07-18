/**
 * @file SplashController.ts
 * @description Phase 7.1 Splash 屏控制策略。
 *
 * 启动流程：
 * 1. 系统显示原生 Splash Screen（由 expo-splash-screen 控制）
 * 2. JS 加载 + 数据库初始化并行执行
 * 3. 关键首屏数据（首页课程列表缓存）加载完毕后，再隐藏 Splash
 * 4. 避免白屏闪烁，提升用户感知启动速度
 *
 * 使用示例：
 * ```ts
 * // 在 _layout.tsx 顶部
 * await SplashController.preventAutoHide();
 * // ... 执行初始化
 * await SplashController.hide();
 * ```
 */
import * as SplashScreen from 'expo-splash-screen';

let isPrevented = false;
let isHidden = false;

export const SplashController = {
  /** 阻止 Splash 自动隐藏（必须在 App 启动早期同步调用）。 */
  async preventAutoHide(): Promise<void> {
    if (isPrevented) return;
    try {
      await SplashScreen.preventAutoHideAsync();
      isPrevented = true;
    } catch (e) {
      // 在某些 Android 设备上 preventAutoHideAsync 可能抛错，忽略即可
      console.warn('[Splash] preventAutoHideAsync failed:', e);
    }
  },

  /**
   * 隐藏 Splash 屏。
   * 调用前应确保首屏数据已就绪，否则会出现白屏。
   */
  async hide(): Promise<void> {
    if (isHidden || !isPrevented) return;
    try {
      await SplashScreen.hideAsync();
      isHidden = true;
    } catch (e) {
      console.warn('[Splash] hideAsync failed:', e);
    }
  },

  /** 是否已阻止自动隐藏。 */
  isPrevented(): boolean {
    return isPrevented;
  },

  /** 是否已隐藏。 */
  isHidden(): boolean {
    return isHidden;
  },
};
