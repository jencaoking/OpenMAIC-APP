/**
 * PBL Store for Mobile.
 *
 * Manages PBL state: project config, selected role, chat messages.
 */

import { create } from 'zustand';
import type { PBLProjectConfig, PBLChatMessage, PBLIssue } from './pblTypes';
import { getActiveIssue } from './pblTypes';

interface PBLState {
  /** Current project config */
  projectConfig: PBLProjectConfig | null;
  /** User's selected role */
  selectedRole: string | null;
  /** Chat messages */
  messages: PBLChatMessage[];
  /** Whether agent is responding */
  isLoading: boolean;

  // Actions
  setProjectConfig: (config: PBLProjectConfig) => void;
  selectRole: (roleName: string) => void;
  resetRole: () => void;
  addMessage: (message: PBLChatMessage) => void;
  setMessages: (messages: PBLChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  markIssueDone: (issueId: string) => void;
  setActiveIssue: (issueId: string) => void;
}

export const usePBLStore = create<PBLState>((set, get) => ({
  projectConfig: null,
  selectedRole: null,
  messages: [],
  isLoading: false,

  setProjectConfig: (config) =>
    set({
      projectConfig: config,
      selectedRole: config.selectedRole || null,
      messages: config.chat.messages,
    }),

  selectRole: (roleName) =>
    set((state) => {
      if (!state.projectConfig) return {};
      const newConfig = {
        ...state.projectConfig,
        selectedRole: roleName,
      };
      return {
        selectedRole: roleName,
        projectConfig: newConfig,
      };
    }),

  resetRole: () =>
    set((state) => {
      if (!state.projectConfig) return {};
      return {
        selectedRole: null,
        projectConfig: {
          ...state.projectConfig,
          selectedRole: null,
          chat: { messages: [] },
        },
        messages: [],
      };
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setLoading: (loading) => set({ isLoading: loading }),

  markIssueDone: (issueId) =>
    set((state) => {
      if (!state.projectConfig) return {};
      const newIssueboard = {
        ...state.projectConfig.issueboard,
        issues: state.projectConfig.issueboard.issues.map((i) =>
          i.id === issueId ? { ...i, is_done: true } : i,
        ),
      };
      return {
        projectConfig: {
          ...state.projectConfig,
          issueboard: newIssueboard,
        },
      };
    }),

  setActiveIssue: (issueId) =>
    set((state) => {
      if (!state.projectConfig) return {};
      const newIssueboard = {
        ...state.projectConfig.issueboard,
        current_issue_id: issueId,
        issues: state.projectConfig.issueboard.issues.map((i) => ({
          ...i,
          is_active: i.id === issueId,
        })),
      };
      return {
        projectConfig: {
          ...state.projectConfig,
          issueboard: newIssueboard,
        },
      };
    }),
}));
