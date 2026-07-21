import {
  AGENT_TOOLS,
  V0_ALLOWLIST,
  getToolDefinition,
  isToolAllowed,
} from '../src/features/slides/agent/tools/registry';

describe('agentTools', () => {
  it('should have 5 tools', () => {
    expect(AGENT_TOOLS).toHaveLength(5);
  });

  it('should have V0_ALLOWLIST with 5 tools', () => {
    expect(V0_ALLOWLIST.size).toBe(5);
  });

  it('should get tool definition', () => {
    const tool = getToolDefinition('read_scene_content');
    expect(tool).toBeTruthy();
    expect(tool?.name).toBe('read_scene_content');
  });

  it('should return undefined for unknown tool', () => {
    expect(getToolDefinition('unknown' as any)).toBeUndefined();
  });

  it('should check tool allowed', () => {
    expect(isToolAllowed('read_scene_content')).toBe(true);
    expect(isToolAllowed('unknown')).toBe(false);
  });
});
