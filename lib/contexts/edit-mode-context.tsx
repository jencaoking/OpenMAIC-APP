'use client';

import React, { createContext, useContext, useCallback, useEffect } from 'react';

export interface EditModeContextValue {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({
  children,
  initialMode = false,
}: {
  children: React.ReactNode;
  initialMode?: boolean;
}) {
  const [isEditMode, setIsEditModeState] = React.useState(initialMode);

  useEffect(() => {
    document.body.setAttribute('data-maic-editor', String(isEditMode));
  }, [isEditMode]);

  const toggleEditMode = useCallback(() => {
    setIsEditModeState((prev) => !prev);
  }, []);

  const setEditMode = useCallback((enabled: boolean) => {
    setIsEditModeState(enabled);
  }, []);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        setEditMode,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode(): EditModeContextValue {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
}
