// Simple module-level tests that don't require React rendering
describe('AgentPanel module', () => {
  it('should export agent store', () => {
    const { useAgentStore } = require('../src/features/slides/agent/agentStore');
    expect(useAgentStore).toBeDefined();
  });

  it('should manage agent state', () => {
    const { useAgentStore } = require('../src/features/slides/agent/agentStore');
    const store = useAgentStore.getState();
    store.clearMessages();
    expect(store.messages).toHaveLength(0);
    expect(store.status).toBe('idle');
  });

  it('should add message', () => {
    const { useAgentStore } = require('../src/features/slides/agent/agentStore');
    const store = useAgentStore.getState();
    store.clearMessages();
    store.addMessage({ id: '1', role: 'user', content: 'Hello', timestamp: Date.now() });
    expect(store.messages).toHaveLength(1);
  });
});
