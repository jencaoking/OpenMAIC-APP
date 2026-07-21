/**
 * Whiteboard Store for Mobile.
 *
 * Manages whiteboard state: open/closed, snapshots, clearing.
 */

import { create } from 'zustand';
import type { PPTElement } from '@openmaic/dsl';

export interface WhiteboardSnapshot {
  elements: PPTElement[];
  timestamp: number;
  fingerprint: string;
}

interface WhiteboardState {
  /** Whether whiteboard is open */
  isOpen: boolean;
  /** Whether clear animation is in progress */
  isClearing: boolean;
  /** Saved snapshots */
  snapshots: WhiteboardSnapshot[];
  /** Current whiteboard elements */
  elements: PPTElement[];

  // Actions
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setClearing: (clearing: boolean) => void;
  setElements: (elements: PPTElement[]) => void;
  pushSnapshot: (elements: PPTElement[]) => void;
  getSnapshot: (index: number) => WhiteboardSnapshot | undefined;
  clearElements: () => void;
  restoreSnapshot: (index: number) => PPTElement[] | null;
}

function computeFingerprint(elements: PPTElement[]): string {
  return JSON.stringify(elements.map((e) => e.id).sort());
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  isOpen: false,
  isClearing: false,
  snapshots: [],
  elements: [],

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setClearing: (clearing) => set({ isClearing: clearing }),
  setElements: (elements) => set({ elements }),

  pushSnapshot: (elements) =>
    set((state) => ({
      snapshots: [
        ...state.snapshots,
        {
          elements: JSON.parse(JSON.stringify(elements)),
          timestamp: Date.now(),
          fingerprint: computeFingerprint(elements),
        },
      ],
    })),

  getSnapshot: (index) => get().snapshots[index],

  clearElements: () => set({ elements: [] }),

  restoreSnapshot: (index) => {
    const snapshot = get().snapshots[index];
    if (!snapshot) return null;
    set({ elements: JSON.parse(JSON.stringify(snapshot.elements)) });
    return snapshot.elements;
  },
}));
