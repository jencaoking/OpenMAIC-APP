/**
 * Action Types for Mobile.
 *
 * Port of Web's lib/types/action.ts (re-export from @openmaic/dsl).
 * Simplified for Mobile.
 */

// ============================================================================
// Action Types
// ============================================================================

export type ActionType =
  | 'speech'
  | 'spotlight'
  | 'laser'
  | 'discussion'
  | 'wb_open'
  | 'wb_close'
  | 'wb_draw_text'
  | 'wb_draw_shape'
  | 'wb_clear'
  | 'wb_delete'
  | 'play_video';

export interface ActionBase {
  id: string;
  type: ActionType;
}

export interface SpeechAction extends ActionBase {
  type: 'speech';
  text: string;
  audioId?: string;
  agentName?: string;
}

export interface SpotlightAction extends ActionBase {
  type: 'spotlight';
  elementId: string;
}

export interface LaserAction extends ActionBase {
  type: 'laser';
  elementId: string;
}

export interface DiscussionAction extends ActionBase {
  type: 'discussion';
  topic: string;
  agentName?: string;
}

export type Action = SpeechAction | SpotlightAction | LaserAction | DiscussionAction;

// ============================================================================
// Action Utilities
// ============================================================================

export type AddableType = 'speech' | 'spotlight' | 'laser';

export function makeAction(type: AddableType, id: string): Action {
  switch (type) {
    case 'speech':
      return { id, type: 'speech', text: '' };
    case 'spotlight':
      return { id, type: 'spotlight', elementId: '' };
    case 'laser':
      return { id, type: 'laser', elementId: '' };
  }
}

export function getActionLabel(action: Action): string {
  switch (action.type) {
    case 'speech':
      return action.text || 'Speech';
    case 'spotlight':
      return 'Spotlight';
    case 'laser':
      return 'Laser';
    case 'discussion':
      return action.topic || 'Discussion';
    default:
      return action.type;
  }
}

export function getActionIcon(action: Action): string {
  switch (action.type) {
    case 'speech':
      return '💬';
    case 'spotlight':
      return '🔦';
    case 'laser':
      return '🔴';
    case 'discussion':
      return '💬';
    default:
      return '📌';
  }
}
