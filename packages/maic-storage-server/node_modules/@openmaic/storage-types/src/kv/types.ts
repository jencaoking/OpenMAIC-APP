/**
 * KV storage scope.
 * - 'account': User/account data synced across devices
 * - 'device': Machine-local UI state that never leaves the device
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type KVScope = 'device' | 'account';

/**
 * Default scope used when caller omits one.
 * @remarks This is a pure type constant. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export const DEFAULT_KV_SCOPE: KVScope = 'account';