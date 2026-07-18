/**
 * Web 端 HttpRuntimeStore 引导模块（PLAN.MD Phase 4）。
 *
 * 将 Web 端的 RuntimeStore 从浏览器 IndexedDB (BrowserRuntimeStore)
 * 切换为独立的 Storage Server (HttpRuntimeStore)，为多端数据同步奠定基础。
 *
 * 引导流程：
 * 1. 仅在客户端执行（SSR 环境无 localStorage / fetch 语义）
 * 2. 通过 `configureRuntimeStorage` 注册 HttpRuntimeStore 实例
 * 3. headers 钩子从 `getLearnerKey()` 读取匿名身份并注入 `Authorization: Bearer`
 * 4. baseUrl 指向 Next.js 代理路由 `/api`，由 `app/api/runtime/route.ts` 转发至 Storage Server
 *
 * 幂等性：模块多次加载只配置一次（`configureRuntimeStorage` 内部已防重）。
 * 容错：若 Storage Server 不可达，HttpRuntimeStore 仍可创建，首次请求失败时抛出 HttpRuntimeStoreError。
 *
 * @remarks Client-only：此模块必须在客户端环境加载，禁止 SSR。
 */

import { HttpRuntimeStore } from '@openmaic/storage/runtime/http';

import { configureRuntimeStorage, isRuntimeStorageConfigured } from './config';
import { getLearnerKey } from './learner-key';

/** Storage Server 经 Next.js 代理后的 baseUrl。 */
const HTTP_RUNTIME_BASE_URL = '/api';

/** 标记引导已尝试执行，防止 HMR 重复触发配置错误。 */
let bootstrapAttempted = false;

/**
 * 在客户端引导 HttpRuntimeStore 作为应用级 RuntimeStore。
 *
 * 必须在任何 `getRuntimeStore()` 调用之前执行（模块加载阶段或根布局客户端组件）。
 * 一旦 RuntimeStore 解析启动，配置将被密封，二次调用会抛错。
 */
export function bootstrapHttpRuntimeStore(): void {
  // SSR 安全：仅在有 window 的客户端环境执行
  if (typeof window === 'undefined') {
    return;
  }

  // 幂等：已配置或已尝试过则跳过
  if (bootstrapAttempted || isRuntimeStorageConfigured()) {
    return;
  }

  bootstrapAttempted = true;

  try {
    configureRuntimeStorage({
      store: new HttpRuntimeStore({
        baseUrl: HTTP_RUNTIME_BASE_URL,
        // 每次 HTTP 请求注入 Bearer learnerKey 作为认证凭据。
        // getLearnerKey() 从 localStorage 读取匿名身份，缺失时自动铸造。
        headers: async () => {
          const learnerKey = await getLearnerKey();
          return {
            Authorization: `Bearer ${learnerKey}`,
            'Content-Type': 'application/json',
          };
        },
      }),
      // learnerKey 仍由 getLearnerKey() 解析（localStorage 持久化匿名身份）
      // 此处显式传入，确保 HttpRuntimeStore 与未来登录态切换时身份一致
      learnerKey: () => getLearnerKey(),
    });
  } catch (error) {
    // 二次配置会在开发模式 HMR 下抛错，忽略以保持应用可用
    console.warn('[http-bootstrap] configureRuntimeStorage skipped:', error);
  }
}
