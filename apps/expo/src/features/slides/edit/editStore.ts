/**
 * Edit Mode Store for Mobile.
 *
 * Manages edit mode state: selected elements, toolbar visibility, etc.
 */

import { create } from 'zustand';

interface EditState {
  /** Whether edit mode is active */
  isEditMode: boolean;
  /** Currently selected element ID */
  selectedElementId: string | null;
  /** Whether the slide nav rail is collapsed */
  railCollapsed: boolean;
  /** Whether the agent panel is visible */
  agentPanelVisible: boolean;

  // Actions
  setEditMode: (enabled: boolean) => void;
  selectElement: (elementId: string | null) => void;
  toggleRail: () => void;
  setRailCollapsed: (collapsed: boolean) => void;
  toggleAgentPanel: () => void;
  setAgentPanelVisible: (visible: boolean) => void;
}

export const useEditStore = create<EditState>((set) => ({
  isEditMode: false,
  selectedElementId: null,
  railCollapsed: false,
  agentPanelVisible: false,

  setEditMode: (enabled) =>
    set({
      isEditMode: enabled,
      selectedElementId: null,
      agentPanelVisible: false,
    }),

  selectElement: (elementId) => set({ selectedElementId: elementId }),

  toggleRail: () => set((state) => ({ railCollapsed: !state.railCollapsed })),

  setRailCollapsed: (collapsed) => set({ railCollapsed: collapsed }),

  toggleAgentPanel: () => set((state) => ({ agentPanelVisible: !state.agentPanelVisible })),

  setAgentPanelVisible: (visible) => set({ agentPanelVisible: visible }),
}));
