/**
 * regenerate_scene tool.
 *
 * Port of Web's lib/agent/tools/regenerate-scene.ts.
 * Regenerates entire scene content based on instruction.
 */

import type { RegenerateSceneParams } from '../agentTypes';

/**
 * Execute the regenerate_scene tool.
 */
export function prepareRegenerateScene(params: RegenerateSceneParams): {
  tool: string;
  params: RegenerateSceneParams;
} {
  return {
    tool: 'regenerate_scene',
    params: {
      sceneId: params.sceneId,
      instruction: params.instruction,
    },
  };
}
