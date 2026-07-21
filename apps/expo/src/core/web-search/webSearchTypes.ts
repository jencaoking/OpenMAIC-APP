/**
 * Web Search Types for Mobile.
 *
 * Port of Web's lib/web-search/types.ts + lib/types/web-search.ts.
 */

// ============================================================================
// Result Types
// ============================================================================

export interface WebSearchSource {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface WebSearchResult {
  answer: string;
  sources: WebSearchSource[];
  query: string;
  responseTime: number;
}

// ============================================================================
// Provider Types
// ============================================================================

export type WebSearchProviderId =
  | 'tavily'
  | 'bocha'
  | 'brave'
  | 'baidu'
  | 'minimax'
  | 'doubao'
  | 'searxng';

export interface BaiduSubSources {
  webSearch: boolean;
  baike: boolean;
  scholar: boolean;
}

export interface WebSearchProviderConfig {
  id: WebSearchProviderId;
  name: string;
  requiresApiKey: boolean;
  requiresBaseUrl?: boolean;
  defaultBaseUrl?: string;
  endpointPath: string;
  icon?: string;
}

// ============================================================================
// Provider Registry
// ============================================================================

export const WEB_SEARCH_PROVIDERS: Record<WebSearchProviderId, WebSearchProviderConfig> = {
  tavily: {
    id: 'tavily',
    name: 'Tavily',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.tavily.com',
    endpointPath: '/search',
  },
  bocha: {
    id: 'bocha',
    name: 'Bocha',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.bocha.cn',
    endpointPath: '/v1/web-search',
  },
  brave: {
    id: 'brave',
    name: 'Brave Search',
    requiresApiKey: false,
    defaultBaseUrl: 'https://search.brave.com',
    endpointPath: '/search',
  },
  baidu: {
    id: 'baidu',
    name: 'Baidu',
    requiresApiKey: true,
    defaultBaseUrl: 'https://qianfan.baidubce.com',
    endpointPath: '/v2/ai_search/web_search',
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.minimaxi.com',
    endpointPath: '/v1/coding_plan/search',
  },
  doubao: {
    id: 'doubao',
    name: 'Doubao',
    requiresApiKey: true,
    defaultBaseUrl: 'https://open.feedcoopapi.com',
    endpointPath: '/search_api/web_search',
  },
  searxng: {
    id: 'searxng',
    name: 'SearXNG',
    requiresApiKey: false,
    requiresBaseUrl: true,
    endpointPath: '/search',
  },
};

export function getAllWebSearchProviders(): WebSearchProviderConfig[] {
  return Object.values(WEB_SEARCH_PROVIDERS);
}

export function getWebSearchProvider(id: WebSearchProviderId): WebSearchProviderConfig | undefined {
  return WEB_SEARCH_PROVIDERS[id];
}
