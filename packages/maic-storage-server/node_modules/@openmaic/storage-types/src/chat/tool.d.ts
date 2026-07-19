import type { ISO8601 } from '../runtime/session.js';
/**
 * Status of a tool call.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ToolCallStatus = 'pending' | 'executing' | 'completed' | 'failed';
/**
 * Pending tool call request sent to client for execution.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ToolCallRequest {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  agentId: string;
  status: 'pending' | 'executing';
  requestedAt: ISO8601;
}
/**
 * Completed tool call record with result.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface ToolCallRecord {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  agentId: string;
  result?: unknown;
  error?: string;
  status: ToolCallStatus;
  requestedAt: ISO8601;
  completedAt?: ISO8601;
}
//# sourceMappingURL=tool.d.ts.map
