import React from 'react';
import { AgentPanel } from '../src/features/slides/agent/AgentPanel';
import { useAgentStore } from '../src/features/slides/agent/agentStore';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  StyleSheet: { create: (s: any) => s },
  Platform: { OS: 'ios' },
}));

describe('AgentPanel', () => {
  beforeEach(() => {
    useAgentStore.getState().clearMessages();
  });

  it('should render when visible', () => {
    const element = React.createElement(AgentPanel, {
      sceneId: 's1',
      sceneContext: {},
      visible: true,
      onClose: () => {},
    });
    expect(element).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const element = React.createElement(AgentPanel, {
      sceneId: 's1',
      sceneContext: {},
      visible: false,
      onClose: () => {},
    });
    expect(element).toBeNull();
  });
});
