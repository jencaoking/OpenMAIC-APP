import { create } from 'zustand';
import { DEFAULT_AGENTS, type AgentConfig, type Participant } from '../types/agent';

interface AgentRegistryState {
  agents: Record<string, AgentConfig>;
  selectedAgentIds: string[];
  agentMode: 'preset' | 'auto';

  // Actions
  addAgent: (agent: AgentConfig) => void;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
  deleteAgent: (id: string) => void;
  getAgent: (id: string) => AgentConfig | undefined;
  listAgents: () => AgentConfig[];

  // Selection
  setSelectedAgentIds: (ids: string[]) => void;
  setAgentMode: (mode: 'preset' | 'auto') => void;
  toggleAgent: (id: string) => void;

  // Participants
  getParticipants: () => Participant[];
}

// 初始化默认 Agent
const initialAgents: Record<string, AgentConfig> = {};
DEFAULT_AGENTS.forEach((agent) => {
  initialAgents[agent.id] = agent;
});

export const useAgentRegistry = create<AgentRegistryState>((set, get) => ({
  agents: initialAgents,
  selectedAgentIds: ['default-1', 'default-2', 'default-3'],
  agentMode: 'preset',

  addAgent: (agent) =>
    set((state) => ({
      agents: { ...state.agents, [agent.id]: agent },
    })),

  updateAgent: (id, updates) =>
    set((state) => {
      const agent = state.agents[id];
      if (!agent) return state;
      return {
        agents: {
          ...state.agents,
          [id]: { ...agent, ...updates, updatedAt: Date.now() },
        },
      };
    }),

  deleteAgent: (id) =>
    set((state) => {
      const agent = state.agents[id];
      if (!agent || agent.isDefault) return state;
      const { [id]: _, ...rest } = state.agents;
      return {
        agents: rest,
        selectedAgentIds: state.selectedAgentIds.filter((sid) => sid !== id),
      };
    }),

  getAgent: (id) => get().agents[id],

  listAgents: () => Object.values(get().agents),

  setSelectedAgentIds: (ids) => set({ selectedAgentIds: ids }),

  setAgentMode: (mode) => set({ agentMode: mode }),

  toggleAgent: (id) =>
    set((state) => {
      const agent = state.agents[id];
      if (!agent || agent.role === 'teacher') return state; // 教师不可取消

      const isSelected = state.selectedAgentIds.includes(id);
      return {
        selectedAgentIds: isSelected
          ? state.selectedAgentIds.filter((sid) => sid !== id)
          : [...state.selectedAgentIds, id],
      };
    }),

  getParticipants: () => {
    const { agents, selectedAgentIds } = get();
    const participants: Participant[] = [];

    // 按优先级排序
    const sorted = selectedAgentIds
      .map((id) => agents[id])
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority);

    sorted.forEach((agent) => {
      participants.push({
        id: agent.id,
        name: agent.name,
        role: agent.role === 'teacher' ? 'teacher' : 'student',
        avatar: agent.avatar,
        color: agent.color,
        isOnline: true,
        isSpeaking: false,
      });
    });

    // 添加用户
    participants.push({
      id: 'user',
      name: '我',
      role: 'user',
      avatar: '👤',
      isOnline: true,
    });

    return participants;
  },
}));
