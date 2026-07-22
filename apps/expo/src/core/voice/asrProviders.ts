/**
 * ASR (Automatic Speech Recognition) Provider Implementations for Mobile.
 *
 * Port of Web's lib/audio/asr-providers.ts.
 * Uses fetch() directly (no @ai-sdk/openai dependency).
 *
 * Supported Providers:
 * - OpenAI Whisper
 * - Qwen ASR (DashScope)
 * - Azure Speech
 * - Lemonade ASR
 */

import type { ASRModelConfig, ASRTranscriptionResult } from './asrTypes';
import { ASR_PROVIDERS, isCustomASRProvider } from './asrTypes';

/**
 * Transcribe audio using specified ASR provider.
 * Audio data is passed as Uint8Array (recorded from expo-av).
 */
export async function transcribeAudio(
  config: ASRModelConfig,
  audioData: Uint8Array,
  mimeType: string = 'audio/webm',
): Promise<ASRTranscriptionResult> {
  const provider = ASR_PROVIDERS[config.providerId];

  // Validate API key if required
  if (provider?.requiresApiKey && !config.apiKey) {
    throw new Error(`API key required for ASR provider: ${config.providerId}`);
  }

  switch (config.providerId) {
    case 'openai-whisper':
      return await transcribeOpenAIWhisper(config, audioData, mimeType);

    case 'qwen-asr':
      return await transcribeQwenASR(config, audioData, mimeType);

    case 'azure-asr':
      return await transcribeAzureASR(config, audioData, mimeType);

    case 'lemonade-asr':
      return await transcribeLemonadeASR(config, audioData, mimeType);

    case 'browser-native':
      throw new Error('Browser Native ASR not supported on mobile. Use a cloud provider.');

    default:
      if (isCustomASRProvider(config.providerId)) {
        return await transcribeOpenAIWhisper(config, audioData, mimeType);
      }
      throw new Error(`Unsupported ASR provider: ${config.providerId}`);
  }
}

/**
 * OpenAI Whisper implementation
 */
async function transcribeOpenAIWhisper(
  config: ASRModelConfig,
  audioData: Uint8Array,
  mimeType: string,
): Promise<ASRTranscriptionResult> {
  const baseUrl = config.baseUrl || ASR_PROVIDERS['openai-whisper'].defaultBaseUrl;

  // Create FormData with audio file
  const formData = new FormData();
  const blob = new Blob([audioData.buffer as ArrayBuffer], { type: mimeType });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', config.modelId || 'gpt-4o-mini-transcribe');

  if (config.language && config.language !== 'auto') {
    formData.append('language', config.language);
  }

  const response = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    if (errorText.includes('empty') || errorText.includes('too short')) {
      return { text: '' };
    }
    throw new Error(`OpenAI Whisper API error: ${errorText}`);
  }

  const data = await response.json();
  return { text: data.text || '' };
}

/**
 * Qwen ASR implementation (DashScope API)
 */
async function transcribeQwenASR(
  config: ASRModelConfig,
  audioData: Uint8Array,
  mimeType: string,
): Promise<ASRTranscriptionResult> {
  const baseUrl = config.baseUrl || ASR_PROVIDERS['qwen-asr'].defaultBaseUrl;

  // Convert to base64
  const base64Audio = uint8ArrayToBase64(audioData);

  const requestBody: Record<string, unknown> = {
    model: config.modelId || 'qwen3-asr-flash',
    input: {
      messages: [
        {
          role: 'user',
          content: [
            {
              audio: `data:${mimeType};base64,${base64Audio}`,
            },
          ],
        },
      ],
    },
  };

  if (config.language && config.language !== 'auto') {
    requestBody.parameters = {
      asr_options: {
        language: config.language,
      },
    };
  }

  const response = await fetch(`${baseUrl}/services/aigc/multimodal-generation/generation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json; charset=utf-8',
      'X-DashScope-Audio-Format': 'wav',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    if (errorText.includes('audio is empty') || errorText.includes('InvalidParameter')) {
      return { text: '' };
    }
    throw new Error(`Qwen ASR API error: ${errorText}`);
  }

  const data = await response.json();

  if (
    !data.output?.choices ||
    !Array.isArray(data.output.choices) ||
    data.output.choices.length === 0
  ) {
    throw new Error(`Qwen ASR error: No choices in response`);
  }

  const firstChoice = data.output.choices[0];
  const messageContent = firstChoice?.message?.content;

  if (!Array.isArray(messageContent) || messageContent.length === 0) {
    return { text: '' };
  }

  return { text: messageContent[0]?.text || '' };
}

/**
 * Azure STT implementation (Fast Transcription REST API)
 */
async function transcribeAzureASR(
  config: ASRModelConfig,
  audioData: Uint8Array,
  mimeType: string,
): Promise<ASRTranscriptionResult> {
  let endpoint = (config.baseUrl || ASR_PROVIDERS['azure-asr'].defaultBaseUrl || '').replace(
    /\/+$/,
    '',
  );

  if (!endpoint || endpoint.includes('{region}')) {
    throw new Error('Azure STT base URL must include a real region');
  }

  if (/\.stt\.speech\.microsoft\.com$/i.test(endpoint)) {
    endpoint = endpoint.replace(/\.stt\.speech\.microsoft\.com$/i, '.api.cognitive.microsoft.com');
  }
  if (!/\/speechtotext\/transcriptions:transcribe/i.test(endpoint)) {
    endpoint = `${endpoint}/speechtotext/transcriptions:transcribe`;
  }

  const url = new URL(endpoint);
  if (!url.searchParams.get('api-version')) {
    url.searchParams.set('api-version', '2025-10-15');
  }

  const formData = new FormData();
  const blob = new Blob([audioData.buffer as ArrayBuffer], { type: mimeType });
  formData.append('audio', blob, 'recording.webm');

  const localeMap: Record<string, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
  };

  if (config.language && config.language !== 'auto') {
    const locale = localeMap[config.language] || config.language;
    formData.append('definition', JSON.stringify({ locales: [locale] }));
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': config.apiKey! },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Azure STT error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const combinedText = data.combinedPhrases
    ?.map((p: { text?: string }) => p.text || '')
    .filter(Boolean)
    .join(' ');
  const phraseText = data.phrases
    ?.map((p: { text?: string }) => p.text || '')
    .filter(Boolean)
    .join(' ');

  return { text: combinedText || phraseText || '' };
}

/**
 * Lemonade ASR implementation (OpenAI-compatible)
 */
async function transcribeLemonadeASR(
  config: ASRModelConfig,
  audioData: Uint8Array,
  mimeType: string,
): Promise<ASRTranscriptionResult> {
  const baseUrl = (config.baseUrl || ASR_PROVIDERS['lemonade-asr'].defaultBaseUrl || '').replace(
    /\/$/,
    '',
  );

  const formData = new FormData();
  const blob = new Blob([audioData.buffer as ArrayBuffer], { type: mimeType });
  formData.append('file', blob, 'audio.wav');
  formData.append('model', config.modelId || ASR_PROVIDERS['lemonade-asr'].defaultModelId);
  formData.append('response_format', 'json');

  if (config.language && config.language !== 'auto') {
    formData.append('language', config.language);
  }

  const headers: Record<string, string> = {};
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    if (errorText.includes('audio is empty') || errorText.includes('too short')) {
      return { text: '' };
    }
    throw new Error(`Lemonade ASR API error: ${errorText}`);
  }

  const data = await response.json();
  return { text: typeof data.text === 'string' ? data.text : '' };
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}
