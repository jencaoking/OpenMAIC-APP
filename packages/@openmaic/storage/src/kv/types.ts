import type { KVScope } from '@openmaic/storage-types';
import { DEFAULT_KV_SCOPE } from '@openmaic/storage-types';

export type { KVScope };
export { DEFAULT_KV_SCOPE };

export interface KVStore {
  get<T>(key: string, scope?: KVScope): Promise<T | null>;
  set<T>(key: string, value: T, scope?: KVScope): Promise<void>;
  remove(key: string, scope?: KVScope): Promise<void>;
  keys(prefix?: string, scope?: KVScope): Promise<string[]>;
}