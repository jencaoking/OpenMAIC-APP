/**
 * Agent Types for Mobile.
 *
 * Port of Web's agent-related types.
 */

// ============================================================================
// Agent Message Types
// ============================================================================

export type AgentMessageRole = 'user' | 'assistant' | 'system';

export interface AgentMessage {
  id: string;
  role: AgentMessageRole;
  content: string;
  timestamp: number;
  toolCalls?: AgentToolCall[];
  toolResults?: AgentToolResult[];
}

// ============================================================================
// Agent Tool Types
// ============================================================================

export interface AgentToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AgentToolResult {
  toolCallId: string;
  content: string;
  details?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// Agent Tool Definitions
// ============================================================================

export type AgentToolName =
  | 'read_scene_content'
  | 'regenerate_scene'
  | 'regenerate_scene_actions'
  | 'edit_interactive_html'
  | 'edit_elements';

export interface AgentToolDefinition {
  name: AgentToolName;
  description: string;
  parameters: Record<string, unknown>;
}

// ============================================================================
// Agent Session Types
// ============================================================================

export type AgentSessionStatus = 'idle' | 'thinking' | 'executing' | 'error';

export interface AgentSession {
  id: string;
  sceneId: string;
  messages: AgentMessage[];
  status: AgentSessionStatus;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Edit Intent Types
// ============================================================================

export type EditIntentType = 'update_element' | 'add_element' | 'remove_element';

export interface EditIntent {
  type: EditIntentType;
  elementId: string;
  patch?: Record<string, unknown>;
}

// ============================================================================
// Agent Event Types (from SSE stream)
// ============================================================================

export type AgentEventType =
  | 'text_delta'
  | 'tool_call_start'
  | 'tool_call_delta'
  | 'tool_call_end'
  | 'tool_result'
  | 'error'
  | 'done';

export interface AgentEvent {
  type: AgentEventType;
  data: Record<string, unknown>;
}

// ============================================================================
// Tool-specific Types
// ============================================================================

export interface ReadSceneContentParams {
  sceneId: string;
}

export interface RegenerateSceneParams {
  sceneId: string;
  instruction: string;
}

export interface RegenerateSceneActionsParams {
  sceneId: string;
  instruction: string;
}

export interface EditInteractiveHtmlParams {
  sceneId: string;
  find: string;
  replace: string;
}

export interface EditElementsParams {
  sceneId: string;
  patches: Array<{
    op: 'test' | 'add' | 'replace';
    path: string;
    value: unknown;
  }>;
  reason: string;
}

// ============================================================================
// Agent Config Types
// ============================================================================

export interface AgentConfig {
  providerId: string;
  modelId: string;
  apiKey: string;
  baseUrl?: string;
}

// ============================================================================
// Tool UI Props
// ============================================================================

export interface ToolCardProps {
  toolName: AgentToolName;
  args: Record<string, unknown>;
  result?: AgentToolResult;
  isLoading?: boolean;
}
