import React, { useState } from 'react';
import SessionListScreen from '../features/sessions/SessionListScreen';
import CreateSessionScreen from '../features/sessions/CreateSessionScreen';

type Screen = 'list' | 'create';

const HomePage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');

  const handleAddSession = () => {
    setCurrentScreen('create');
  };

  const handleBack = () => {
    setCurrentScreen('list');
  };

  return (
    <>
      {currentScreen === 'list' && <SessionListScreen onAddSession={handleAddSession} />}
      {currentScreen === 'create' && <CreateSessionScreen onBack={handleBack} />}
    </>
  );
};

export default HomePage;