import React, { useState, useEffect } from 'react';
import SessionListScreen from '../features/sessions/SessionListScreen';
import CreateSessionScreen from '../features/sessions/CreateSessionScreen';
import DslRenderScreen from '../features/dsl/DslRenderScreen';
import DslStressTestScreen from '../features/dsl/DslStressTestScreen';
import { SessionChatScreen } from '../features/chat-flow/SessionChatScreen';
import { QuizScreen } from '../features/quiz/QuizScreen';
import { ClassroomScreen } from '../features/classroom/ClassroomScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import type { DeepLinkTarget } from '../types';

type Screen = 'list' | 'create' | 'dsl' | 'stress' | 'chat' | 'quiz' | 'classroom' | 'settings';

interface HomePageProps {
  /** 来自 Deep Link 或推送通知的待处理跳转目标。 */
  pendingDeepLink?: DeepLinkTarget | null;
  /** Deep Link 被消费后的回调，用于清理状态。 */
  onDeepLinkConsumed?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ pendingDeepLink, onDeepLinkConsumed }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('1');

  const handleAddSession = () => setCurrentScreen('create');
  const handleBack = () => setCurrentScreen('list');
  const handleShowDsl = () => setCurrentScreen('dsl');
  const handleShowStressTest = () => setCurrentScreen('stress');
  const handleStartChat = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentScreen('chat');
  };
  const handleStartQuiz = () => {
    setSelectedQuizId('1');
    setCurrentScreen('quiz');
  };
  const handleStartClassroom = () => {
    setCurrentScreen('classroom');
  };
  const handleShowSettings = () => {
    setCurrentScreen('settings');
  };

  /**
   * 消费 Deep Link 跳转目标。
   * 优先级：推送通知 > 初始 URL。
   */
  useEffect(() => {
    if (!pendingDeepLink) return;
    const { screen, params } = pendingDeepLink;
    switch (screen) {
      case 'chat':
        if (params?.sessionId) {
          setSelectedSessionId(params.sessionId);
          setCurrentScreen('chat');
        }
        break;
      case 'quiz':
        if (params?.quizId) {
          setSelectedQuizId(params.quizId);
        }
        setCurrentScreen('quiz');
        break;
      case 'dsl':
        setCurrentScreen('dsl');
        break;
      case 'list':
      default:
        setCurrentScreen('list');
        break;
    }
    onDeepLinkConsumed?.();
  }, [pendingDeepLink, onDeepLinkConsumed]);

  return (
    <>
      {currentScreen === 'list' && (
        <SessionListScreen
          onAddSession={handleAddSession}
          onShowDsl={handleShowDsl}
          onShowStressTest={handleShowStressTest}
          onStartChat={handleStartChat}
          onStartQuiz={handleStartQuiz}
          onStartClassroom={handleStartClassroom}
          onShowSettings={handleShowSettings}
        />
      )}
      {currentScreen === 'create' && <CreateSessionScreen onBack={handleBack} />}
      {currentScreen === 'dsl' && <DslRenderScreen onBack={handleBack} />}
      {currentScreen === 'stress' && <DslStressTestScreen onBack={handleBack} />}
      {currentScreen === 'chat' && <SessionChatScreen sessionId={selectedSessionId} />}
      {currentScreen === 'quiz' && <QuizScreen quizId={selectedQuizId} />}
      {currentScreen === 'classroom' && <ClassroomScreen onBack={handleBack} />}
      {currentScreen === 'settings' && <SettingsScreen onBack={handleBack} />}
    </>
  );
};

export default HomePage;
