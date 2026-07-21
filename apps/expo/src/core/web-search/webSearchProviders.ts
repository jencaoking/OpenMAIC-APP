/**
 * Web Search Provider Implementations for Mobile.
 *
 * Port of Web's lib/web-search/*.ts files.
 * Uses fetch directly (no proxyFetch dependency).
 *
 * Supported Providers:
 * - Tavily
 * - Bocha
 * - Brave
 * - Baidu
 * - MiniMax
 * - Doubao
 * - SearXNG
 */

import type {
  WebSearchProviderId,
  WebSearchResult,
  WebSearchSource,
  BaiduSubSources,
} from './webSearchTypes';
import { WEB_SEARCH_PROVIDERS } from './webSearchTypes';

/**
 * Search the web using the specified provider.
 */
export async function searchWeb(params: {
  providerId: WebSearchProviderId;
  query: string;
  apiKey?: string;
  maxResults?: number;
  baseUrl?: string;
  baiduSubSources?: BaiduSubSources;
}): Promise<WebSearchResult> {
  const { providerId, query, apiKey = '', maxResults, baseUrl, baiduSubSources } = params;

  switch (providerId) {
    case 'tavily':
      return await searchWithTavily({ query, apiKey, maxResults, baseUrl });
    case 'bocha':
      return await searchWithBocha({ query, apiKey, maxResults, baseUrl });
    case 'brave':
      return await searchWithBrave({ query, apiKey: apiKey || undefined, maxResults, baseUrl });
    case 'baidu':
      return await searchWithBaidu({ query, apiKey, maxResults, baseUrl, subSources: baiduSubSources });
    case 'doubao':
      return await searchWithDoubao({ query, apiKey, maxResults, baseUrl });
    case 'minimax':
      return await searchWithMiniMax({ query, apiKey, maxResults, baseUrl });
    case 'searxng':
      return await searchWithSearxng({ query, maxResults, baseUrl });
    default:
      throw new Error(`Unsupported web search provider: ${providerId}`);
  }
}

// ==================== Tavily ====================

async function searchWithTavily(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl } = params;
  const trimmedQuery = query.slice(0, 400);
  const url = `${(baseUrl || WEB_SEARCH_PROVIDERS.tavily.defaultBaseUrl || '').replace(/\/$/, '')}/search`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: trimmedQuery,
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: 'basic',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Tavily API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const sources: WebSearchSource[] = (data.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }));

  return {
    answer: data.answer || '',
    sources,
    query: data.query,
    responseTime: data.response_time,
  };
}

// ==================== Bocha ====================

async function searchWithBocha(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl } = params;
  const url = `${(baseUrl || WEB_SEARCH_PROVIDERS.bocha.defaultBaseUrl || '').replace(/\/$/, '')}/v1/web-search`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      count: maxResults,
      summary: true,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Bocha API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const webPages = data.data?.webPages?.value || [];
  const sources: WebSearchSource[] = webPages.map((r: any) => ({
    title: r.name || '',
    url: r.url || '',
    content: r.snippet || '',
    score: 1,
  }));

  return {
    answer: data.data?.webPages?.value?.[0]?.snippet || '',
    sources,
    query,
    responseTime: 0,
  };
}

// ==================== Brave ====================

async function searchWithBrave(params: {
  query: string;
  apiKey?: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl } = params;
  const url = `${(baseUrl || WEB_SEARCH_PROVIDERS.brave.defaultBaseUrl || '').replace(/\/$/, '')}/res/v1/web/search`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip',
  };
  if (apiKey) {
    headers['X-Subscription-Token'] = apiKey;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Brave API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const results = data.web?.results || [];
  const sources: WebSearchSource[] = results.slice(0, maxResults).map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    content: r.description || '',
    score: 1,
  }));

  return {
    answer: results[0]?.description || '',
    sources,
    query,
    responseTime: 0,
  };
}

// ==================== Baidu ====================

async function searchWithBaidu(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
  baseUrl?: string;
  subSources?: BaiduSubSources;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl, subSources } = params;
  const url = `${(baseUrl || WEB_SEARCH_PROVIDERS.baidu.defaultBaseUrl || '').replace(/\/$/, '')}/v2/ai_search/web_search`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      search_options: {
        enable_web_search: subSources?.webSearch !== false,
        enable_baike: subSources?.baike === true,
        enable_scholar: subSources?.scholar === true,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Baidu API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const results = data.result?.search_results || [];
  const sources: WebSearchSource[] = results.slice(0, maxResults).map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    content: r.content || r.abstract || '',
    score: r.score || 1,
  }));

  return {
    answer: data.result?.answer || '',
    sources,
    query,
    responseTime: data.result?.search_time || 0,
  };
}

// ==================== Doubao ====================

async function searchWithDoubao(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl } = params;
  const url = `${(baseUrl || WEB_SEARCH_PROVIDERS.doubao.defaultBaseUrl || '').replace(/\/$/, '')}/search_api/web_search`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      count: maxResults,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Doubao API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const results = data.data?.search_results || [];
  const sources: WebSearchSource[] = results.map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    content: r.content || r.snippet || '',
    score: r.score || 1,
  }));

  return {
    answer: data.data?.answer || '',
    sources,
    query,
    responseTime: 0,
  };
}

// ==================== MiniMax ====================

async function searchWithMiniMax(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5, baseUrl } = params;
  const url = `${(baseUrl || WEB_SEARCH_PROVIDERS.minimax.defaultBaseUrl || '').replace(/\/$/, '')}/v1/coding_plan/search`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: maxResults,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`MiniMax API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const results = data.data?.results || [];
  const sources: WebSearchSource[] = results.map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    content: r.content || r.snippet || '',
    score: r.score || 1,
  }));

  return {
    answer: data.data?.answer || '',
    sources,
    query,
    responseTime: 0,
  };
}

// ==================== SearXNG ====================

async function searchWithSearxng(params: {
  query: string;
  maxResults?: number;
  baseUrl?: string;
}): Promise<WebSearchResult> {
  const { query, maxResults = 5, baseUrl } = params;

  if (!baseUrl) {
    throw new Error('SearXNG requires a base URL');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/search`;
  const params_ = new URLSearchParams({
    q: query,
    format: 'json',
    pageno: '1',
  });

  const res = await fetch(`${url}?${params_.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`SearXNG API error (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  const results = data.results || [];
  const sources: WebSearchSource[] = results.slice(0, maxResults).map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    content: r.content || '',
    score: r.score || 1,
  }));

  return {
    answer: sources[0]?.content || '',
    sources,
    query,
    responseTime: data.search_time || 0,
  };
}
