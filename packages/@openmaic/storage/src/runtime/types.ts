import type {
  RuntimePayload,
  RuntimeRecord,
  RuntimeRecordInit,
  RuntimeSession,
  RuntimeSessionStatus,
  RuntimeSessionInit,
} from '@openmaic/storage-types';

export type {
  RuntimePayload,
  RuntimeRecord,
  RuntimeRecordInit,
  RuntimeSession,
  RuntimeSessionStatus,
};

export { RuntimeSessionInit };

export type RuntimePayloadValidator = (
  payload: unknown,
) => { valid: true } | { valid: false; errors: { path: string; message: string }[] };

export interface RuntimeStore {
  createSession(init: RuntimeSessionInit): Promise<RuntimeSession>;
  getSession(sessionId: string): Promise<RuntimeSession | undefined>;
  listSessions(stageId: string, learnerKey: string): Promise<RuntimeSession[]>;
  setSessionStatus(
    sessionId: string,
    status: RuntimeSessionStatus,
    updatedAt: string,
  ): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  appendRecord<TPayload extends RuntimePayload>(
    init: RuntimeRecordInit<TPayload>,
  ): Promise<RuntimeRecord<TPayload>>;
  listRecords(sessionId: string, opts?: { sceneId?: string }): Promise<RuntimeRecord[]>;
  mergeLearner(fromLearnerKey: string, toLearnerKey: string): Promise<number>;
  deleteLearnerRuntime(stageId: string, learnerKey: string): Promise<void>;
  deleteStageRuntime(stageId: string): Promise<void>;
  deleteAllRuntime(): Promise<void>;
}
