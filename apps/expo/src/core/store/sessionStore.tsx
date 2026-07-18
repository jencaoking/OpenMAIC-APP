import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { RuntimeSession, RuntimeSessionCreate } from '@openmaic/storage-types';
import { apiPost } from '../api/client';
import { syncManager } from '../../db/syncManager';

export interface SessionState {
  sessions: RuntimeSession[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  createStatus: 'idle' | 'creating' | 'success' | 'error';
  createError: string | null;
}

type SessionAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: RuntimeSession[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: RuntimeSession }
  | { type: 'CREATE_ERROR'; payload: string }
  | { type: 'RESET_CREATE_STATUS' };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, sessions: action.payload, status: 'success', error: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'CREATE_START':
      return { ...state, createStatus: 'creating', createError: null };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        createStatus: 'success',
        createError: null,
      };
    case 'CREATE_ERROR':
      return { ...state, createStatus: 'error', createError: action.payload };
    case 'RESET_CREATE_STATUS':
      return { ...state, createStatus: 'idle', createError: null };
    default:
      return state;
  }
}

const initialState: SessionState = {
  sessions: [],
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null,
};

interface SessionContextType {
  state: SessionState;
  fetchSessions: (stageId?: string, learnerKey?: string) => Promise<void>;
  createSession: (payload: RuntimeSessionCreate) => Promise<void>;
  resetCreateStatus: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const fetchSessions = useCallback(async (stageId?: string, learnerKey?: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const localSessions = await syncManager.getSessions(stageId, learnerKey);

      const runtimeSessions: RuntimeSession[] = localSessions.map((session) => ({
        id: session.id,
        runtimeDslVersion: '',
        kind: session.kind,
        stageId: session.stage_id,
        learnerKey: session.learner_key,
        status: session.status as RuntimeSession['status'],
        createdAt: session.updated_at || new Date().toISOString(),
        updatedAt: session.updated_at,
      }));

      dispatch({ type: 'FETCH_SUCCESS', payload: runtimeSessions });

      syncManager.forceSync();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  }, []);

  const createSession = useCallback(async (payload: RuntimeSessionCreate) => {
    dispatch({ type: 'CREATE_START' });
    try {
      const session = await apiPost<RuntimeSession, RuntimeSessionCreate>('/sessions', payload);

      await syncManager.insertSession({
        id: session.id,
        course_id: null,
        stage_id: session.stageId,
        learner_key: session.learnerKey,
        kind: session.kind,
        status: session.status,
        last_message_at: null,
        updated_at: session.updatedAt,
      });

      dispatch({ type: 'CREATE_SUCCESS', payload: session });

      syncManager.forceSync();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      dispatch({ type: 'CREATE_ERROR', payload: errorMessage });
    }
  }, []);

  const resetCreateStatus = useCallback(() => {
    dispatch({ type: 'RESET_CREATE_STATUS' });
  }, []);

  return (
    <SessionContext.Provider value={{ state, fetchSessions, createSession, resetCreateStatus }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionStore(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionStore must be used within a SessionProvider');
  }
  return context;
}
