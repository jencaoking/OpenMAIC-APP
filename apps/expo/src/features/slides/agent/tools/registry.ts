/**
 * Agent Tool Registry for Mobile.
 *
 * Port of Web's lib/agent/tools/registry.ts.
 * Defines the 5 agent tools available for editing.
 */

import type { AgentToolDefinition, AgentToolName } from '../agentTypes';

/**
 * All available agent tools.
 */
export const AGENT_TOOLS: AgentToolDefinition[] = [
  {
    name: 'read_scene_content',
    description: 'Read the current scene content to understand its structure before making edits.',
    parameters: {
      sceneId: { type: 'string', description: 'The scene ID to read' },
    },
  },
  {
    name: 'regenerate_scene',
    description: 'Regenerate the entire scene content based on an instruction.',
    parameters: {
      sceneId: { type: 'string', description: 'The scene ID to regenerate' },
      instruction: { type: 'string', description: 'The regeneration instruction' },
    },
  },
  {
    name: 'regenerate_scene_actions',
    description: 'Regenerate only the narration/actions for a scene.',
    parameters: {
      sceneId: { type: 'string', description: 'The scene ID' },
      instruction: { type: 'string', description: 'The regeneration instruction' },
    },
  },
  {
    name: 'edit_interactive_html',
    description: 'Edit the HTML content of an interactive scene using find/replace.',
    parameters: {
      sceneId: { type: 'string', description: 'The scene ID' },
      find: { type: 'string', description: 'Text to find' },
      replace: { type: 'string', description: 'Text to replace with' },
    },
  },
  {
    name: 'edit_elements',
    description: 'Edit slide elements using JSON Patch operations.',
    parameters: {
      sceneId: { type: 'string', description: 'The scene ID' },
      patches: { type: 'array', description: 'JSON Patch operations' },
      reason: { type: 'string', description: 'Reason for the edit' },
    },
  },
];

/**
 * v0 allowlist — the enabled subset.
 */
export const V0_ALLOWLIST: ReadonlySet<AgentToolName> = new Set([
  'read_scene_content',
  'regenerate_scene',
  'regenerate_scene_actions',
  'edit_interactive_html',
  'edit_elements',
]);

/**
 * Get a tool definition by name.
 */
export function getToolDefinition(name: AgentToolName): AgentToolDefinition | undefined {
  return AGENT_TOOLS.find((t) => t.name === name);
}

/**
 * Check if a tool is in the allowlist.
 */
export function isToolAllowed(name: string): boolean {
  return V0_ALLOWLIST.has(name as AgentToolName);
}
