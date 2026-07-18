/**
 * @file core/notifications/index.ts
 * @description 系统级通知与小组件模块统一出口。
 */
export { notificationService, configureNotifications } from './NotificationService';
export type { NotificationServiceConfig } from './NotificationService';
export {
  BACKGROUND_SYNC_TASK_NAME,
  defineBackgroundSyncTask,
  registerBackgroundSyncTask,
  unregisterBackgroundSyncTask,
  getBackgroundSyncStatus,
} from './BackgroundSyncTask';
export { liveActivityBridge } from './LiveActivityBridge';
export type {
  LiveActivityStatus,
  LiveActivityAttributes,
  LiveActivityHandle,
  QuizCountdownAttributes,
  VoiceLectureAttributes,
} from './LiveActivityBridge';
export { widgetBridge, buildUnreadHint } from './WidgetBridge';
export type { DailyProgressWidgetData } from './WidgetBridge';
