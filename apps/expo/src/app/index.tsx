import React, { useState } from 'react';
import SessionListScreen from '../features/sessions/SessionListScreen';
import CreateSessionScreen from '../features/sessions/CreateSessionScreen';
import DslRenderScreen from '../features/dsl/DslRenderScreen';

type Screen = 'list' | 'create' | 'dsl';

const HomePage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');

  const handleAddSession = () => {
    setCurrentScreen('create');
  };

  const handleBack = () => {
    setCurrentScreen('list');
  };

  const handleShowDsl = () => {
    setCurrentScreen('dsl');
  };

  return (
    <>
      {currentScreen === 'list' && <SessionListScreen onAddSession={handleAddSession} onShowDsl={handleShowDsl} />}
      {currentScreen === 'create' && <CreateSessionScreen onBack={handleBack} />}
      {currentScreen === 'dsl' && <DslRenderScreen onBack={handleBack} />}
    </>
  );
};

export default HomePage;