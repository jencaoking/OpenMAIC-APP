/**
 * Runtime session status lifecycle.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type RuntimeSessionStatus = 'active' | 'completed' | 'archived';

/**
 * ISO 8601 timestamp string format for runtime operations.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type ISO8601 = string;

/**
 * Base interface for versioned runtime entities.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface RuntimeVersioned {
  runtimeDslVersion?: string;
}

/**
 * A runtime session representing a learner's interaction lifecycle.
 * Partitioned by (stageId, learnerKey).
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface RuntimeSession extends RuntimeVersioned {
  id: string;
  runtimeDslVersion: string;
  kind: string;
  stageId: string;
  learnerKey: string;
  status: RuntimeSessionStatus;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

/**
 * Payload for creating a new runtime session.
 * Omits server-generated fields (id, runtimeDslVersion, createdAt, updatedAt).
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type RuntimeSessionCreate = Omit<RuntimeSession, 'id' | 'runtimeDslVersion' | 'createdAt' | 'updatedAt'>;

/**
 * Payload for updating a runtime session.
 * Only allows updating status and updatedAt fields.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type RuntimeSessionUpdate = {
  id: string;
  status?: RuntimeSessionStatus;
  updatedAt: ISO8601;
};