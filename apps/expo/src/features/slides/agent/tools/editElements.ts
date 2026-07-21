/**
 * edit_elements tool.
 *
 * Port of Web's lib/agent/tools/edit-elements.ts.
 * Edits slide elements using JSON Patch operations.
 */

import type { EditElementsParams, EditIntent } from '../agentTypes';

/**
 * Validate JSON Patch operations against element inventory.
 */
export function validatePatches(
  patches: EditElementsParams['patches'],
  elementIds: string[],
): { valid: boolean; error?: string } {
  for (const patch of patches) {
    // Extract element ID from path (e.g., /elements/0/content → element at index 0)
    const match = patch.path.match(/^\/elements\/(\d+)\//);
    if (match) {
      const index = parseInt(match[1], 10);
      if (index < 0 || index >= elementIds.length) {
        return { valid: false, error: `Invalid element index: ${index}` };
      }
    }

    // Test operations must match existing element IDs
    if (patch.op === 'test') {
      const idMatch = patch.path.match(/^\/elements\/\d+\/id$/);
      if (idMatch && !elementIds.includes(patch.value as string)) {
        return { valid: false, error: `Element ID not found: ${patch.value}` };
      }
    }
  }
  return { valid: true };
}

/**
 * Convert JSON Patch operations to EditIntents.
 */
export function patchesToIntents(
  patches: EditElementsParams['patches'],
  elementIds: string[],
): EditIntent[] {
  const intents: EditIntent[] = [];

  for (const patch of patches) {
    const idMatch = patch.path.match(/^\/elements\/(\d+)\/id$/);
    if (patch.op === 'test' && idMatch) {
      // Test operations are validation-only, skip
      continue;
    }

    const elementMatch = patch.path.match(/^\/elements\/(\d+)\//);
    if (elementMatch) {
      const index = parseInt(elementMatch[1], 10);
      const elementId = elementIds[index];

      if (patch.op === 'replace') {
        intents.push({
          type: 'update_element',
          elementId,
          patch: patch.value as Record<string, unknown>,
        });
      } else if (patch.op === 'add') {
        intents.push({
          type: 'add_element',
          elementId,
          patch: patch.value as Record<string, unknown>,
        });
      }
    }
  }

  return intents;
}

/**
 * Execute the edit_elements tool.
 */
export function prepareEditElements(params: EditElementsParams): {
  tool: string;
  params: EditElementsParams;
} {
  return {
    tool: 'edit_elements',
    params: {
      sceneId: params.sceneId,
      patches: params.patches,
      reason: params.reason,
    },
  };
}
