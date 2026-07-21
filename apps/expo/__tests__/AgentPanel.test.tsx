import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AgentPanel } from '../src/features/slides/agent/AgentPanel';
import { useAgentStore } from '../src/features/slides/agent/agentStore';

describe('AgentPanel', () => {
  beforeEach(() => {
    useAgentStore.getState().clearMessages();
  });

  it('should render when visible', () => {
    const { getByText } = render(
      <AgentPanel sceneId="s1" sceneContext={{}} visible onClose={() => {}} />
    );
    expect(getByText('Edit with AI')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { toJSON } = render(
      <AgentPanel sceneId="s1" sceneContext={{}} visible={false} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  it('should show empty state when no messages', () => {
    const { getByText } = render(
      <AgentPanel sceneId="s1" sceneContext={{}} visible onClose={() => {}} />
    );
    expect(getByText('Ask me to edit slides, regenerate content, or fix interactive HTML.')).toBeTruthy();
  });
});
