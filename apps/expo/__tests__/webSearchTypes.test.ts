import {
  WEB_SEARCH_PROVIDERS,
  getAllWebSearchProviders,
  getWebSearchProvider,
} from '../src/core/web-search/webSearchTypes';

describe('webSearchTypes', () => {
  describe('WEB_SEARCH_PROVIDERS', () => {
    it('should have 7 web search providers', () => {
      expect(Object.keys(WEB_SEARCH_PROVIDERS)).toHaveLength(7);
    });

    it('should include tavily', () => {
      expect(WEB_SEARCH_PROVIDERS.tavily).toBeTruthy();
      expect(WEB_SEARCH_PROVIDERS.tavily.name).toBe('Tavily');
    });
  });

  describe('getAllWebSearchProviders', () => {
    it('should return array of providers', () => {
      const providers = getAllWebSearchProviders();
      expect(providers).toHaveLength(7);
    });
  });

  describe('getWebSearchProvider', () => {
    it('should get provider by id', () => {
      const provider = getWebSearchProvider('tavily');
      expect(provider).toBeTruthy();
    });

    it('should return undefined for unknown', () => {
      expect(getWebSearchProvider('unknown' as any)).toBeUndefined();
    });
  });
});
