/**
 * read_scene_content tool.
 *
 * Port of Web's lib/agent/tools/read-scene-content.ts.
 * Reads scene content for the agent to reason about.
 */

import type { ReadSceneContentParams } from '../agentTypes';

/**
 * Execute the read_scene_content tool.
 * In Mobile, this is handled server-side via the API.
 * This function provides the client-side parameter preparation.
 */
export function prepareReadSceneContent(params: ReadSceneContentParams): {
  tool: string;
  params: ReadSceneContentParams;
} {
  return {
    tool: 'read_scene_content',
    params: {
      sceneId: params.sceneId,
    },
  };
}
