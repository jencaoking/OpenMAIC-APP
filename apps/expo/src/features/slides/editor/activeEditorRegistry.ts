/**
 * Active text editor registry — port of lib/prosemirror/active-editor-registry.ts.
 *
 * Allows the format bar to route commands to the correct editor instance.
 * Each editable text element registers a runner while it is active.
 */

export interface TextCommandPayload {
  command:
    | 'bold'
    | 'em'
    | 'underline'
    | 'fontname'
    | 'fontsize'
    | 'forecolor'
    | 'align-left'
    | 'align-center'
    | 'align-right'
    | 'bulletList';
  value?: string;
}

type Runner = (payload: TextCommandPayload) => void;

const runners = new Map<string, Runner>();

/**
 * Register a runner for the given element ID. Returns an unregister function.
 */
export function registerActiveTextEditor(elementId: string, run: Runner): () => void {
  runners.set(elementId, run);
  return () => {
    if (runners.get(elementId) === run) runners.delete(elementId);
  };
}

/**
 * Check if an editor is registered for the given element ID.
 */
export function hasActiveTextEditor(elementId: string): boolean {
  return runners.has(elementId);
}

/**
 * Execute a text command on the registered editor for the given element ID.
 */
export function runActiveTextCommand(elementId: string, payload: TextCommandPayload): void {
  runners.get(elementId)?.(payload);
}
