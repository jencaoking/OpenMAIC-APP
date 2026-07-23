/**
 * Voice Design Types and Utilities for Mobile.
 *
 * Port of Web's lib/audio/voice-design.ts.
 * Provider-neutral per-agent voice design.
 */

/**
 * A VoiceDesign describes an agent's vocal identity as a 3-layer recipe.
 * Consumed by any TTS provider.
 */
export interface VoiceDesign {
  identity: string; // gender / age / role
  texture: string; // pitch / vocal quality
  delivery: string; // emotion / pace
}

const VOICE_DESIGN_PROMPT_MAX_CHARS = 200;

/** Prefix for deterministic auto-voice ids */
export const AUTO_VOICE_ID_PREFIX = 'auto-' as const;

/**
 * Sanitize a voice design part value.
 */
function sanitizeVoiceDesignPart(value?: string): string {
  return (value || '')
    .replace(/[\p{C}]+/gu, ' ')
    .replace(/[()（）]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, VOICE_DESIGN_PROMPT_MAX_CHARS)
    .trim();
}

/**
 * Compose the 3 layers into one comma-joined prompt, dropping blank layers.
 */
export function buildVoiceDesignPrompt(design: VoiceDesign): string {
  return [design.identity, design.texture, design.delivery]
    .map((part) => sanitizeVoiceDesignPart(part))
    .filter(Boolean)
    .join(', ');
}

/**
 * Coerce an arbitrary (LLM-produced) value into a VoiceDesign, or undefined.
 */
export function normalizeVoiceDesign(raw: unknown): VoiceDesign | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const record = raw as Record<string, unknown>;
  const pick = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
  const design = {
    identity: pick(record.identity),
    texture: pick(record.texture),
    delivery: pick(record.delivery),
  };
  if (!design.identity && !design.texture && !design.delivery) return undefined;
  return design;
}

/**
 * Deterministic voice id derived from the descriptor.
 * Stable across re-synthesis, namespaced by provider.
 */
export async function getDeterministicVoiceId(
  design: VoiceDesign,
  opts: { providerId?: string; model?: string } = {},
): Promise<string> {
  const seed = [
    opts.providerId || '',
    design.identity,
    design.texture,
    design.delivery,
    opts.model || '',
  ].join('|');

  // Use a simple hash for React Native (no crypto.subtle)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');

  const providerPart = opts.providerId ? `-${opts.providerId}` : '';
  return `${AUTO_VOICE_ID_PREFIX}${hex}${providerPart}`;
}
