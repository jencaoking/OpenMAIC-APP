import type { ISO8601 } from '../runtime/session';
import type { ChatMessage, ChatMessageMetadata } from './message';
import type { SessionConfig } from './config';
import type { ToolCallRecord, ToolCallRequest } from './tool';
import type { DirectorState } from './director';

/**
 * Chat session type classification.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ChatSessionType = 'qa' | 'discussion' | 'lecture';

/**
 * Chat session status lifecycle.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ChatSessionStatus =
  | 'idle'
  | 'active'
  | 'soft-closing'
  | 'interrupted'
  | 'completed'
  | 'error';

/**
 * A chat session representing a conversation with one or more agents.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ChatSession {
  id: string;
  type: ChatSessionType;
  title: string;
  status: ChatSessionStatus;
  messages: ChatMessage<ChatMessageMetadata>[];
  config: SessionConfig;
  toolCalls: ToolCallRecord[];
  pendingToolCalls: ToolCallRequest[];
  createdAt: ISO8601;
  updatedAt: ISO8601;
  sceneId?: string;
  lastActionIndex?: number;
  endReason?: string;
  softCloseDeadline?: ISO8601;
  directorState?: DirectorState;
}

/**
 * Payload for creating a new chat session.
 * Omits server-generated fields (id, createdAt, updatedAt).
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ChatSessionCreate = Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Payload for updating a chat session.
 * Only allows updating specific fields.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ChatSessionUpdate = {
  id: string;
  status?: ChatSessionStatus;
  title?: string;
  messages?: ChatMessage<ChatMessageMetadata>[];
  toolCalls?: ToolCallRecord[];
  pendingToolCalls?: ToolCallRequest[];
  sceneId?: string;
  lastActionIndex?: number;
  endReason?: string;
  softCloseDeadline?: ISO8601;
  directorState?: DirectorState;
  updatedAt: ISO8601;
};

/**
 * Session list item (without full messages for efficiency).
 * Used for displaying session previews.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ChatSessionListItem {
  id: string;
  type: ChatSessionType;
  title: string;
  status: ChatSessionStatus;
  messageCount: number;
  toolCallCount: number;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}