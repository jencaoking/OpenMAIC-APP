/**
 * Action Edit Utilities for Mobile.
 *
 * Port of Web's actions-edit.ts.
 * Pure functions for action manipulation.
 */

import type { Action, AddableType } from './actionTypes';
import { makeAction } from './actionTypes';

/**
 * Insert an action at a specific index.
 */
export function insertAt(actions: Action[], index: number, action: Action): Action[] {
  const newActions = [...actions];
  newActions.splice(index, 0, action);
  return newActions;
}

/**
 * Remove an action by ID.
 */
export function removeById(actions: Action[], id: string): Action[] {
  return actions.filter((a) => a.id !== id);
}

/**
 * Move an action by ID in a direction.
 */
export function moveByIdDir(actions: Action[], id: string, direction: 'up' | 'down'): Action[] {
  const idx = actions.findIndex((a) => a.id === id);
  if (idx === -1) return actions;

  const newIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= actions.length) return actions;

  const newActions = [...actions];
  const [item] = newActions.splice(idx, 1);
  newActions.splice(newIdx, 0, item);
  return newActions;
}

/**
 * Move an action by ID to a target index.
 */
export function moveById(actions: Action[], id: string, toIndex: number): Action[] {
  const idx = actions.findIndex((a) => a.id === id);
  if (idx === -1) return actions;

  const newActions = [...actions];
  const [item] = newActions.splice(idx, 1);
  newActions.splice(toIndex, 0, item);
  return newActions;
}

/**
 * Update speech text for an action.
 */
export function setSpeechText(actions: Action[], id: string, text: string): Action[] {
  return actions.map((a) => (a.id === id && a.type === 'speech' ? { ...a, text } : a));
}

/**
 * Update discussion topic for an action.
 */
export function setDiscussionTopic(actions: Action[], id: string, topic: string): Action[] {
  return actions.map((a) => (a.id === id && a.type === 'discussion' ? { ...a, topic } : a));
}

/**
 * Update element ID for spotlight/laser actions.
 */
export function setElementId(actions: Action[], id: string, elementId: string): Action[] {
  return actions.map((a) =>
    a.id === id && (a.type === 'spotlight' || a.type === 'laser') ? { ...a, elementId } : a,
  );
}

/**
 * Check if scene has a discussion action.
 */
export function hasDiscussion(actions: Action[]): boolean {
  return actions.some((a) => a.type === 'discussion');
}

/**
 * Append a discussion action to the end.
 */
export function appendDiscussion(actions: Action[], id: string): Action[] {
  if (hasDiscussion(actions)) return actions;
  return [...actions, { id, type: 'discussion', topic: '' }];
}
