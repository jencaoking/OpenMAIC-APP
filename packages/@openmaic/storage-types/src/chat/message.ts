import type { ISO8601 } from '../runtime/session.js';

/**
 * Role of the message sender in chat context.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ChatMessageRole = 'user' | 'assistant' | 'system';

/**
 * Action button that can be attached to chat messages.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ChatMessageAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'spotlight' | 'highlight' | 'reset' | 'insert' | 'draw';
}

/**
 * Metadata attached to chat messages.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ChatMessageMetadata {
  senderName?: string;
  senderAvatar?: string;
  originalRole?: 'teacher' | 'agent' | 'user';
  actions?: ChatMessageAction[];
  agentId?: string;
  agentColor?: string;
  createdAt?: ISO8601;
  interrupted?: boolean;
}

/**
 * A single chat message with typed metadata.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ChatMessage<TMetadata extends ChatMessageMetadata = ChatMessageMetadata> {
  id: string;
  role: ChatMessageRole;
  content: string;
  metadata?: TMetadata;
  createdAt: ISO8601;
}