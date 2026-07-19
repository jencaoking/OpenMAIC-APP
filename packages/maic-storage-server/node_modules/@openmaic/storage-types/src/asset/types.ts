/**
 * A stable, backend-agnostic handle to a stored asset.
 * A plain string so it embeds cleanly in DSL documents.
 * Opaque to consumers: only the issuing StorageProvider interprets it.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type AssetRef = string;

/**
 * Optional metadata recorded alongside an asset.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface AssetMeta {
  contentType?: string;
  [key: string]: unknown;
}
