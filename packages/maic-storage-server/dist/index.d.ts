/**
 * OpenMAIC 独立 Storage Server（PLAN.MD Phase 2）。
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
import { type Server } from 'node:http';
import type {
  RuntimeHttpAuthenticate,
  RuntimeHttpAuthorizeAdmin,
  RuntimeHttpAuthorizeMerge,
} from '@openmaic/storage/server';
import type { Queryable, WithTransaction } from '@openmaic/storage/runtime/pg';
import { type ConnectableQueryable } from '@openmaic/storage/server/reference';
/**
 * 身份验证钩子：解析 `Authorization: Bearer <learnerKey>` 头。
 *
 * 符合 PLAN.MD 规范：
 * - 未认证请求返回 401 UNAUTHENTICATED
 * - learnerKey 为空字符串视为未认证
 */
declare const authenticate: RuntimeHttpAuthenticate;
/**
 * 合并授权钩子：仅允许用户合并自己的数据（fromKey === toKey === learnerKey）。
 *
 * 生产环境应替换为真实的授权逻辑（如管理员发起的账号合并）。
 */
declare const authorizeMerge: RuntimeHttpAuthorizeMerge;
/**
 * 管理员授权钩子：基于 `ADMIN_API_KEY` 环境变量验证管理员身份。
 *
 * 管理员通过 `Authorization: Bearer <ADMIN_API_KEY>` 认证，
 * 拥有 `deleteAllRuntime` / `deleteStageRuntime` 等管理操作权限。
 */
declare const authorizeAdmin: RuntimeHttpAuthorizeAdmin;
/**
 * 创建独立的 Storage Server。
 *
 * 使用官方 `createRuntimeHttpHandler` + `PgRuntimeStore` 标准实现，
 * 在外层包装 CORS 中间件和 `/healthz` 健康检查端点。
 *
 * @param pool PostgreSQL 连接池（node-postgres Pool）
 * @returns 已创建但未监听的 HTTP Server
 */
export declare function createStorageServer(pool: ConnectableQueryable): Promise<Server>;
export { authenticate, authorizeMerge, authorizeAdmin };
export type { ConnectableQueryable, Queryable, WithTransaction };
//# sourceMappingURL=index.d.ts.map
