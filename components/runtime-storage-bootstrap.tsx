'use client';

import { useEffect } from 'react';

import { bootstrapHttpRuntimeStore } from '@/lib/runtime/http-bootstrap';

/**
 * 客户端引导组件：在根布局挂载时切换 RuntimeStore 至 HttpRuntimeStore。
 *
 * 渲染空内容，仅作为副作用载体。必须在所有 runtime consumer 之前挂载，
 * 但由于 `configureRuntimeStorage` 要求模块级 bootstrap，这里使用 useEffect
 * 作为兜底 —— 真正的引导在模块导入时立即执行（见下方立即调用）。
 */
export function RuntimeStorageBootstrap() {
  useEffect(() => {
    // 兜底：确保在组件挂载后再次尝试引导（处理 HMR 重载场景）
    bootstrapHttpRuntimeStore();
  }, []);

  return null;
}

// 模块加载即执行引导：这是 `configureRuntimeStorage` 要求的时机
// —— 必须在任何 runtime consumer 调用 getRuntimeStore() 之前
bootstrapHttpRuntimeStore();
