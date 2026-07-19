import type { ISO8601 } from './session.js';
/**
 * The set of values a RuntimeRecord.payload may hold.
 * Any non-null value is allowed, but payload must be JSON-serializable.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type RuntimePayload = NonNullable<unknown> | null;
/**
 * One ordered fact inside a runtime session.
 * Records are append-only and ordered by seq.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface RuntimeRecord<TPayload extends RuntimePayload = RuntimePayload> {
    id: string;
    sessionId: string;
    seq: number;
    sceneId?: string;
    actionIndex?: number;
    subAnchor?: string;
    createdAt: ISO8601;
    payload: TPayload;
}
/**
 * Payload for appending a new record to a session.
 * Omits server-generated field (seq).
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type RuntimeRecordInit<TPayload extends RuntimePayload = RuntimePayload> = Omit<RuntimeRecord<TPayload>, 'seq'>;
/**
 * Alias for RuntimeRecordInit for backward compatibility.
 * @deprecated Use RuntimeRecordInit instead.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export type RuntimeRecordCreate<TPayload extends RuntimePayload = RuntimePayload> = RuntimeRecordInit<TPayload>;
//# sourceMappingURL=record.d.ts.map