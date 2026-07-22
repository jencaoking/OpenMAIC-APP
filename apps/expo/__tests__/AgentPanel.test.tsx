// Simple module-level tests that don't require React rendering
describe('AgentPanel module', () => {
  it('should export agent store', () => {
    const { useAgentStore } = require('../src/features/slides/agent/agentStore');
    expect(useAgentStore).toBeDefined();
  });

  it('should manage agent state', () => {
    const { useAgentStore } = require('../src/features/slides/agent/agentStore');
    useAgentStore.getState().clearMessages();
    const state = useAgentStore.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.status).toBe('idle');
  });

  it('should add message', () => {
    const { useAgentStore } = require('../src/features/slides/agent/agentStore');
    useAgentStore.getState().clearMessages();
    useAgentStore.getState().addMessage({ id: '1', role: 'user', content: 'Hello', timestamp: Date.now() });
    // Must call getState() again to get updated state
    expect(useAgentStore.getState().messages).toHaveLength(1);
  });
});
