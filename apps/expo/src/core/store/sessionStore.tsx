import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { RuntimeSession } from '@openmaic/storage-types';
import { apiGet } from '../api/client';

export interface SessionState {
  sessions: RuntimeSession[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

type SessionAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: RuntimeSession[] }
  | { type: 'FETCH_ERROR'; payload: string };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, sessions: action.payload, status: 'success', error: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}

const initialState: SessionState = {
  sessions: [],
  status: 'idle',
  error: null,
};

interface SessionContextType {
  state: SessionState;
  fetchSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const fetchSessions = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const sessions = await apiGet<RuntimeSession[]>('/sessions');
      dispatch({ type: 'FETCH_SUCCESS', payload: sessions });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  }, []);

  return (
    <SessionContext.Provider value={{ state, fetchSessions }}>
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