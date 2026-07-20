/**
 * 声音解析器。
 * 移植自 Web 端 lib/audio/voice-resolver.ts
 */

import type { AgentConfig } from '../types/agent';
import type {
  TTSProvider,
  TTSVoice,
  ResolvedVoice,
  AgentVoiceOverride,
  AgentVoiceOverrides,
  VoiceDesign,
} from '../types/voice';
import { TTS_PROVIDERS, normalizeVoiceDesign, voiceDesignFromPersona } from '../types/voice';

interface ResolvedVoiceResult {
  providerId: string;
  voiceId: string;
  modelId?: string;
}

/**
 * 解析 Agent 的 TTS 声音。
 * 优先级: 覆盖 > Agent 配置 > 确定性回退
 */
export function resolveAgentVoice(
  agent: AgentConfig,
  agentIndex: number,
  enabledProviders: TTSProvider[],
  overrides?: AgentVoiceOverrides
): ResolvedVoice | null {
  if (enabledProviders.length === 0) return null;

  // 1. 检查覆盖
  if (overrides?.[agent.id]) {
    const override = overrides[agent.id];
    const provider = enabledProviders.find((p) => p.id === override.providerId);
    if (provider) {
      const voice = provider.voices.find((v) => v.voiceId === override.voiceId);
      if (voice) {
        return {
          providerId: override.providerId,
          modelId: override.modelId,
          voiceId: override.voiceId,
        };
      }
    }
  }

  // 2. 检查 Agent 自身配置
  if (agent.voiceConfig) {
    const provider = enabledProviders.find((p) => p.id === agent.voiceConfig!.providerId);
    if (provider) {
      const voice = provider.voices.find((v) => v.voiceId === agent.voiceConfig!.voiceId);
      if (voice) {
        return {
          providerId: agent.voiceConfig.providerId,
          modelId: agent.voiceConfig.modelId,
          voiceId: agent.voiceConfig.voiceId,
        };
      }
    }
  }

  // 3. 确定性回退
  const provider = enabledProviders[0];
  if (provider.voices.length > 0) {
    const voiceIndex = agentIndex % provider.voices.length;
    return {
      providerId: provider.id,
      voiceId: provider.voices[voiceIndex].voiceId,
    };
  }

  return null;
}

/**
 * 选择叙述者 Agent (教师)。
 */
export function pickNarratorAgent(agents: AgentConfig[]): AgentConfig | null {
  // 优先选择有 voiceDesign 的教师
  const teacherWithVoice = agents.find(
    (a) => a.role === 'teacher' && a.voiceDesign
  );
  if (teacherWithVoice) return teacherWithVoice;

  // 回退到任意教师
  const teacher = agents.find((a) => a.role === 'teacher');
  if (teacher) return teacher;

  // 回退到最高优先级
  return agents.sort((a, b) => b.priority - a.priority)[0] || null;
}

/**
 * 获取 Agent 的有效 VoiceDesign。
 */
export function effectiveVoiceDesign(agent: AgentConfig): VoiceDesign {
  if (agent.voiceDesign) {
    return normalizeVoiceDesign(agent.voiceDesign);
  }
  return voiceDesignFromPersona(agent.persona);
}

/**
 * 获取可用的 TTS 提供商列表。
 */
export function getEnabledProviders(): TTSProvider[] {
  // 在移动端，简化为只返回不需要密钥的提供商
  return TTS_PROVIDERS.filter((p) => !p.requiresKey);
}

/**
 * 解析 Agent 的 TTS 选项。
 */
export function resolveAgentVoiceOptions(
  agent: AgentConfig,
  agentIndex: number,
  overrides?: AgentVoiceOverrides
): {
  providerId: string;
  voiceId: string;
  text: string;
} | null {
  const enabledProviders = getEnabledProviders();
  const resolved = resolveAgentVoice(agent, agentIndex, enabledProviders, overrides);

  if (!resolved) return null;

  const design = effectiveVoiceDesign(agent);
  const text = buildVoiceDesignPrompt(design);

  return {
    providerId: resolved.providerId,
    voiceId: resolved.voiceId,
    text,
  };
}

/**
 * 构建 VoiceDesign 提示词。
 */
function buildVoiceDesignPrompt(design: { identity: string; texture: string; delivery: string }): string {
  return [design.identity, design.texture, design.delivery]
    .filter(Boolean)
    .join(', ');
}
