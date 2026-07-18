import React, { useState } from 'react';
import SessionListScreen from '../features/sessions/SessionListScreen';
import CreateSessionScreen from '../features/sessions/CreateSessionScreen';
import DslRenderScreen from '../features/dsl/DslRenderScreen';
import DslStressTestScreen from '../features/dsl/DslStressTestScreen';
import { SessionChatScreen } from '../features/chat-flow/SessionChatScreen';
import { QuizScreen } from '../features/quiz/QuizScreen';

type Screen = 'list' | 'create' | 'dsl' | 'stress' | 'chat' | 'quiz';

const HomePage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

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

  const handleStartChat = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentScreen('chat');
  };

  const handleStartQuiz = () => {
    setCurrentScreen('quiz');
  };

  return (
    <>
      {currentScreen === 'list' && <SessionListScreen onAddSession={handleAddSession} onShowDsl={handleShowDsl} onShowStressTest={handleShowStressTest} onStartChat={handleStartChat} onStartQuiz={handleStartQuiz} />}
      {currentScreen === 'create' && <CreateSessionScreen onBack={handleBack} />}
      {currentScreen === 'dsl' && <DslRenderScreen onBack={handleBack} />}
      {currentScreen === 'stress' && <DslStressTestScreen onBack={handleBack} />}
      {currentScreen === 'chat' && <SessionChatScreen sessionId={selectedSessionId} />}
      {currentScreen === 'quiz' && <QuizScreen quizId="1" />}
    </>
  );
};

export default HomePage;