/**
 * Web Search Module for Mobile.
 *
 * Provides multi-provider web search support.
 * Port of Web's lib/web-search/ system.
 */

// Types
export type {
  WebSearchProviderId,
  WebSearchProviderConfig,
  WebSearchResult,
  WebSearchSource,
  BaiduSubSources,
} from './webSearchTypes';

export {
  WEB_SEARCH_PROVIDERS,
  getAllWebSearchProviders,
  getWebSearchProvider,
} from './webSearchTypes';

// Provider implementations
export { searchWeb } from './webSearchProviders';
