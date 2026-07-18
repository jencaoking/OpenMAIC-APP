import type { RuntimeSession, RuntimeSessionCreate, RuntimeSessionUpdate, RuntimeRecord, RuntimeRecordCreate, ChatSession, ChatSessionCreate, ChatSessionUpdate, ChatMessage } from '@openmaic/storage-types';

export type ApiResponseType =
  | RuntimeSession
  | RuntimeSession[]
  | RuntimeSessionCreate
  | RuntimeSessionUpdate
  | RuntimeRecord
  | RuntimeRecord[]
  | RuntimeRecordCreate
  | ChatSession
  | ChatSession[]
  | ChatSessionCreate
  | ChatSessionUpdate
  | ChatMessage
  | ChatMessage[];

export type ApiPayloadType =
  | RuntimeSessionCreate
  | RuntimeSessionUpdate
  | RuntimeRecordCreate
  | ChatSessionCreate
  | ChatSessionUpdate;

export class ApiError extends Error {
  readonly status: number;
  readonly response: Response | null;

  constructor(message: string, status: number, response: Response | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

const DEFAULT_TIMEOUT = 15000;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout: number = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (typeof error === 'object' && error !== null && (error as Error).name === 'AbortError') {
      throw new ApiError('Request timed out', 0);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse<T extends ApiResponseType>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const body = await response.json();
      if (body.message) {
        errorMessage = body.message;
      }
    } catch {
      errorMessage = await response.text().catch(() => errorMessage);
    }
    throw new ApiError(errorMessage, response.status, response);
  }

  try {
    const data = await response.json();
    return data as T;
  } catch {
    throw new ApiError('Failed to parse response', response.status, response);
  }
}

export async function apiGet<T extends ApiResponseType>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<T>(response);
}

export async function apiPost<T extends ApiResponseType, P extends ApiPayloadType>(endpoint: string, payload: P): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}