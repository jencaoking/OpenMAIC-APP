/**
 * Voice Registration Interface for Mobile.
 *
 * Port of Web's lib/audio/voice-registration.ts.
 * Provider-neutral voice registration seam.
 */

import type { VoiceDesign } from './voiceDesign';

/**
 * Resolved backend connection for a registration call.
 */
export interface VoiceRegistrationConfig {
  baseUrl: string;
  apiKey?: string;
  model?: string;
}

/**
 * Voice registration adapter interface.
 * Each provider implements this to support register-once/reference-by-id.
 */
export interface VoiceRegistrationAdapter {
  /** Whether registration is available for this provider. */
  supportsRegistration(options?: Record<string, unknown>): boolean;
  /** Whether voiceId is already registered on the backend. */
  voiceExists(cfg: VoiceRegistrationConfig, voiceId: string): Promise<boolean>;
  /** Register (or idempotently re-register) a reference clip under voiceId. */
  registerVoice(
    cfg: VoiceRegistrationConfig,
    params: { voiceId: string; referenceAudioBase64: string; mimeType?: string },
  ): Promise<string>;
  /** Synthesize the voice design once into a reference clip. */
  bootstrapReferenceClip(
    cfg: VoiceRegistrationConfig,
    params: { design: VoiceDesign; language?: string },
  ): Promise<{ referenceAudioBase64: string; mimeType: string }>;
}

/** Provider adapter registry */
const VOICE_REGISTRATION_ADAPTERS: Record<string, VoiceRegistrationAdapter> = {};

/**
 * Register a voice registration adapter for a provider.
 */
export function registerVoiceRegistrationAdapter(
  providerId: string,
  adapter: VoiceRegistrationAdapter,
): void {
  VOICE_REGISTRATION_ADAPTERS[providerId] = adapter;
}

/**
 * Get the voice registration adapter for a provider.
 */
export function getVoiceRegistrationAdapter(
  providerId: string,
): VoiceRegistrationAdapter | undefined {
  return VOICE_REGISTRATION_ADAPTERS[providerId];
}

/**
 * Whether this provider supports register-once/reference-by-id.
 */
export function supportsVoiceRegistration(
  providerId: string,
  options?: Record<string, unknown>,
): boolean {
  return getVoiceRegistrationAdapter(providerId)?.supportsRegistration(options) ?? false;
}
