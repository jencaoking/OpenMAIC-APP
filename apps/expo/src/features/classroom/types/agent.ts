/**
 * Agent 数据模型。
 * 移植自 Web 端 lib/orchestration/registry/types.ts
 */

export interface AgentConfig {
  id: string;
  name: string;
  role: 'teacher' | 'assistant' | 'student';
  persona: string;
  avatar: string;
  color: string;
  allowedActions: string[];
  priority: number;
  voiceConfig?: {
    providerId: string;
    modelId?: string;
    voiceId: string;
  };
  voiceDesign?: {
    identity: string;
    texture: string;
    delivery: string;
  };
  createdAt: number;
  updatedAt: number;
  isDefault: boolean;
  isGenerated?: boolean;
  boundStageId?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'user';
  avatar: string;
  color?: string;
  isOnline: boolean;
  isSpeaking?: boolean;
}

// 角色优先级
export const ROLE_PRIORITY: Record<string, number> = {
  teacher: 10,
  assistant: 7,
  student: 5,
};

// 角色允许的动作
export const ROLE_ACTIONS: Record<string, string[]> = {
  teacher: [
    'spotlight',
    'laser',
    'play_video',
    'wb_open',
    'wb_close',
    'wb_draw_text',
    'wb_draw_shape',
    'wb_draw_chart',
    'wb_draw_latex',
    'wb_draw_table',
    'wb_draw_line',
    'wb_draw_code',
    'wb_edit_code',
    'wb_clear',
    'wb_delete',
  ],
  assistant: [
    'wb_open',
    'wb_close',
    'wb_draw_text',
    'wb_draw_shape',
    'wb_draw_chart',
    'wb_draw_latex',
    'wb_draw_table',
    'wb_draw_line',
    'wb_draw_code',
    'wb_edit_code',
    'wb_clear',
    'wb_delete',
  ],
  student: [
    'wb_open',
    'wb_close',
    'wb_draw_text',
    'wb_draw_shape',
    'wb_draw_chart',
    'wb_draw_latex',
    'wb_draw_table',
    'wb_draw_line',
    'wb_draw_code',
    'wb_edit_code',
    'wb_clear',
    'wb_delete',
  ],
};

// 颜色调色板
export const AGENT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#e11d48',
  '#6366f1',
  '#84cc16',
  '#a855f7',
];

// 默认 Agent
export const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'default-1',
    name: 'AI 教师',
    role: 'teacher',
    persona: '专业的 AI 教师，善于用生动的例子解释复杂概念，鼓励学生思考。',
    avatar: '👨‍🏫',
    color: '#3b82f6',
    allowedActions: ROLE_ACTIONS.teacher,
    priority: ROLE_PRIORITY.teacher,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'default-2',
    name: 'AI 助教',
    role: 'assistant',
    persona: '耐心的 AI 助教，帮助学生理解难点，提供额外的解释和练习。',
    avatar: '🤝',
    color: '#10b981',
    allowedActions: ROLE_ACTIONS.assistant,
    priority: ROLE_PRIORITY.assistant,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'default-3',
    name: '显眼包',
    role: 'student',
    persona: '活泼幽默的学生，总能用有趣的角度看待问题，活跃课堂气氛。',
    avatar: '😄',
    color: '#f59e0b',
    allowedActions: ROLE_ACTIONS.student,
    priority: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'default-4',
    name: '好奇宝宝',
    role: 'student',
    persona: '充满好奇心的学生，总是追问"为什么"，推动课堂深入讨论。',
    avatar: '🤔',
    color: '#ec4899',
    allowedActions: ROLE_ACTIONS.student,
    priority: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'default-5',
    name: '笔记员',
    role: 'student',
    persona: '认真的学生，擅长整理笔记，帮助大家回顾重点内容。',
    avatar: '📝',
    color: '#8b5cf6',
    allowedActions: ROLE_ACTIONS.student,
    priority: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
  {
    id: 'default-6',
    name: '思考者',
    role: 'student',
    persona: '深思熟虑的学生，善于发现知识点之间的联系，提出深刻见解。',
    avatar: '🧠',
    color: '#06b6d4',
    allowedActions: ROLE_ACTIONS.student,
    priority: 6,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: true,
  },
];
