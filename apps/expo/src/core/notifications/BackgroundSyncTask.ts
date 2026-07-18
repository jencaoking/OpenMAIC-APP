/**
 * @file BackgroundSyncTask.ts
 * @description 后台静默同步任务。
 *
 * 通过 expo-task-manager + expo-background-fetch 注册后台任务，
 * 在 App 处于后台时每隔约 15 分钟（系统调度，非精确）唤醒一次，
 * 执行 SyncManager.forceSync()，确保用户下次打开 App 时数据已是最新。
 *
 * 注册约束：
 * 1. 必须在 App 顶层模块定义（不能在组件内部）。
 * 2. 任务名必须全局唯一。
 * 3. 系统会根据用户使用频率自适应调整唤醒周期。
 *
 * 电量保护：
 * - 通过 `Battery.isLow` 检测低电量时跳过本次同步。
 * - 通过 `AppState` 检测 App 状态，前台时不执行后台任务。
 */
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Battery from 'expo-battery';
import { AppState } from 'react-native';
import { syncManager } from '../../db/syncManager';

export const BACKGROUND_SYNC_TASK_NAME = 'openmaic-background-sync';

/** 后台同步任务的最小间隔（ms），系统实际调度可能更长。 */
const MINIMUM_INTERVAL_MS = 15 * 60 * 1000;

/** 电量低于此阈值时跳过同步（百分比）。 */
const LOW_BATTERY_THRESHOLD = 0.15;

let isTaskDefined = false;

/**
 * 定义后台同步任务。
 * 必须在模块顶层调用一次（在 _layout.tsx 的 init 阶段）。
 */
export function defineBackgroundSyncTask(): void {
  if (isTaskDefined) return;
  isTaskDefined = true;

  TaskManager.defineTask(BACKGROUND_SYNC_TASK_NAME, async () => {
    try {
      // 前台时不执行（前台已有定时同步）
      if (AppState.currentState === 'active') {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // 电量保护：低电量时跳过
      const batteryState = await Battery.getBatteryStateAsync();
      if (batteryState === Battery.BatteryState.UNPLUGGED) {
        const level = await Battery.getBatteryLevelAsync();
        if (level < LOW_BATTERY_THRESHOLD) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }
      }

      await syncManager.forceSync();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.warn('[BackgroundSyncTask] sync failed:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

/**
 * 注册后台同步任务。
 * 返回是否注册成功。
 */
export async function registerBackgroundSyncTask(): Promise<boolean> {
  if (!isTaskDefined) {
    defineBackgroundSyncTask();
  }

  const status = await BackgroundFetch.getStatusAsync();
  const canRegister =
    status === BackgroundFetch.BackgroundFetchStatus.Available ||
    status === BackgroundFetch.BackgroundFetchStatus.NoData;

  if (!canRegister) {
    console.warn('[BackgroundSyncTask] BackgroundFetch not available, status:', status);
    return false;
  }

  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK_NAME, {
      minimumInterval: MINIMUM_INTERVAL_MS / 1000,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    return true;
  } catch (error) {
    console.warn('[BackgroundSyncTask] register failed:', error);
    return false;
  }
}

/**
 * 注销后台同步任务。
 */
export async function unregisterBackgroundSyncTask(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK_NAME);
  } catch (error) {
    console.warn('[BackgroundSyncTask] unregister failed:', error);
  }
}

/**
 * 查询后台任务的当前注册状态。
 */
export async function getBackgroundSyncStatus(): Promise<{
  isRegistered: boolean;
  backgroundFetchStatus: BackgroundFetch.BackgroundFetchStatus;
}> {
  const [status, tasks] = await Promise.all([
    BackgroundFetch.getStatusAsync(),
    TaskManager.getRegisteredTasksAsync(),
  ]);
  const isRegistered = tasks.some((t) => t.taskName === BACKGROUND_SYNC_TASK_NAME);
  return { isRegistered, backgroundFetchStatus: status };
}
