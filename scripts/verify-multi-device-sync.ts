/**
 * 多端同步验证脚本（PLAN.MD Phase 4 验收点）。
 *
 * 验证 Web/Mobile 登录同一账号后，数据实时同步无延迟。
 * 验证多端并发写入同一 Session，seq 严格递增无冲突。
 *
 * 使用方式（Node.js 环境，需 Storage Server 运行）：
 *   npx tsx scripts/verify-multi-device-sync.ts
 *
 * 或在浏览器控制台（Web 端 /migrate 页面）：
 *   直接调用 verifyMultiDeviceSync() 函数
 *
 * 前置条件：
 * 1. Storage Server 运行（默认 http://localhost:3001）
 * 2. Postgres 16 运行且 schema 已初始化
 * 3. 使用同一 learnerKey 模拟 Web/Mobile 双端
 */

import type { RuntimeRecord, RuntimeSession } from '@openmaic/storage-types';

/** 验证结果。 */
export interface SyncVerificationResult {
  startedAt: string;
  finishedAt: string;
  status: 'passed' | 'failed';
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
}

/** 验证用的固定 learnerKey（模拟 Web/Mobile 共享同一身份）。 */
const TEST_LEARNER_KEY = 'verify-sync-test-learner';

/** 测试用 stageId。 */
const TEST_STAGE_ID = 'verify-sync-test-stage';

/**
 * 执行多端同步验证。
 *
 * @param baseUrl Storage Server URL，默认 http://localhost:3001
 */
export async function verifyMultiDeviceSync(
  baseUrl: string = 'http://localhost:3001',
): Promise<SyncVerificationResult> {
  const result: SyncVerificationResult = {
    startedAt: new Date().toISOString(),
    finishedAt: '',
    status: 'passed',
    checks: [],
  };

  const headers = {
    Authorization: `Bearer ${TEST_LEARNER_KEY}`,
    'Content-Type': 'application/json',
  };

  // ===== Check 1: 健康检查 =====
  try {
    const response = await fetch(`${baseUrl}/healthz`);
    const data = await response.json();
    result.checks.push({
      name: 'Storage Server 健康检查',
      passed: response.ok && data.status === 'ok',
      detail: `HTTP ${response.status}: ${JSON.stringify(data)}`,
    });
  } catch (error) {
    result.checks.push({
      name: 'Storage Server 健康检查',
      passed: false,
      detail: `连接失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
    result.finishedAt = new Date().toISOString();
    return result;
  }

  // ===== Check 2: 创建 Session（模拟 Web 端创建）=====
  const sessionId = `verify-${Date.now()}`;
  let session: RuntimeSession;

  try {
    const response = await fetch(`${baseUrl}/runtime/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: sessionId,
        stageId: TEST_STAGE_ID,
        learnerKey: TEST_LEARNER_KEY,
        kind: 'chat',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok && response.status !== 201) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    session = (await response.json()) as RuntimeSession;

    result.checks.push({
      name: 'Web 端创建 Session',
      passed: session.id === sessionId && session.learnerKey === TEST_LEARNER_KEY,
      detail: `sessionId=${session.id}, kind=${session.kind}`,
    });
  } catch (error) {
    result.checks.push({
      name: 'Web 端创建 Session',
      passed: false,
      detail: `失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
    result.finishedAt = new Date().toISOString();
    return result;
  }

  // ===== Check 3: Mobile 端读取 Session（验证同步）=====
  try {
    const response = await fetch(`${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers,
    });

    const fetched = (await response.json()) as RuntimeSession;
    result.checks.push({
      name: 'Mobile 端读取 Session（同步验证）',
      passed: response.ok && fetched.id === sessionId,
      detail: `HTTP ${response.status}, id匹配=${fetched.id === sessionId}`,
    });
  } catch (error) {
    result.checks.push({
      name: 'Mobile 端读取 Session（同步验证）',
      passed: false,
      detail: `失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
  }

  // ===== Check 4: Mobile 端通过 listSessions 查询（验证索引同步）=====
  try {
    const response = await fetch(
      `${baseUrl}/runtime/stages/${encodeURIComponent(TEST_STAGE_ID)}/learners/${encodeURIComponent(TEST_LEARNER_KEY)}/sessions`,
      { method: 'GET', headers },
    );

    const sessions = (await response.json()) as RuntimeSession[];
    const found = sessions.some((s) => s.id === sessionId);

    result.checks.push({
      name: 'Mobile 端 listSessions 查询（索引同步）',
      passed: response.ok && found,
      detail: `返回 ${sessions.length} 个会话，目标会话${found ? '存在' : '缺失'}`,
    });
  } catch (error) {
    result.checks.push({
      name: 'Mobile 端 listSessions 查询（索引同步）',
      passed: false,
      detail: `失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
  }

  // ===== Check 5: 多端并发追加 Records（验证 seq 严格递增）=====
  const recordCount = 10;
  const recordPromises: Promise<RuntimeRecord>[] = [];

  for (let i = 0; i < recordCount; i++) {
    const recordInit = {
      id: `record-${sessionId}-${i}-${Math.random().toString(36).slice(2)}`,
      sessionId,
      payload: { type: 'test', index: i, source: i % 2 === 0 ? 'web' : 'mobile' },
      createdAt: new Date().toISOString(),
    };

    recordPromises.push(
      (async () => {
        const response = await fetch(
          `${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}/records`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(recordInit),
          },
        );
        if (!response.ok && response.status !== 201) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return (await response.json()) as RuntimeRecord;
      })(),
    );
  }

  try {
    const records = await Promise.all(recordPromises);
    const seqs = records.map((r) => r.seq).sort((a, b) => a - b);
    const uniqueSeqs = new Set(seqs);
    const isStrictlyIncreasing =
      seqs.length === recordCount &&
      uniqueSeqs.size === recordCount &&
      seqs.every((seq, idx) => seq === idx);

    result.checks.push({
      name: '多端并发追加 Records（seq 严格递增）',
      passed: isStrictlyIncreasing,
      detail: `并发 ${recordCount} 条，seq 范围 [${seqs[0]}, ${seqs[seqs.length - 1]}]，唯一=${uniqueSeqs.size}`,
    });
  } catch (error) {
    result.checks.push({
      name: '多端并发追加 Records（seq 严格递增）',
      passed: false,
      detail: `失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
  }

  // ===== Check 6: 查询 Records（验证读取一致性）=====
  try {
    const response = await fetch(
      `${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}/records`,
      { method: 'GET', headers },
    );

    const records = (await response.json()) as RuntimeRecord[];
    const sortedBySeq = [...records].sort((a, b) => a.seq - b.seq);
    const isConsistent =
      records.length === recordCount && sortedBySeq.every((r, idx) => r.seq === idx);

    result.checks.push({
      name: '查询 Records 一致性（Web/Mobile 读取相同）',
      passed: response.ok && isConsistent,
      detail: `服务端 ${records.length} 条记录，期望 ${recordCount} 条，seq 连续=${isConsistent}`,
    });
  } catch (error) {
    result.checks.push({
      name: '查询 Records 一致性（Web/Mobile 读取相同）',
      passed: false,
      detail: `失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
  }

  // ===== Check 7: 跨租户隔离（验证多租户安全）=====
  try {
    const otherLearnerKey = 'other-learner-should-fail';
    const response = await fetch(`${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${otherLearnerKey}`,
        'Content-Type': 'application/json',
      },
    });

    // 应返回 403 FORBIDDEN_LEARNER（跨租户访问被拒绝）
    result.checks.push({
      name: '跨租户隔离（其他 learnerKey 被拒绝）',
      passed: response.status === 403,
      detail: `HTTP ${response.status}（期望 403）`,
    });
  } catch (error) {
    result.checks.push({
      name: '跨租户隔离（其他 learnerKey 被拒绝）',
      passed: false,
      detail: `失败：${error instanceof Error ? error.message : String(error)}`,
    });
    result.status = 'failed';
  }

  // ===== 清理：删除测试 Session =====
  try {
    await fetch(`${baseUrl}/runtime/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers,
    });
  } catch {
    // 清理失败不影响验证结果
  }

  // ===== 汇总状态 =====
  if (result.checks.some((c) => !c.passed)) {
    result.status = 'failed';
  }

  result.finishedAt = new Date().toISOString();
  return result;
}

/**
 * 格式化打印验证结果。
 */
export function formatVerificationResult(result: SyncVerificationResult): string {
  const lines: string[] = [
    '==================== 多端同步验证报告 ====================',
    `状态：${result.status === 'passed' ? '✅ 全部通过' : '❌ 存在失败'}`,
    `开始：${result.startedAt}`,
    `完成：${result.finishedAt}`,
    '',
    '检查项：',
  ];

  for (const check of result.checks) {
    const icon = check.passed ? '✅' : '❌';
    lines.push(`  ${icon} ${check.name}`);
    lines.push(`     ${check.detail}`);
    lines.push('');
  }

  lines.push('=========================================================');
  return lines.join('\n');
}

// ===== Node.js CLI 入口 =====
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('verify-multi-device-sync.ts')) {
  const baseUrl = process.env.STORAGE_SERVER_URL ?? 'http://localhost:3001';

  verifyMultiDeviceSync(baseUrl)
    .then((result) => {
      console.log(formatVerificationResult(result));
      process.exit(result.status === 'passed' ? 0 : 1);
    })
    .catch((error) => {
      console.error('验证脚本异常：', error);
      process.exit(1);
    });
}
