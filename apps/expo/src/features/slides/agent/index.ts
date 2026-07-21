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
  AgentSessionStatus,
  AgentConfig,
  EditIntent,
  EditElementsParams,
  RegenerateSceneParams,
} from './agentTypes';

export type {
  Action,
  ActionType,
  SpeechAction,
  SpotlightAction,
  LaserAction,
  DiscussionAction,
  AddableType,
} from './actionTypes';

export { makeAction, getActionLabel, getActionIcon } from './actionTypes';

// Tools
export { AGENT_TOOLS, V0_ALLOWLIST, getToolDefinition, isToolAllowed } from './tools/registry';
export { prepareReadSceneContent } from './tools/readSceneContent';
export { prepareRegenerateScene } from './tools/regenerateScene';
export { prepareRegenerateSceneActions } from './tools/regenerateSceneActions';
export { prepareEditInteractiveHtml } from './tools/editInteractiveHtml';
export { prepareEditElements, validatePatches, patchesToIntents } from './tools/editElements';

// Actions Edit
export {
  insertAt,
  removeById,
  moveByIdDir,
  moveById,
  setSpeechText,
  setDiscussionTopic,
  setElementId,
  hasDiscussion,
  appendDiscussion,
} from './actionsEdit';

// Client
export { streamAgentResponse, sendAgentMessage } from './agentClient';

// Stores
export { useAgentStore } from './agentStore';
export { useAgentSessionStore } from './agentSessionStore';
export type { AgentSession } from './agentSessionStore';

// UI
export { AgentPanel } from './AgentPanel';
export { ActionsBar } from './ActionsBar';
export { ActionPicker } from './ActionPicker';
export { EditElementsUI } from './toolUIs/EditElementsUI';
export { RegenerateUI } from './toolUIs/RegenerateUI';
export { ReadContentUI } from './toolUIs/ReadContentUI';
