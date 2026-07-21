/**
 * regenerate_scene_actions tool.
 *
 * Port of Web's lib/agent/tools/regenerate-scene-actions.ts.
 * Regenerates narration/actions only.
 */

import type { RegenerateSceneActionsParams } from '../agentTypes';

/**
 * Execute the regenerate_scene_actions tool.
 */
export function prepareRegenerateSceneActions(params: RegenerateSceneActionsParams): {
  tool: string;
  params: RegenerateSceneActionsParams;
} {
  return {
    tool: 'regenerate_scene_actions',
    params: {
      sceneId: params.sceneId,
      instruction: params.instruction,
    },
  };
}
