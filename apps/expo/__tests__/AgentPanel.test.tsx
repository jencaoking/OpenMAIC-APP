import React from 'react';

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

const { AgentPanel } = require('../src/features/slides/agent/AgentPanel');
const { useAgentStore } = require('../src/features/slides/agent/agentStore');

describe('AgentPanel', () => {
  beforeEach(() => {
    useAgentStore.getState().clearMessages();
  });

  it('should render when visible', () => {
    const result = AgentPanel({
      sceneId: 's1',
      sceneContext: {},
      visible: true,
      onClose: () => {},
    });
    expect(result).toBeTruthy();
  });

  it('should return null when not visible', () => {
    const result = AgentPanel({
      sceneId: 's1',
      sceneContext: {},
      visible: false,
      onClose: () => {},
    });
    expect(result).toBeNull();
  });
});
