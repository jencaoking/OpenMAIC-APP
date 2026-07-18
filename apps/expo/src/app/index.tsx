import React, { useState } from 'react';
import SessionListScreen from '../features/sessions/SessionListScreen';
import CreateSessionScreen from '../features/sessions/CreateSessionScreen';
import DslRenderScreen from '../features/dsl/DslRenderScreen';
import DslStressTestScreen from '../features/dsl/DslStressTestScreen';

type Screen = 'list' | 'create' | 'dsl' | 'stress';

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

  const handleShowStressTest = () => {
    setCurrentScreen('stress');
  };

  return (
    <>
      {currentScreen === 'list' && <SessionListScreen onAddSession={handleAddSession} onShowDsl={handleShowDsl} onShowStressTest={handleShowStressTest} />}
      {currentScreen === 'create' && <CreateSessionScreen onBack={handleBack} />}
      {currentScreen === 'dsl' && <DslRenderScreen onBack={handleBack} />}
      {currentScreen === 'stress' && <DslStressTestScreen onBack={handleBack} />}
    </>
  );
};

export default HomePage;