/**
 * Agent Session Store for Mobile.
 *
 * Simplified version of Web's agent-thread-store.ts.
 * Uses Zustand instead of IndexedDB for persistence.
 */

import { create } from 'zustand';
import type { AgentMessage } from './agentTypes';

export interface AgentSession {
  id: string;
  sceneId: string;
  title: string;
  messages: AgentMessage[];
  createdAt: number;
  updatedAt: number;
}

interface AgentSessionState {
  /** All sessions */
  sessions: Record<string, AgentSession>;
  /** Active session ID per stage */
  activeSessionIds: Record<string, string>;

  // Actions
  createSession: (stageId: string, sceneId: string) => AgentSession;
  loadSession: (sessionId: string) => AgentSession | undefined;
  saveSession: (session: AgentSession) => void;
  deleteSession: (sessionId: string) => void;
  listSessions: (stageId: string) => AgentSession[];
  getActiveSession: (stageId: string) => AgentSession | undefined;
  setActiveSession: (stageId: string, sessionId: string) => void;
}

export const useAgentSessionStore = create<AgentSessionState>((set, get) => ({
  sessions: {},
  activeSessionIds: {},

  createSession: (stageId, sceneId) => {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const session: AgentSession = {
      id,
      sceneId,
      title: `Session ${Object.keys(get().sessions).length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      sessions: { ...state.sessions, [id]: session },
      activeSessionIds: { ...state.activeSessionIds, [stageId]: id },
    }));

    return session;
  },

  loadSession: (sessionId) => get().sessions[sessionId],

  saveSession: (session) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [session.id]: { ...session, updatedAt: Date.now() },
      },
    })),

  deleteSession: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...rest } = state.sessions;
      return { sessions: rest };
    }),

  listSessions: (stageId) => {
    const sessions = Object.values(get().sessions);
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  getActiveSession: (stageId) => {
    const activeId = get().activeSessionIds[stageId];
    if (!activeId) return undefined;
    return get().sessions[activeId];
  },

  setActiveSession: (stageId, sessionId) =>
    set((state) => ({
      activeSessionIds: { ...state.activeSessionIds, [stageId]: sessionId },
    })),
}));
