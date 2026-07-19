/**
 * @file core/media/index.ts
 * @description 多模态媒体模块统一出口。
 */
export { ImageCompressor } from './ImageCompressor';
export type { CompressOptions } from './ImageCompressor';
export { VisionMessageBuilder } from './VisionMessageBuilder';
export type {
  VisionMessageFormat,
  VisionRequestPayload,
  VisionMessageBuilderConfig,
} from './VisionMessageBuilder';
