/**
 * edit_interactive_html tool.
 *
 * Port of Web's lib/agent/tools/edit-interactive-html.ts.
 * Edits interactive scene HTML using find/replace.
 */

import type { EditInteractiveHtmlParams } from '../agentTypes';

/**
 * Execute the edit_interactive_html tool.
 */
export function prepareEditInteractiveHtml(params: EditInteractiveHtmlParams): {
  tool: string;
  params: EditInteractiveHtmlParams;
} {
  return {
    tool: 'edit_interactive_html',
    params: {
      sceneId: params.sceneId,
      find: params.find,
      replace: params.replace,
    },
  };
}
