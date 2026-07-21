/**
 * Agent Module for Mobile.
 *
 * AI Agent editing system - "Edit with AI" sidebar.
 */

// Types
export type {
  AgentMessage,
  AgentToolCall,
  AgentToolResult,
  AgentToolName,
  AgentSession,
  AgentSessionStatus,
  AgentConfig,
  EditIntent,
  EditElementsParams,
  RegenerateSceneParams,
} from './agentTypes';

// Tools
export { AGENT_TOOLS, V0_ALLOWLIST, getToolDefinition, isToolAllowed } from './tools/registry';
export { prepareReadSceneContent } from './tools/readSceneContent';
export { prepareRegenerateScene } from './tools/regenerateScene';
export { prepareRegenerateSceneActions } from './tools/regenerateSceneActions';
export { prepareEditInteractiveHtml } from './tools/editInteractiveHtml';
export { prepareEditElements, validatePatches, patchesToIntents } from './tools/editElements';

// Client
export { streamAgentResponse, sendAgentMessage } from './agentClient';

// Store
export { useAgentStore } from './agentStore';

// UI
export { AgentPanel } from './AgentPanel';
export { EditElementsUI } from './toolUIs/EditElementsUI';
export { RegenerateUI } from './toolUIs/RegenerateUI';
export { ReadContentUI } from './toolUIs/ReadContentUI';
