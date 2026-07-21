/**
 * 声音设计类型和工具。
 * 移植自 Web 端 lib/audio/voice-design.ts
 */

export interface VoiceDesign {
  identity: string; // 性别/年龄/角色 (如 "中年男性教授")
  texture: string; // 音高/音质 (如 "低沉共鸣的男中音")
  delivery: string; // 情感/语速 (如 "温暖沉稳带有温柔权威感")
}

export interface TTSProvider {
  id: string;
  name: string;
  requiresKey: boolean;
  voices: TTSVoice[];
  models?: string[];
}

export interface TTSVoice {
  voiceId: string;
  voiceName: string;
  voiceLanguage?: string;
  modelId?: string;
}

export interface AgentVoiceOverride {
  providerId: string;
  modelId?: string;
  voiceId: string;
}

export type AgentVoiceOverrides = Record<string, AgentVoiceOverride>;

export interface ResolvedVoice {
  providerId: string;
  modelId?: string;
  voiceId: string;
  voiceDesign?: VoiceDesign;
}

// TTS 提供商列表
export const TTS_PROVIDERS: TTSProvider[] = [
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    requiresKey: true,
    voices: [
      { voiceId: 'alloy', voiceName: 'Alloy', voiceLanguage: 'en' },
      { voiceId: 'echo', voiceName: 'Echo', voiceLanguage: 'en' },
      { voiceId: 'fable', voiceName: 'Fable', voiceLanguage: 'en' },
      { voiceId: 'onyx', voiceName: 'Onyx', voiceLanguage: 'en' },
      { voiceId: 'nova', voiceName: 'Nova', voiceLanguage: 'en' },
      { voiceId: 'shimmer', voiceName: 'Shimmer', voiceLanguage: 'en' },
    ],
    models: ['tts-1', 'tts-1-hd'],
  },
  {
    id: 'browser-native-tts',
    name: '浏览器原生 TTS',
    requiresKey: false,
    voices: [], // 动态获取
  },
];

// VoiceDesign 工具函数

/**
 * 构建 VoiceDesign 提示词。
 */
export function buildVoiceDesignPrompt(design: VoiceDesign): string {
  return [design.identity, design.texture, design.delivery]
    .map((part) => sanitizeVoiceDesignPart(part))
    .filter(Boolean)
    .join(', ');
}

/**
 * 清理 VoiceDesign 片段。
 */
function sanitizeVoiceDesignPart(part: string): string {
  if (!part) return '';
  return part
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // 移除控制字符
    .replace(/[()]/g, '') // 移除括号
    .slice(0, 200); // 截断到 200 字符
}

/**
 * 标准化 VoiceDesign。
 */
export function normalizeVoiceDesign(raw: any): VoiceDesign {
  return {
    identity: String(raw?.identity || ''),
    texture: String(raw?.texture || ''),
    delivery: String(raw?.delivery || ''),
  };
}

/**
 * 从 Persona 生成 VoiceDesign (简化版)。
 */
export function voiceDesignFromPersona(persona: string): VoiceDesign {
  // 简单的启发式提取
  const lower = persona.toLowerCase();

  let identity = '成年人';
  if (lower.includes('男') || lower.includes('male')) identity = '男性';
  if (lower.includes('女') || lower.includes('female')) identity = '女性';
  if (lower.includes('年轻') || lower.includes('young')) identity = '年轻' + identity;
  if (lower.includes('老年') || lower.includes('old')) identity = '年长' + identity;

  let texture = '清晰自然的声音';
  if (lower.includes('温柔') || lower.includes('warm')) texture = '温暖柔和的声音';
  if (lower.includes('低沉') || lower.includes('deep')) texture = '低沉共鸣的声音';
  if (lower.includes('活泼') || lower.includes('lively')) texture = '活泼明亮的声音';

  let delivery = '沉稳适中';
  if (lower.includes('鼓励') || lower.includes('encourage')) delivery = '鼓励性的语气';
  if (lower.includes('幽默') || lower.includes('humor')) delivery = '幽默风趣的语调';
  if (lower.includes('严肃') || lower.includes('serious')) delivery = '严肃认真的语调';

  return { identity, texture, delivery };
}
