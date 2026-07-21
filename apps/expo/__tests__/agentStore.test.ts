import { useAgentStore } from '../src/features/slides/agent/agentStore';

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.getState().clearMessages();
  });

  it('should set config', () => {
    useAgentStore.getState().setConfig({
      providerId: 'openai',
      modelId: 'gpt-4',
      apiKey: 'test-key',
    });
    expect(useAgentStore.getState().config).toBeTruthy();
  });

  it('should add message', () => {
    const msg = { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() };
    useAgentStore.getState().addMessage(msg);
    expect(useAgentStore.getState().messages).toHaveLength(1);
  });

  it('should set status', () => {
    useAgentStore.getState().setStatus('thinking');
    expect(useAgentStore.getState().status).toBe('thinking');
  });

  it('should set error', () => {
    useAgentStore.getState().setError('Test error');
    expect(useAgentStore.getState().error).toBe('Test error');
  });

  it('should clear messages', () => {
    useAgentStore.getState().addMessage({ id: '1', role: 'user', content: 'Hi', timestamp: Date.now() });
    useAgentStore.getState().clearMessages();
    expect(useAgentStore.getState().messages).toHaveLength(0);
  });
});
