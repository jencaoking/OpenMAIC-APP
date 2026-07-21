import {
  getSelectableAgents,
  calculateProgress,
  getActiveIssue,
  getCurrentIssue,
} from '../src/features/slides/pbl/pblTypes';

describe('agentTypes / pblTypes', () => {
  describe('getSelectableAgents', () => {
    it('should filter non-system development agents', () => {
      const agents = [
        { name: 'dev1', role_division: 'development', is_system_agent: false } as any,
        { name: 'dev2', role_division: 'development', is_system_agent: false } as any,
        { name: 'sys1', role_division: 'management', is_system_agent: true } as any,
        { name: 'mgmt1', role_division: 'management', is_system_agent: false } as any,
      ];
      const result = getSelectableAgents(agents);
      expect(result).toHaveLength(2);
      expect(result.map((a) => a.name)).toEqual(['dev1', 'dev2']);
    });

    it('should return empty for no agents', () => {
      expect(getSelectableAgents([])).toEqual([]);
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for empty issues', () => {
      expect(calculateProgress({ agent_ids: [], issues: [], current_issue_id: null })).toBe(0);
    });

    it('should return 50 for half done', () => {
      const issueboard = {
        agent_ids: [],
        issues: [
          { id: '1', is_done: true } as any,
          { id: '2', is_done: false } as any,
        ],
        current_issue_id: null,
      };
      expect(calculateProgress(issueboard)).toBe(50);
    });
  });

  describe('getActiveIssue', () => {
    it('should return active issue', () => {
      const issueboard = {
        agent_ids: [],
        issues: [
          { id: '1', is_active: false } as any,
          { id: '2', is_active: true } as any,
        ],
        current_issue_id: null,
      };
      expect(getActiveIssue(issueboard)?.id).toBe('2');
    });

    it('should return null when no active issue', () => {
      const issueboard = {
        agent_ids: [],
        issues: [{ id: '1', is_active: false } as any],
        current_issue_id: null,
      };
      expect(getActiveIssue(issueboard)).toBeNull();
    });
  });

  describe('getCurrentIssue', () => {
    it('should return issue by current_issue_id', () => {
      const issueboard = {
        agent_ids: [],
        issues: [
          { id: '1' } as any,
          { id: '2' } as any,
        ],
        current_issue_id: '2',
      };
      expect(getCurrentIssue(issueboard)?.id).toBe('2');
    });

    it('should return null when no current_issue_id', () => {
      const issueboard = {
        agent_ids: [],
        issues: [{ id: '1' } as any],
        current_issue_id: null,
      };
      expect(getCurrentIssue(issueboard)).toBeNull();
    });
  });
});
