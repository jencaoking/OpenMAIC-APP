/**
 * @file VisionMessageBuilder.ts
 * @description 多模态视觉消息构造器。
 *
 * 负责将 [文本 + 图像附件] 组合成符合 OpenMAIC 后端契约的请求体：
 *
 *   {
 *     "sessionId": "...",
 *     "message": {
 *       "role": "user",
 *       "content": [
 *         { "type": "text", "text": "..." },
 *         { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
 *       ]
 *     }
 *   }
 *
 * 兼容 OpenAI Vision API 与 Qwen-VL 协议，通过 `format` 切换。
 */
import type { ImageAttachment, IMessage } from '../../types';

export type VisionMessageFormat = 'openai' | 'qwen-vl' | 'openmaic';

/**
 * OpenAI Vision 协议的 content 段。
 */
interface OpenAIContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
}

/**
 * Qwen-VL 协议的 content 段。
 */
interface QwenVlContentPart {
  type: 'text' | 'image';
  text?: string;
  image?: string;
}

export interface VisionRequestPayload {
  sessionId?: string;
  message: {
    role: 'user';
    content: OpenAIContentPart[] | QwenVlContentPart[] | string;
  };
  /** 附件元数据，由后端用于关联存储。 */
  attachments?: Array<{
    contentType: string;
    byteSize: number;
    width: number;
    height: number;
    source: string;
    assetRef?: string;
  }>;
}

export interface VisionMessageBuilderConfig {
  format: VisionMessageFormat;
  /** 当图片体积超过此阈值（bytes）时使用 URL 上传而非 base64，避免请求体过大。默认 800KB。 */
  base64MaxBytes: number;
  /** 图像 detail 级别（仅 OpenAI 协议生效）。 */
  detail?: 'low' | 'high' | 'auto';
}

const DEFAULT_CONFIG: VisionMessageBuilderConfig = {
  format: 'openmaic',
  base64MaxBytes: 800 * 1024,
  detail: 'high',
};

/**
 * 多模态消息构造器。
 */
export class VisionMessageBuilder {
  private config: VisionMessageBuilderConfig;

  constructor(config: Partial<VisionMessageBuilderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 构造后端请求体。
   * @param text 用户输入文本（可空，当仅发图时）
   * @param attachments 图像附件列表
   * @param sessionId 会话 ID
   */
  buildRequest(
    text: string,
    attachments: ImageAttachment[],
    sessionId?: string,
  ): VisionRequestPayload {
    const trimmed = text.trim();
    const hasText = trimmed.length > 0;
    const hasImages = attachments.length > 0;

    if (!hasText && !hasImages) {
      throw new Error('Cannot build vision request: both text and attachments are empty');
    }

    // 纯文本场景：使用简洁的字符串 content，节省序列化开销
    if (!hasImages) {
      return {
        sessionId,
        message: { role: 'user', content: trimmed },
      };
    }

    const content = this.buildContentParts(trimmed, attachments);

    return {
      sessionId,
      message: {
        role: 'user',
        content,
      },
      attachments: attachments.map((a) => ({
        contentType: a.mimeType,
        byteSize: a.byteSize,
        width: a.width,
        height: a.height,
        source: a.source,
        assetRef: a.remoteAssetRef,
      })),
    };
  }

  /**
   * 构造本地 IMessage，用于立即在 UI 显示用户消息。
   */
  buildLocalMessage(text: string, attachments: ImageAttachment[]): IMessage {
    return {
      id: `local-${Date.now()}`,
      content: text,
      role: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
  }

  /**
   * 构造 content parts 数组。
   */
  private buildContentParts(
    text: string,
    attachments: ImageAttachment[],
  ): OpenAIContentPart[] | QwenVlContentPart[] | string {
    switch (this.config.format) {
      case 'openai':
        return this.buildOpenAIContent(text, attachments);
      case 'qwen-vl':
        return this.buildQwenVlContent(text, attachments);
      case 'openmaic':
      default:
        // OpenMAIC 后端默认采用 OpenAI 兼容协议
        return this.buildOpenAIContent(text, attachments);
    }
  }

  private buildOpenAIContent(text: string, attachments: ImageAttachment[]): OpenAIContentPart[] {
    const parts: OpenAIContentPart[] = [];
    if (text) {
      parts.push({ type: 'text', text });
    }
    for (const img of attachments) {
      const url = this.resolveImageUrl(img);
      parts.push({
        type: 'image_url',
        image_url: { url, detail: this.config.detail ?? 'high' },
      });
    }
    return parts;
  }

  private buildQwenVlContent(text: string, attachments: ImageAttachment[]): QwenVlContentPart[] {
    const parts: QwenVlContentPart[] = [];
    // Qwen-VL 协议要求 image 在 text 之前
    for (const img of attachments) {
      parts.push({ type: 'image', image: this.resolveImageUrl(img) });
    }
    if (text) {
      parts.push({ type: 'text', text });
    }
    return parts;
  }

  /**
   * 解析图像 URL：
   * 1. 若已有 remoteAssetRef，直接使用 asset:// URI（后端解析）
   * 2. 若体积超过阈值，标记为需上传，返回占位符（由调用方先上传再替换）
   * 3. 否则使用 data:image/jpeg;base64,... 内联
   */
  private resolveImageUrl(attachment: ImageAttachment): string {
    if (attachment.remoteAssetRef) {
      return `asset://${attachment.remoteAssetRef}`;
    }
    if (attachment.byteSize > this.config.base64MaxBytes) {
      // 超大图返回占位符，调用方应在发送前先调用 Asset API 上传
      return `asset://pending/${attachment.id}`;
    }
    const base64 = attachment.base64 ?? '';
    return `data:${attachment.mimeType};base64,${base64}`;
  }
}
