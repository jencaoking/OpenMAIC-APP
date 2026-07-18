/**
 * @file core/voice/index.ts
 * @description 语音引擎模块统一出口。
 */
export { VoiceEngine } from './VoiceEngine';
export { VadDetector } from './VadDetector';
export type { VadDetectorConfig, VadDetectorCallbacks } from './VadDetector';
export { TtsQueue } from './TtsQueue';
export type { TtsQueueConfig, TtsQueueCallbacks } from './TtsQueue';
export { audioSession } from './AudioSession';
export type { AudioSessionRole, AudioRouteStrategy, AudioSessionConfig } from './AudioSession';
