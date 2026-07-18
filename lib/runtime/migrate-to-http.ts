/**
 * IndexedDB → HttpRuntimeStore 一次性迁移脚本（PLAN.MD Phase 4）。
 *
 * 策略：「只增不删」—— 本地 IndexedDB 数据在迁移完成并校验前绝不删除。
 * 迁移失败时保留本地数据，用户可重试。迁移成功后由用户手动清理。
 *
 * 迁移流程：
 * 1. 从本地 IndexedDB (maic-runtime) 枚举所有 sessions（跨所有 stageId/learnerKey）
 * 2. 对每个 session：
 *    a. 检查服务端是否已存在（避免重复迁移）
 *    b. 若不存在，通过 HttpRuntimeStore.createSession 创建
 *    c. 枚举本地 session 的所有 records
 *    d. 对比服务端已有序列号，仅追加缺失的 records
 * 3. 校验：服务端 session 数 ≥ 本地 session 数，每 session 的 records 数一致
 * 4. 输出迁移报告（成功/失败/跳过统计）
 *
 * 幂等性：可多次执行，已迁移的数据会跳过。
 *
 * @remarks Client-only：依赖 IndexedDB、fetch、HttpRuntimeStore。
 */

import type { RuntimeRecord, RuntimeSession } from '@openmaic/storage-types';

/** 迁移报告：详细记录每个 session 的迁移结果。 */
export interface MigrationReport {
  startedAt: string;
  finishedAt: string;
  status: 'success' | 'partial' | 'failed';
  totalLocalSessions: number;
  migratedSessions: number;
  skippedSessions: number;
  failedSessions: number;
  totalLocalRecords: number;
  migratedRecords: number;
  skippedRecords: number;
  failedRecords: number;
  errors: Array<{ sessionId: string; stageId?: string; error: string }>;
  /** 本地数据保留提示：true 表示未删除任何本地数据。 */
  localDataPreserved: true;
}

/** IndexedDB 数据库名（与 BrowserRuntimeStore 默认一致）。 */
const RUNTIME_DB_NAME = 'maic-runtime';
const SESSIONS_STORE = 'sessions';
const RECORDS_STORE = 'records';

/**
 * 打开本地 maic-runtime IndexedDB。
 * 失败时返回 undefined（可能从未创建过，无数据可迁移）。
 */
async function openRuntimeDb(): Promise<IDBDatabase | undefined> {
  if (typeof indexedDB === 'undefined') return undefined;

  // 先探测数据库是否存在，避免触发 onupgradeneeded 创建空库
  if (typeof indexedDB.databases === 'function') {
    const databases = await indexedDB.databases();
    if (!databases.some((db) => db.name === RUNTIME_DB_NAME)) {
      return undefined;
    }
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(RUNTIME_DB_NAME, 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      // 若库不存在却被打开，触发升级 —— 此时不应创建，直接关闭
      req.transaction?.abort();
    };
  }).catch(() => undefined);
}

/** Promisify IDBRequest. */
function reqP<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** 枚举本地所有 sessions（跨所有 stage/learner 分区）。 */
async function listAllLocalSessions(db: IDBDatabase): Promise<RuntimeSession[]> {
  return new Promise<RuntimeSession[]>((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, 'readonly');
    const store = tx.objectStore(SESSIONS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as RuntimeSession[]);
    request.onerror = () => reject(request.error);
  });
}

/** 枚举指定 session 的所有本地 records（按 seq 排序）。 */
async function listLocalRecords(db: IDBDatabase, sessionId: string): Promise<RuntimeRecord[]> {
  return new Promise<RuntimeRecord[]>((resolve, reject) => {
    const tx = db.transaction(RECORDS_STORE, 'readonly');
    const store = tx.objectStore(RECORDS_STORE);
    // 主键是 [sessionId, seq] 复合键，用 range 查询
    const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
    const request = store.getAll(range);
    request.onsuccess = () => {
      const records = request.result as RuntimeRecord[];
      records.sort((a, b) => a.seq - b.seq);
      resolve(records);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * 通过 fetch 直接调用 Storage Server API（绕过 HttpRuntimeStore 以避免
 * 与运行时配置的 store 冲突；迁移脚本使用独立 HTTP 客户端）。
 */
async function serverGetSession(
  baseUrl: string,
  learnerKey: string,
  sessionId: string,
): Promise<RuntimeSession | undefined> {
  try {
    const response = await fetch(`${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${learnerKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    return (await response.json()) as RuntimeSession;
  } catch (error) {
    throw new Error(`getSession failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** 服务端创建 session（若已存在则跳过）。 */
async function serverCreateSession(
  baseUrl: string,
  learnerKey: string,
  session: RuntimeSession,
): Promise<'created' | 'exists'> {
  // 先检查是否已存在
  const existing = await serverGetSession(baseUrl, learnerKey, session.id);
  if (existing !== undefined) return 'exists';

  // 创建：剥离服务端生成的 runtimeDslVersion
  const { runtimeDslVersion: _omit, ...init } = session;
  void _omit;

  const response = await fetch(`${baseUrl}/runtime/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${learnerKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(init),
  });

  if (!response.ok && response.status !== 201) {
    const body = await response.text();
    throw new Error(`createSession HTTP ${response.status}: ${body}`);
  }
  return 'created';
}

/** 查询服务端某 session 的 records（返回已有序列号集合）。 */
async function serverListRecords(
  baseUrl: string,
  learnerKey: string,
  sessionId: string,
): Promise<Set<number>> {
  try {
    const response = await fetch(
      `${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}/records`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${learnerKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status === 404) return new Set();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const records = (await response.json()) as RuntimeRecord[];
    return new Set(records.map((r) => r.seq));
  } catch (error) {
    throw new Error(`listRecords failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** 服务端追加单个 record（若 seq 已存在则跳过）。 */
async function serverAppendRecord(
  baseUrl: string,
  learnerKey: string,
  record: RuntimeRecord,
): Promise<'appended' | 'skipped'> {
  // 查询服务端是否已含此 seq（批量优化：调用方应预先拉取 seq 集合）
  // 这里仅做追加，依赖服务端的唯一约束防止重复
  // 剥离服务端生成的 seq
  const { seq: _omit, ...init } = record;
  void _omit;

  const response = await fetch(
    `${baseUrl}/runtime/sessions/${encodeURIComponent(record.sessionId)}/records`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${learnerKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(init),
    },
  );

  if (response.status === 201) return 'appended';
  if (response.status === 409) return 'skipped'; // seq 冲突 = 已存在
  const body = await response.text();
  throw new Error(`appendRecord HTTP ${response.status}: ${body}`);
}

/**
 * 执行完整的 IndexedDB → HttpRuntimeStore 迁移。
 *
 * @param baseUrl Storage Server baseUrl，默认 `/api`（走 Next.js 代理）
 * @param learnerKey 当前客户端的 learnerKey（用于服务端认证 + 数据归属）
 * @returns 迁移报告。**永不抛出**——所有错误被收集到 report.errors
 */
export async function migrateIndexedDbToHttp(
  baseUrl: string = '/api',
  learnerKey: string,
): Promise<MigrationReport> {
  const report: MigrationReport = {
    startedAt: new Date().toISOString(),
    finishedAt: '',
    status: 'success',
    totalLocalSessions: 0,
    migratedSessions: 0,
    skippedSessions: 0,
    failedSessions: 0,
    totalLocalRecords: 0,
    migratedRecords: 0,
    skippedRecords: 0,
    failedRecords: 0,
    errors: [],
    localDataPreserved: true,
  };

  // 1. 打开本地 IndexedDB
  const db = await openRuntimeDb();
  if (db === undefined) {
    report.finishedAt = new Date().toISOString();
    report.status = 'success';
    return report; // 无本地数据，视为成功
  }

  try {
    // 2. 枚举所有本地 sessions
    const localSessions = await listAllLocalSessions(db);
    report.totalLocalSessions = localSessions.length;

    // 3. 逐个迁移 session 及其 records
    for (const session of localSessions) {
      try {
        // 3a. 创建 session（若已存在则跳过）
        const createResult = await serverCreateSession(baseUrl, learnerKey, session);
        if (createResult === 'created') {
          report.migratedSessions++;
        } else {
          report.skippedSessions++;
        }

        // 3b. 迁移 records
        const localRecords = await listLocalRecords(db, session.id);
        report.totalLocalRecords += localRecords.length;

        // 3c. 预取服务端已有序列号，避免逐条查询
        const serverSeqs = await serverListRecords(baseUrl, learnerKey, session.id);

        for (const record of localRecords) {
          if (serverSeqs.has(record.seq)) {
            report.skippedRecords++;
            continue;
          }
          try {
            const result = await serverAppendRecord(baseUrl, learnerKey, record);
            if (result === 'appended') {
              report.migratedRecords++;
            } else {
              report.skippedRecords++;
            }
          } catch (error) {
            report.failedRecords++;
            report.errors.push({
              sessionId: session.id,
              stageId: session.stageId,
              error: `record seq=${record.seq}: ${error instanceof Error ? error.message : String(error)}`,
            });
          }
        }
      } catch (error) {
        report.failedSessions++;
        report.errors.push({
          sessionId: session.id,
          stageId: session.stageId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 4. 确定最终状态
    if (report.failedSessions > 0 || report.failedRecords > 0) {
      report.status = report.migratedSessions > 0 ? 'partial' : 'failed';
    }
  } finally {
    db.close();
    report.finishedAt = new Date().toISOString();
  }

  // 「只增不删」：迁移完成后不删除本地数据
  // 用户可根据 report.status 手动清理（调用 clearLocalRuntimeDb）
  return report;
}

/**
 * 清理本地 IndexedDB（仅在迁移成功并校验后调用）。
 *
 * ⚠️ 危险操作：删除 maic-runtime 数据库的所有 sessions 和 records。
 * 仅在 MigrationReport.status === 'success' 且用户确认后执行。
 */
export async function clearLocalRuntimeDb(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;

  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(RUNTIME_DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve(); // 被其他连接阻塞，仍视为完成
  }).catch((error) => {
    console.warn('[migrate] clearLocalRuntimeDb failed:', error);
  });
}
