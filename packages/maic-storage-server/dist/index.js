import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import cors from 'cors';
import { Pool } from 'pg';
import { PgRuntimeStore, ensureSchema } from '@openmaic/storage/src/runtime/pg.js';
import { createRuntimeHttpHandler } from '@openmaic/storage/src/server/index.js';
function nodePostgresTransaction(pool) {
    return async (body) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await body(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    };
}
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? 'admin_secret_key';
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000', 'http://localhost:8081'];
async function createRuntimeServer(pool, options = {}) {
    await ensureSchema(pool);
    const store = new PgRuntimeStore(pool, {
        withTransaction: nodePostgresTransaction(pool),
    });
    const authenticate = options.authenticate ??
        (async (req) => {
            const authorization = req.headers.authorization;
            if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
                return undefined;
            }
            const learnerKey = authorization.slice('Bearer '.length);
            return learnerKey === '' ? undefined : { learnerKey };
        });
    const authorizeMerge = options.authorizeMerge ??
        (async (principal, fromKey, toKey) => {
            if (principal.learnerKey === fromKey && fromKey === toKey) {
                return true;
            }
            return false;
        });
    const authorizeAdmin = options.authorizeAdmin ??
        (async (principal) => {
            return principal.learnerKey === ADMIN_API_KEY;
        });
    const runtimeHandler = createRuntimeHttpHandler(store, {
        authenticate,
        authorizeMerge,
        authorizeAdmin,
    });
    const corsMiddleware = cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    });
    return createServer((req, res) => {
        corsMiddleware(req, res, () => {
            const url = new URL(req.url ?? '/', 'http://storage-server.invalid');
            if (url.pathname === '/healthz') {
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
                return;
            }
            runtimeHandler(req, res);
        });
    });
}
async function main() {
    const POSTGRES_USER = process.env.POSTGRES_USER ?? 'openmaic';
    const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'openmaic_password';
    const POSTGRES_DB = process.env.POSTGRES_DB ?? 'openmaic';
    const POSTGRES_HOST = process.env.POSTGRES_HOST ?? 'localhost';
    const POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';
    const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
    const port = Number(process.env.STORAGE_SERVER_PORT ?? '3001');
    const pool = new Pool({ connectionString });
    let server;
    try {
        server = await createRuntimeServer(pool);
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(port, '0.0.0.0', resolve);
        });
    }
    catch (error) {
        await pool.end().catch(() => { });
        throw error;
    }
    process.stdout.write(`Storage server listening on http://0.0.0.0:${port}\n`);
    const close = () => {
        server.close(() => {
            void pool.end().finally(() => process.exit(0));
        });
    };
    process.once('SIGINT', close);
    process.once('SIGTERM', close);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    void main().catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
        process.exitCode = 1;
    });
}
export { createRuntimeServer, nodePostgresTransaction };
