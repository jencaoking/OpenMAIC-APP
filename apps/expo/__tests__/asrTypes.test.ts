import {
  ASR_PROVIDERS,
  getAllASRProviders,
  getASRProvider,
  getASRSupportedLanguages,
  isCustomASRProvider,
} from '../src/core/voice/asrTypes';

describe('asrTypes', () => {
  describe('ASR_PROVIDERS', () => {
    it('should have 5 ASR providers', () => {
      expect(Object.keys(ASR_PROVIDERS)).toHaveLength(5);
    });

    it('should include openai-whisper', () => {
      expect(ASR_PROVIDERS['openai-whisper']).toBeTruthy();
      expect(ASR_PROVIDERS['openai-whisper'].name).toBe('OpenAI Whisper');
    });
  });

  describe('getAllASRProviders', () => {
    it('should return array of providers', () => {
      const providers = getAllASRProviders();
      expect(providers).toHaveLength(5);
    });
  });

  describe('getASRProvider', () => {
    it('should get provider by id', () => {
      const provider = getASRProvider('openai-whisper');
      expect(provider).toBeTruthy();
    });

    it('should return undefined for unknown', () => {
      expect(getASRProvider('unknown' as any)).toBeUndefined();
    });
  });

  describe('getASRSupportedLanguages', () => {
    it('should return languages', () => {
      const langs = getASRSupportedLanguages('openai-whisper');
      expect(langs.length).toBeGreaterThan(0);
    });
  });

  describe('isCustomASRProvider', () => {
    it('should detect custom providers', () => {
      expect(isCustomASRProvider('custom-asr-test')).toBe(true);
      expect(isCustomASRProvider('openai-whisper')).toBe(false);
    });
  });
});
