import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { pathToFileURL } from 'node:url';
import cors, { type CorsRequest } from 'cors';
import { Pool } from 'pg';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? 'admin_secret_key';
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000', 'http://localhost:8081'];

export interface QueryResult<TRow extends Record<string, unknown> = Record<string, unknown>> {
  rows: TRow[];
}

export interface Queryable {
  query<TRow extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<TRow>>;
}

export type WithTransaction = <T>(body: (queryable: Queryable) => Promise<T>) => Promise<T>;

export interface ConnectableQueryable extends Queryable {
  connect(): Promise<Queryable & { release(): void }>;
}

export const RUNTIME_PG_SCHEMA = `
CREATE TABLE IF NOT EXISTS runtime_sessions (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL,
  learner_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  data JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS runtime_sessions_stage_learner_idx
  ON runtime_sessions (stage_id, learner_key);
CREATE INDEX IF NOT EXISTS runtime_sessions_learner_idx
  ON runtime_sessions (learner_key);

CREATE TABLE IF NOT EXISTS runtime_records (
  id TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES runtime_sessions(id) ON DELETE CASCADE,
  seq BIGINT NOT NULL CHECK (seq >= 0),
  scene_id TEXT,
  created_at TEXT NOT NULL,
  data JSONB NOT NULL,
  CONSTRAINT runtime_records_session_seq_unique UNIQUE (session_id, seq)
);

CREATE INDEX IF NOT EXISTS runtime_records_session_scene_idx
  ON runtime_records (session_id, scene_id);
`;

export async function ensureSchema(queryable: Queryable): Promise<void> {
  for (const sql of RUNTIME_PG_SCHEMA.split(';')) {
    const statement = sql.trim();
    if (statement !== '') await queryable.query(statement);
  }
}

function nodePostgresTransaction(pool: ConnectableQueryable): WithTransaction {
  return async <T>(body: (queryable: Queryable) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await body(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };
}

interface RuntimeHttpPrincipal {
  learnerKey?: string;
}

type RuntimeHttpAuthenticate = (
  req: IncomingMessage,
) => Promise<RuntimeHttpPrincipal | undefined>;

type RuntimeHttpAuthorizeMerge = (
  principal: RuntimeHttpPrincipal,
  fromKey: string,
  toKey: string,
) => boolean | Promise<boolean>;

type RuntimeHttpAuthorizeAdmin = (
  principal: RuntimeHttpPrincipal,
) => boolean | Promise<boolean>;

async function createReferenceRuntimeServer(
  pool: ConnectableQueryable,
  options: {
    authenticate?: RuntimeHttpAuthenticate;
    authorizeMerge?: RuntimeHttpAuthorizeMerge;
    authorizeAdmin?: RuntimeHttpAuthorizeAdmin;
  } = {},
): Promise<Server> {
  await ensureSchema(pool);

  const withTransaction = nodePostgresTransaction(pool);

  const authenticate: RuntimeHttpAuthenticate =
    options.authenticate ??
    (async (req) => {
      const authorization = req.headers.authorization;
      if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
        return undefined;
      }
      const learnerKey = authorization.slice('Bearer '.length);
      return learnerKey === '' ? undefined : { learnerKey };
    });

  const authorizeMerge: RuntimeHttpAuthorizeMerge =
    options.authorizeMerge ??
    (async (principal, fromKey, toKey) =>
      principal.learnerKey === fromKey && fromKey === toKey);

  const authorizeAdmin: RuntimeHttpAuthorizeAdmin =
    options.authorizeAdmin ?? (async () => false);

  return createServer((req, res) => {
    const corsMiddleware = cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
    });

    corsMiddleware(req as CorsRequest, res as ServerResponse, () => {
      const url = new URL(req.url ?? '/', 'http://storage-server.invalid');

      if (url.pathname === '/healthz') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      handleRuntimeRequest(req, res, pool, withTransaction, {
        authenticate,
        authorizeMerge,
        authorizeAdmin,
      }).catch((error) => {
        if (res.headersSent) {
          res.destroy(error instanceof Error ? error : undefined);
          return;
        }
        console.error('Storage server error:', error);
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }));
      });
    });
  });
}

async function handleRuntimeRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pool: Queryable,
  withTransaction: WithTransaction,
  options: {
    authenticate: RuntimeHttpAuthenticate;
    authorizeMerge: RuntimeHttpAuthorizeMerge;
    authorizeAdmin: RuntimeHttpAuthorizeAdmin;
  },
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://storage-server.invalid');
  const parts = url.pathname.split('/').filter(p => p !== '');
  const method = req.method ?? 'GET';

  if (parts[0] !== 'runtime') {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }));
    return;
  }

  const principal = await options.authenticate(req);
  if (principal === undefined) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } }));
    return;
  }

  if (method === 'POST' && parts.length === 2 && parts[1] === 'sessions') {
    const body = await readJson(req);
    const init = body as { id: string; stageId: string; learnerKey: string; kind: string; status: string; createdAt: string; updatedAt: string };

    if (principal.learnerKey !== undefined && init.learnerKey !== principal.learnerKey) {
      res.writeHead(403, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'FORBIDDEN_LEARNER', message: 'Cannot create session for another learner' } }));
      return;
    }

    const session = { ...init, runtimeDslVersion: '1.0.0' };

    try {
      await pool.query(
        'INSERT INTO runtime_sessions (id, stage_id, learner_key, kind, status, created_at, updated_at, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)',
        [session.id, session.stageId, session.learnerKey, session.kind, session.status, session.createdAt, session.updatedAt, JSON.stringify(session)],
      );
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify(session));
    } catch (error) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } }));
    }
    return;
  }

  if (parts[1] === 'sessions' && parts.length >= 3) {
    const sessionId = parts[2];

    if (method === 'GET' && parts.length === 3) {
      const result = await pool.query('SELECT data FROM runtime_sessions WHERE id = $1', [sessionId]);
      if (result.rows.length === 0) {
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } }));
        return;
      }
      const session = JSON.parse(result.rows[0].data as string);
      if (principal.learnerKey !== undefined && session.learnerKey !== principal.learnerKey) {
        res.writeHead(403, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'FORBIDDEN_LEARNER', message: 'Cannot access session for another learner' } }));
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(session));
      return;
    }

    if (method === 'POST' && parts.length === 4 && parts[3] === 'records') {
      const body = await readJson(req);
      const init = body as { id: string; sessionId: string; payload: unknown; createdAt: string; sceneId?: string };

      if (init.sessionId !== sessionId) {
        res.writeHead(400, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'VALIDATION_FAILED', message: 'Body sessionId does not match path' } }));
        return;
      }

      const sessionResult = await pool.query('SELECT data FROM runtime_sessions WHERE id = $1', [sessionId]);
      if (sessionResult.rows.length === 0) {
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } }));
        return;
      }
      const session = JSON.parse(sessionResult.rows[0].data as string);
      if (principal.learnerKey !== undefined && session.learnerKey !== principal.learnerKey) {
        res.writeHead(403, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'FORBIDDEN_LEARNER', message: 'Cannot append to session for another learner' } }));
        return;
      }

      try {
        const record = await withTransaction(async (tx) => {
          const lockResult = await tx.query('SELECT data FROM runtime_sessions WHERE id = $1 FOR UPDATE', [sessionId]);
          if (lockResult.rows.length === 0) {
            throw new Error('Session not found');
          }

          const seqResult = await tx.query('SELECT COALESCE(MAX(seq), -1)::text AS last_seq FROM runtime_records WHERE session_id = $1', [sessionId]);
          const seq = Number(seqResult.rows[0].last_seq ?? -1) + 1;

          const recordData = { ...init, seq };
          await tx.query(
            'INSERT INTO runtime_records (id, session_id, seq, scene_id, created_at, data) VALUES ($1, $2, $3, $4, $5, $6::jsonb)',
            [recordData.id, recordData.sessionId, recordData.seq, recordData.sceneId ?? null, recordData.createdAt, JSON.stringify(recordData)],
          );

          return recordData;
        });

        res.writeHead(201, { 'content-type': 'application/json' });
        res.end(JSON.stringify(record));
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to append record' } }));
      }
      return;
    }

    if (method === 'GET' && parts.length === 4 && parts[3] === 'records') {
      const sessionResult = await pool.query('SELECT data FROM runtime_sessions WHERE id = $1', [sessionId]);
      if (sessionResult.rows.length === 0) {
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } }));
        return;
      }
      const session = JSON.parse(sessionResult.rows[0].data as string);
      if (principal.learnerKey !== undefined && session.learnerKey !== principal.learnerKey) {
        res.writeHead(403, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'FORBIDDEN_LEARNER', message: 'Cannot access records for another learner' } }));
        return;
      }

      const sceneId = url.searchParams.get('sceneId');
      let query = 'SELECT data FROM runtime_records WHERE session_id = $1 ORDER BY seq ASC';
      const params: unknown[] = [sessionId];

      if (sceneId !== null) {
        query += ' AND scene_id = $2';
        params.push(sceneId);
      }

      const result = await pool.query(query, params);
      const records = result.rows.map(row => JSON.parse(row.data as string));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(records));
      return;
    }

    if (method === 'DELETE' && parts.length === 3) {
      const sessionResult = await pool.query('SELECT data FROM runtime_sessions WHERE id = $1', [sessionId]);
      if (sessionResult.rows.length === 0) {
        res.writeHead(204);
        res.end();
        return;
      }
      const session = JSON.parse(sessionResult.rows[0].data as string);
      if (principal.learnerKey !== undefined && session.learnerKey !== principal.learnerKey) {
        res.writeHead(403, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'FORBIDDEN_LEARNER', message: 'Cannot delete session for another learner' } }));
        return;
      }

      await pool.query('DELETE FROM runtime_sessions WHERE id = $1', [sessionId]);
      res.writeHead(204);
      res.end();
      return;
    }
  }

  if (method === 'GET' && parts.length === 6 && parts[1] === 'stages' && parts[3] === 'learners' && parts[5] === 'sessions') {
    const stageId = parts[2];
    const learnerKey = parts[4];

    if (principal.learnerKey !== undefined && learnerKey !== principal.learnerKey) {
      res.writeHead(403, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'FORBIDDEN_LEARNER', message: 'Cannot access sessions for another learner' } }));
      return;
    }

    const result = await pool.query('SELECT data FROM runtime_sessions WHERE stage_id = $1 AND learner_key = $2 ORDER BY created_at ASC', [stageId, learnerKey]);
    const sessions = result.rows.map(row => JSON.parse(row.data as string));
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(sessions));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }));
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) {
    throw new Error('Request body must be a JSON object');
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

async function main(): Promise<void> {
  const POSTGRES_USER = process.env.POSTGRES_USER ?? 'openmaic';
  const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'openmaic_password';
  const POSTGRES_DB = process.env.POSTGRES_DB ?? 'openmaic';
  const POSTGRES_HOST = process.env.POSTGRES_HOST ?? 'localhost';
  const POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';

  const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  const port = Number(process.env.STORAGE_SERVER_PORT ?? '3001');

  const pool = new Pool({ connectionString });

  let server: Server;
  try {
    server = await createReferenceRuntimeServer(pool as ConnectableQueryable);
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '0.0.0.0', resolve);
    });
  } catch (error) {
    await pool.end().catch(() => {});
    throw error;
  }

  process.stdout.write(`Storage server listening on http://0.0.0.0:${port}\n`);

  const close = (): void => {
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
  };

  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}

export { createReferenceRuntimeServer, nodePostgresTransaction };