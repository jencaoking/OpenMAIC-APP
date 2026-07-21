/**
 * ASR (Automatic Speech Recognition) module for Mobile.
 *
 * Provides multi-provider ASR support:
 * - OpenAI Whisper
 * - Qwen ASR (DashScope)
 * - Azure Speech
 * - Lemonade ASR
 */

export type {
  ASRProviderId,
  ASRProviderConfig,
  ASRModelConfig,
  ASRTranscriptionResult,
} from './asrTypes';

export {
  ASR_PROVIDERS,
  getAllASRProviders,
  getASRProvider,
  getASRSupportedLanguages,
  isCustomASRProvider,
} from './asrTypes';

export { transcribeAudio } from './asrProviders';
