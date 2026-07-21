import {
  IMAGE_PROVIDERS,
  VIDEO_PROVIDERS,
  getAllImageProviders,
  getAllVideoProviders,
} from '../src/core/media/mediaTypes';

describe('mediaTypes', () => {
  describe('IMAGE_PROVIDERS', () => {
    it('should have 8 image providers', () => {
      expect(Object.keys(IMAGE_PROVIDERS)).toHaveLength(8);
    });

    it('should include seedream', () => {
      expect(IMAGE_PROVIDERS.seedream).toBeTruthy();
      expect(IMAGE_PROVIDERS.seedream.name).toBe('Seedream');
    });

    it('should include openai-image', () => {
      expect(IMAGE_PROVIDERS['openai-image']).toBeTruthy();
    });
  });

  describe('VIDEO_PROVIDERS', () => {
    it('should have 7 video providers', () => {
      expect(Object.keys(VIDEO_PROVIDERS)).toHaveLength(7);
    });

    it('should include seedance', () => {
      expect(VIDEO_PROVIDERS.seedance).toBeTruthy();
      expect(VIDEO_PROVIDERS.seedance.name).toBe('Seedance');
    });
  });

  describe('getAllImageProviders', () => {
    it('should return array of providers', () => {
      const providers = getAllImageProviders();
      expect(providers).toHaveLength(8);
    });
  });

  describe('getAllVideoProviders', () => {
    it('should return array of providers', () => {
      const providers = getAllVideoProviders();
      expect(providers).toHaveLength(7);
    });
  });
});
