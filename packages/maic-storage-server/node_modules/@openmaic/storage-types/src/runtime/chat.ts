/**
 * Speaker roles for chat records.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ChatRuntimeRole = 'user' | 'assistant' | 'system';

/**
 * Minimal payload skeleton for chat records — just enough structure for a replay renderer.
 * Apps extend with their own fields by intersection.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ChatMessageSkeleton {
  role: ChatRuntimeRole;
  content: string;
}
