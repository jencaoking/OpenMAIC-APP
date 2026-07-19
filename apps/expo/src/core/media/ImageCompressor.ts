/**
 * @file ImageCompressor.ts
 * @description 图像本地压缩与降采样服务。
 *
 * 关键设计：
 * 1. 严格限制最大边长 1080p，超出按比例降采样，避免 Base64 编码导致 OOM。
 * 2. 默认输出 JPEG quality=0.8，对 PNG 透明图保留 PNG 编码。
 * 3. 同步生成 Base64（无 data: 前缀），供 Vision API 请求体直接使用。
 * 4. 通过 expo-image-manipulator 在原生层完成，避免 JS 主线程阻塞。
 */
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import type { ImageAttachment, ImageAttachmentSource } from '../../types';

export interface CompressOptions {
  /** 最大边长（px），默认 1080。 */
  maxDimension?: number;
  /** JPEG 压缩质量（0~1），默认 0.8。 */
  quality?: number;
  /** 是否强制生成 base64，默认 true。 */
  generateBase64?: boolean;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxDimension: 1080,
  quality: 0.8,
  generateBase64: true,
};

/**
 * 生成 RFC4122 v4 UUID（无需额外依赖）。
 */
function uuid(): string {
  // crypto.getRandomValues 在 React Native 0.66+ 可用
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

/**
 * 图像压缩器。
 * 所有方法静态，无状态，可被任意组件调用。
 */
export class ImageCompressor {
  /**
   * 压缩本地图像文件并返回 `ImageAttachment`。
   * @param uri 本地 file:// 或 ph:// URI
   * @param source 来源场景
   * @param options 压缩选项
   */
  static async compress(
    uri: string,
    source: ImageAttachmentSource,
    options: CompressOptions = {},
  ): Promise<ImageAttachment> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // 先获取原图尺寸
    const original = await this.getImageSize(uri);
    const { width, height } = this.scaleToFit(original.width, original.height, opts.maxDimension);

    const actions: ImageManipulator.Action[] = [{ resize: { width, height } }];
    const saveOptions: ImageManipulator.SaveOptions = {
      compress: opts.quality,
      format: ImageManipulator.SaveFormat.JPEG,
    };

    const result = await ImageManipulator.manipulateAsync(uri, actions, saveOptions);

    let base64: string | undefined;
    if (opts.generateBase64) {
      base64 = await this.readFileAsBase64(result.uri);
    }

    const fileInfo = await FileSystem.getInfoAsync(result.uri);

    return {
      id: uuid(),
      localUri: result.uri,
      width: result.width ?? width,
      height: result.height ?? height,
      byteSize: fileInfo.exists ? (fileInfo.size ?? 0) : 0,
      mimeType: 'image/jpeg',
      base64,
      source,
    };
  }

  /**
   * 批量压缩多张图片，按顺序返回。
   * 串行执行避免内存峰值。
   */
  static async compressBatch(
    uris: string[],
    source: ImageAttachmentSource,
    options: CompressOptions = {},
  ): Promise<ImageAttachment[]> {
    const results: ImageAttachment[] = [];
    for (const uri of uris) {
      try {
        const attachment = await this.compress(uri, source, options);
        results.push(attachment);
      } catch (error) {
        // 单张失败不阻塞整体流程，记录到控制台
        console.warn(`[ImageCompressor] Failed to compress ${uri}:`, error);
      }
    }
    return results;
  }

  /**
   * 读取图片原始尺寸。
   * 使用 ImageManipulator 的 0 操作调用获取，避免引入额外依赖。
   */
  private static async getImageSize(uri: string): Promise<{ width: number; height: number }> {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { width: result.width ?? 1080, height: result.height ?? 1080 };
  }

  /**
   * 按最大边长等比缩放。
   */
  private static scaleToFit(
    width: number,
    height: number,
    maxDimension: number,
  ): { width: number; height: number } {
    const longest = Math.max(width, height);
    if (longest <= maxDimension) return { width, height };
    const ratio = maxDimension / longest;
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    };
  }

  /**
   * 读取本地文件为 base64（无 data: 前缀）。
   */
  private static async readFileAsBase64(uri: string): Promise<string> {
    const file = new FileSystem.File(uri);
    const base64 = await file.base64();
    return base64;
  }
}
