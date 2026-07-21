/**
 * OpenMAIC 独立 Storage Server（docs/mobile-storage-plan.md Phase 2）。
 *
 * 使用官方标准实现：
 * - `createRuntimeHttpHandler` from `@openmaic/storage/server`
 * - `PgRuntimeStore` + `ensureSchema` from `@openmaic/storage/runtime/pg`
 * - `nodePostgresTransaction` + `ConnectableQueryable` from `@openmaic/storage/server/reference`
 *
 * 在官方 handler 外层包装：
 * - CORS 中间件（支持 Web/Mobile 跨域）
 * - `/healthz` 健康检查端点
 * - 自定义鉴权钩子（Bearer Token + ADMIN_API_KEY）
 *
 * 启动方式：
 *   pnpm --filter @openmaic/storage-server run dev
 *   或
 *   docker-compose up -d storage-server
 *
 * 环境变量：
 * - POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB / POSTGRES_HOST / POSTGRES_PORT
 * - STORAGE_SERVER_PORT（默认 3001）
 * - ADMIN_API_KEY（管理员密钥，默认 admin_secret_key）
 * - CORS_ORIGINS（逗号分隔的允许来源）
 */
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import cors from 'cors';
import { Pool } from 'pg';
// 官方标准实现
import { createRuntimeHttpHandler } from '@openmaic/storage/server';
import { PgRuntimeStore, ensureSchema } from '@openmaic/storage/runtime/pg';
import { nodePostgresTransaction } from '@openmaic/storage/server/reference';
// ============================================================
// 配置
// ============================================================
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? 'admin_secret_key';
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [
  'http://localhost:3000',
  'http://localhost:8081',
];
// ============================================================
// 鉴权钩子（docs/mobile-storage-plan.md 6. 核心协议契约规范）
// ============================================================
/**
 * 身份验证钩子：解析 `Authorization: Bearer <learnerKey>` 头。
 *
 * 符合 docs/mobile-storage-plan.md 规范：
 * - 未认证请求返回 401 UNAUTHENTICATED
 * - learnerKey 为空字符串视为未认证
 */
const authenticate = async (req) => {
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    return undefined;
  }
  const learnerKey = authorization.slice('Bearer '.length);
  return learnerKey === '' ? undefined : { learnerKey };
};
/**
 * 合并授权钩子：仅允许用户合并自己的数据（fromKey === toKey === learnerKey）。
 *
 * 生产环境应替换为真实的授权逻辑（如管理员发起的账号合并）。
 */
const authorizeMerge = async (principal, fromKey, toKey) => {
  return principal.learnerKey === fromKey && fromKey === toKey;
};
/**
 * 管理员授权钩子：基于 `ADMIN_API_KEY` 环境变量验证管理员身份。
 *
 * 管理员通过 `Authorization: Bearer <ADMIN_API_KEY>` 认证，
 * 拥有 `deleteAllRuntime` / `deleteStageRuntime` 等管理操作权限。
 */
const authorizeAdmin = async (principal) => {
  // 管理员使用特殊的 learnerKey（即 ADMIN_API_KEY）
  return principal.learnerKey === ADMIN_API_KEY;
};
// ============================================================
// Server 组装
// ============================================================
/**
 * 创建独立的 Storage Server。
 *
 * 使用官方 `createRuntimeHttpHandler` + `PgRuntimeStore` 标准实现，
 * 在外层包装 CORS 中间件和 `/healthz` 健康检查端点。
 *
 * @param pool PostgreSQL 连接池（node-postgres Pool）
 * @returns 已创建但未监听的 HTTP Server
 */
export async function createStorageServer(pool) {
  // 1. 初始化数据库 schema（幂等）
  await ensureSchema(pool);
  // 2. 创建 PgRuntimeStore（官方标准 PG 后端）
  const withTransaction = nodePostgresTransaction(pool);
  const store = new PgRuntimeStore(pool, { withTransaction });
  // 3. 创建官方标准 HTTP handler
  const runtimeHandler = createRuntimeHttpHandler(store, {
    authenticate,
    authorizeMerge,
    authorizeAdmin,
  });
  // 4. 包装 CORS + /healthz + 官方 handler
  const corsMiddleware = cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  });
  return createServer((req, res) => {
    // 先过 CORS
    corsMiddleware(req, res, () => {
      const url = new URL(req.url ?? '/', 'http://storage-server.invalid');
      // 健康检查端点（不需要认证）
      if (url.pathname === '/healthz') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: '@openmaic/storage-server',
          }),
        );
        return;
      }
      // 委托给官方标准 handler
      runtimeHandler(req, res);
    });
  });
}
// ============================================================
// 入口
// ============================================================
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
    server = await createStorageServer(pool);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '0.0.0.0', resolve);
    });
  } catch (error) {
    await pool.end().catch(() => {});
    throw error;
  }
  process.stdout.write(`Storage server listening on http://0.0.0.0:${port}\n`);
  process.stdout.write(
    `CORS origins: ${ALLOWED_ORIGINS.join(', ')}\n` +
      `Admin API key: ${ADMIN_API_KEY === 'admin_secret_key' ? '(default)' : '(configured)'}\n`,
  );
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
// 导出供程序化使用
export { authenticate, authorizeMerge, authorizeAdmin };
//# sourceMappingURL=index.js.map
