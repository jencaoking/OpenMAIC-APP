/**
 * TTS Provider Implementations for Mobile.
 *
 * Port of Web's lib/audio/tts-providers.ts.
 * Uses fetch() directly for each provider.
 */

import type { TTSModelConfig, TTSGenerationResult, TTSProviderId } from './ttsTypes';
import { TTS_PROVIDERS } from './ttsTypes';

/**
 * Generate TTS audio using specified provider.
 */
export async function generateTTS(
  config: TTSModelConfig,
  text: string,
): Promise<TTSGenerationResult> {
  switch (config.providerId) {
    case 'openai-tts':
      return await generateOpenAITTS(config, text);
    case 'azure-tts':
      return await generateAzureTTS(config, text);
    case 'glm-tts':
      return await generateGLMTTS(config, text);
    case 'qwen-tts':
      return await generateQwenTTS(config, text);
    case 'minimax-tts':
      return await generateMiniMaxTTS(config, text);
    case 'doubao-tts':
      return await generateDoubaoTTS(config, text);
    case 'elevenlabs-tts':
      return await generateElevenLabsTTS(config, text);
    default:
      throw new Error(`Unsupported TTS provider: ${config.providerId}`);
  }
}

/**
 * OpenAI TTS implementation
 */
async function generateOpenAITTS(
  config: TTSModelConfig,
  text: string,
): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['openai-tts'].defaultBaseUrl;

  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.modelId || 'tts-1',
      input: text,
      voice: config.voice || 'alloy',
      response_format: config.format || 'mp3',
      speed: config.speed || 1.0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`OpenAI TTS error: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    audio: new Uint8Array(arrayBuffer),
    format: config.format || 'mp3',
  };
}

/**
 * Azure TTS implementation
 */
async function generateAzureTTS(
  config: TTSModelConfig,
  text: string,
): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['azure-tts'].defaultBaseUrl;

  const response = await fetch(`${baseUrl}/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': config.apiKey!,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    },
    body: `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
      <voice name='${config.voice || 'en-US-AriaNeural'}'>${text}</voice>
    </speak>`,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Azure TTS error: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return { audio: new Uint8Array(arrayBuffer), format: 'mp3' };
}

/**
 * GLM TTS implementation
 */
async function generateGLMTTS(config: TTSModelConfig, text: string): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['glm-tts'].defaultBaseUrl;

  const response = await fetch(`${baseUrl}/services/aigc/multimodal-generation/generation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.modelId || 'glm-tts',
      input: { messages: [{ role: 'user', content: text }] },
      parameters: { asr_options: { voice: config.voice || 'default' } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`GLM TTS error: ${errorText}`);
  }

  const data = await response.json();
  // GLM returns audio URL or base64
  if (data.output?.audio) {
    const audioData = atob(data.output.audio);
    const bytes = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) bytes[i] = audioData.charCodeAt(i);
    return { audio: bytes, format: 'mp3' };
  }
  throw new Error('No audio in GLM response');
}

/**
 * Qwen TTS implementation
 */
async function generateQwenTTS(config: TTSModelConfig, text: string): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['qwen-tts'].defaultBaseUrl;

  const response = await fetch(`${baseUrl}/services/aigc/multimodal-generation/generation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.modelId || 'qwen-tts',
      input: { messages: [{ role: 'user', content: text }] },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Qwen TTS error: ${errorText}`);
  }

  const data = await response.json();
  if (data.output?.audio) {
    const audioData = atob(data.output.audio);
    const bytes = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) bytes[i] = audioData.charCodeAt(i);
    return { audio: bytes, format: 'mp3' };
  }
  throw new Error('No audio in Qwen response');
}

/**
 * MiniMax TTS implementation
 */
async function generateMiniMaxTTS(
  config: TTSModelConfig,
  text: string,
): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['minimax-tts'].defaultBaseUrl;

  const response = await fetch(`${baseUrl}/v1/t2a_v2`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.modelId || 'speech-01',
      text,
      voice_setting: { voice_id: config.voice || 'male-qn-qingse' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`MiniMax TTS error: ${errorText}`);
  }

  const data = await response.json();
  if (data.data?.audio) {
    const audioData = atob(data.data.audio);
    const bytes = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) bytes[i] = audioData.charCodeAt(i);
    return { audio: bytes, format: 'mp3' };
  }
  throw new Error('No audio in MiniMax response');
}

/**
 * Doubao TTS implementation
 */
async function generateDoubaoTTS(
  config: TTSModelConfig,
  text: string,
): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['doubao-tts'].defaultBaseUrl;

  const response = await fetch(`${baseUrl}/tts/v1`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.modelId || 'doubao-tts',
      input: { text },
      voice: config.voice || 'default',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Doubao TTS error: ${errorText}`);
  }

  const data = await response.json();
  if (data.audio) {
    const audioData = atob(data.audio);
    const bytes = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) bytes[i] = audioData.charCodeAt(i);
    return { audio: bytes, format: 'mp3' };
  }
  throw new Error('No audio in Doubao response');
}

/**
 * ElevenLabs TTS implementation
 */
async function generateElevenLabsTTS(
  config: TTSModelConfig,
  text: string,
): Promise<TTSGenerationResult> {
  const baseUrl = config.baseUrl || TTS_PROVIDERS['elevenlabs-tts'].defaultBaseUrl;

  const response = await fetch(
    `${baseUrl}/text-to-speech/${config.voice || '21m00Tcm4TlvDq8ikWAM'}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': config.apiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId || 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`ElevenLabs TTS error: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return { audio: new Uint8Array(arrayBuffer), format: 'mp3' };
}
