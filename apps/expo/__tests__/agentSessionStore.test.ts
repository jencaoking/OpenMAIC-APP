import { useAgentSessionStore } from '../src/features/slides/agent/agentSessionStore';

describe('agentSessionStore', () => {
  beforeEach(() => {
    useAgentSessionStore.setState({ sessions: {}, activeSessionIds: {} });
  });

  it('should create session', () => {
    const session = useAgentSessionStore.getState().createSession('stage1', 'scene1');
    expect(session.id).toBeTruthy();
    expect(session.sceneId).toBe('scene1');
  });

  it('should load session', () => {
    const session = useAgentSessionStore.getState().createSession('stage1', 'scene1');
    const loaded = useAgentSessionStore.getState().loadSession(session.id);
    expect(loaded?.id).toBe(session.id);
  });

  it('should save session', () => {
    const session = useAgentSessionStore.getState().createSession('stage1', 'scene1');
    session.title = 'Updated';
    useAgentSessionStore.getState().saveSession(session);
    const loaded = useAgentSessionStore.getState().loadSession(session.id);
    expect(loaded?.title).toBe('Updated');
  });

  it('should delete session', () => {
    const session = useAgentSessionStore.getState().createSession('stage1', 'scene1');
    useAgentSessionStore.getState().deleteSession(session.id);
    expect(useAgentSessionStore.getState().loadSession(session.id)).toBeUndefined();
  });

  it('should list sessions', () => {
    useAgentSessionStore.getState().createSession('stage1', 'scene1');
    useAgentSessionStore.getState().createSession('stage1', 'scene2');
    const sessions = useAgentSessionStore.getState().listSessions('stage1');
    expect(sessions).toHaveLength(2);
  });

  it('should set active session', () => {
    const session = useAgentSessionStore.getState().createSession('stage1', 'scene1');
    useAgentSessionStore.getState().setActiveSession('stage1', session.id);
    const active = useAgentSessionStore.getState().getActiveSession('stage1');
    expect(active?.id).toBe(session.id);
  });
});
