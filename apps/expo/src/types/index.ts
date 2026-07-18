/**
 * OpenMAIC Expo 端共享类型契约。
 * 仅依赖 `@openmaic/storage-types` 的纯类型，零运行时依赖，符合跨端隔离规则。
 */
import type { AssetRef } from '@openmaic/storage-types';

/**
 * 图像附件来源场景。
 * - `camera`：用户即时拍摄
 * - `library`：用户从相册选择
 * - `paste`：用户从剪贴板粘贴（Web 端常见，移动端预留）
 */
export type ImageAttachmentSource = 'camera' | 'library' | 'paste';

/**
 * 本地待发送的图像附件元数据。
 * 在 UI 预览与上传压缩流程中流转；最终编码进 `IMessage.attachments`。
 */
export interface ImageAttachment {
  /** 客户端生成的临时 ID，用于列表 key 与去重。 */
  id: string;
  /** 本地 file:// 或 ph:// URI，用于 Image 预览。 */
  localUri: string;
  /** 压缩后宽度（px）。 */
  width: number;
  /** 压缩后高度（px）。 */
  height: number;
  /** 压缩后字节大小，用于配额校验。 */
  byteSize: number;
  /** MIME 类型，如 `image/jpeg`。 */
  mimeType: string;
  /** Base64 编码（无 data: 前缀），用于多模态请求体。 */
  base64?: string;
  /** 若已上传至后端 Asset 服务，则为后端返回的稳定引用。 */
  remoteAssetRef?: AssetRef;
  /** 来源场景。 */
  source: ImageAttachmentSource;
}

/**
 * 多模态消息附件联合类型。
 * 当前仅支持 image，未来可扩展 audio / file。
 */
export type MessageAttachment = ImageAttachment;

/**
 * 扩展的消息接口，兼容 Phase 5 的 `MessageBubble` 旧字段，
 * 同时增加 `attachments` 以承载多模态内容。
 */
export interface IMessage {
  id: string;
  /** 文本内容（可空，当仅有图片时）。 */
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: Date;
  /** 多模态附件列表。 */
  attachments?: MessageAttachment[];
  /** 标记为流式生成中的临时消息。 */
  streaming?: boolean;
}

/**
 * 语音会话状态机的有限状态集合。
 * - `idle`：未启动
 * - `listening`：麦克风采集中，等待/正在 STT
 * - `thinking`：STT 完成，等待 LLM 首字
 * - `speaking`：TTS 播放中
 * - `barge-in`：用户在 TTS 播放中打断，正切换回 listening
 * - `error`：链路异常
 */
export type VoiceSessionState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'barge-in'
  | 'error';

/**
 * STT WebSocket 下行消息的判别联合类型。
 */
export type SttEvent =
  | { type: 'interim'; text: string }
  | { type: 'final'; text: string }
  | { type: 'error'; message: string }
  | { type: 'close'; code: number; reason: string };

/**
 * 语音引擎对外暴露的快照状态，供 UI 订阅。
 */
export interface VoiceEngineSnapshot {
  state: VoiceSessionState;
  /** STT 实时中间文本。 */
  interimTranscript: string;
  /** STT 最终文本（一次对话回合）。 */
  finalTranscript: string;
  /** LLM 流式累积的 AI 回复文本。 */
  aiReplyText: string;
  /** 实时麦克风音量（0~1），驱动波形动画。 */
  micLevel: number;
  /** 实时 TTS 播放进度（0~1）。 */
  ttsProgress: number;
  /** 最近一次错误信息。 */
  error: string | null;
}

/**
 * 语音引擎配置参数。
 */
export interface VoiceEngineConfig {
  /** STT WebSocket 端点，如 `wss://stt.openmaic.dev/v1/stream`。 */
  sttWsUrl: string;
  /** TTS HTTP 端点，POST 文本返回音频流。 */
  ttsUrl: string;
  /** LLM SSE 端点（与 HttpRuntimeStore 对齐）。 */
  llmStreamUrl: string;
  /** Bearer Token，用于鉴权。 */
  authToken?: string;
  /** VAD 触发打断的音量阈值（0~1），默认 0.18。 */
  vadThreshold?: number;
  /** VAD 触发打断需要连续满足阈值的帧数，默认 6 帧（约 600ms）。 */
  vadConsecutiveFrames?: number;
  /** TTS 分片的最大字符数，默认 80。 */
  ttsChunkSize?: number;
  /** 当前会话 ID，用于 LLM 上下文。 */
  sessionId?: string;
}

/**
 * Deep Link 路由目标描述。
 */
export interface DeepLinkTarget {
  /** 目标页面标识。 */
  screen: 'list' | 'chat' | 'quiz' | 'dsl';
  /** 路由参数，如 sessionId / quizId。 */
  params?: Record<string, string>;
}

/**
 * 推送通知 payload 结构（与后端 APNs/FCM 协议对齐）。
 */
export interface PushNotificationPayload {
  /** 通知类型。 */
  kind: 'quiz-graded' | 'session-opened' | 'agent-message' | 'reminder';
  /** 目标路由。 */
  route?: DeepLinkTarget;
  /** Markdown 摘要。 */
  summary?: string;
  /** 关联实体 ID（如 quizId / sessionId）。 */
  entityId?: string;
}
