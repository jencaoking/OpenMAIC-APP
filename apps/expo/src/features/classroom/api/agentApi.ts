/**
 * Agent 生成 API 客户端。
 * 调用 Web 端的 Agent 生成接口。
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface AgentGenerationRequest {
  stageInfo: {
    name: string;
    description?: string;
  };
  sceneOutlines?: Array<{
    title: string;
    description?: string;
  }>;
  languageDirective: string;
  availableAvatars: string[];
}

export interface GeneratedAgent {
  id: string;
  name: string;
  role: 'teacher' | 'assistant' | 'student';
  persona: string;
  avatar: string;
  color: string;
  priority: number;
  voiceConfig?: {
    providerId: string;
    voiceId: string;
  };
  voiceDesign?: {
    identity: string;
    texture: string;
    delivery: string;
  };
}

/**
 * 调用 Agent 生成接口。
 */
export async function generateAgentProfiles(
  request: AgentGenerationRequest
): Promise<GeneratedAgent[]> {
  const response = await fetch(`${API_BASE}/api/generate/agent-profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.agents || [];
}

/**
 * 获取默认 Agent 列表。
 */
export function getDefaultAgents() {
  return [
    { id: 'default-1', name: 'AI 教师', role: 'teacher' as const, persona: '专业的 AI 教师' },
    { id: 'default-2', name: 'AI 助教', role: 'assistant' as const, persona: '耐心的 AI 助教' },
    { id: 'default-3', name: '显眼包', role: 'student' as const, persona: '活泼幽默的学生' },
    { id: 'default-4', name: '好奇宝宝', role: 'student' as const, persona: '充满好奇心的学生' },
  ];
}
