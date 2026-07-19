'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import {
  migrateIndexedDbToHttp,
  clearLocalRuntimeDb,
  type MigrationReport,
} from '@/lib/runtime/migrate-to-http';
import { getLearnerKey } from '@/lib/runtime/learner-key';

/**
 * 数据迁移页面（PLAN.MD Phase 4 验收工具）。
 *
 * 用途：
 * 1. 将本地 IndexedDB 中的 runtime sessions/records 迁移至 Storage Server
 * 2. 查看迁移报告（成功/跳过/失败统计）
 * 3. 迁移成功后可选清理本地数据（只增不删策略的收尾步骤）
 *
 * 访问路径：/migrate
 */
export default function MigratePage() {
  const [report, setReport] = useState<MigrationReport | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleMigrate = useCallback(async () => {
    setMigrating(true);
    setReport(null);
    try {
      const learnerKey = await getLearnerKey();
      const result = await migrateIndexedDbToHttp('/api', learnerKey);
      setReport(result);

      if (result.status === 'success') {
        toast.success(
          `迁移完成：${result.migratedSessions} 个会话，${result.migratedRecords} 条记录`,
        );
      } else if (result.status === 'partial') {
        toast.warning(`部分迁移：成功 ${result.migratedSessions}，失败 ${result.failedSessions}`);
      } else {
        toast.error(`迁移失败：${result.failedSessions} 个会话未能迁移`);
      }
    } catch (error) {
      toast.error(`迁移异常：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setMigrating(false);
    }
  }, []);

  const handleClearLocal = useCallback(async () => {
    if (!report || report.status !== 'success') {
      toast.error('仅在迁移成功后才能清理本地数据');
      return;
    }
    if (!window.confirm('确认清理本地 IndexedDB？此操作不可撤销，请确保服务端数据已校验完整。')) {
      return;
    }
    setClearing(true);
    try {
      await clearLocalRuntimeDb();
      toast.success('本地数据已清理');
    } catch (error) {
      toast.error(`清理失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setClearing(false);
    }
  }, [report]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据迁移工具</h1>
          <p className="mt-2 text-gray-600">
            将本地 IndexedDB 中的学习数据迁移至 Storage Server，实现 Web/Mobile 多端同步。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>迁移操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">「只增不删」策略</p>
              <p>
                迁移过程中不会删除任何本地数据。仅当迁移成功并校验后，才可手动清理本地 IndexedDB。
                迁移失败时可安全重试。
              </p>
            </div>
            <Button onClick={handleMigrate} disabled={migrating} className="w-full" size="lg">
              {migrating ? '迁移中...' : '开始迁移'}
            </Button>
          </CardContent>
        </Card>

        {report && (
          <Card>
            <CardHeader>
              <CardTitle>迁移报告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="状态" value={report.status} highlight />
                <StatCard label="本地会话" value={report.totalLocalSessions} />
                <StatCard label="本地记录" value={report.totalLocalRecords} />
                <StatCard label="迁移会话" value={report.migratedSessions} variant="success" />
                <StatCard label="跳过会话" value={report.skippedSessions} variant="info" />
                <StatCard label="失败会话" value={report.failedSessions} variant="danger" />
                <StatCard label="迁移记录" value={report.migratedRecords} variant="success" />
                <StatCard label="跳过记录" value={report.skippedRecords} variant="info" />
                <StatCard label="失败记录" value={report.failedRecords} variant="danger" />
              </div>

              <div className="text-xs text-gray-500">
                <p>开始时间：{report.startedAt}</p>
                <p>完成时间：{report.finishedAt}</p>
                <p>本地数据保留：{report.localDataPreserved ? '是' : '否'}</p>
              </div>

              {report.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>错误详情（{report.errors.length} 条）</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 max-h-48 overflow-auto text-xs space-y-1">
                      {report.errors.slice(0, 20).map((err, idx) => (
                        <li key={idx} className="font-mono">
                          <span className="font-semibold">{err.sessionId}</span>
                          {err.stageId && (
                            <span className="text-gray-500"> ({err.stageId})</span>
                          )}: {err.error}
                        </li>
                      ))}
                      {report.errors.length > 20 && (
                        <li className="text-gray-500">
                          ...还有 {report.errors.length - 20} 条错误
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {report.status === 'success' && report.totalLocalSessions > 0 && (
                <Alert>
                  <AlertTitle>迁移成功</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">
                      本地数据已成功迁移至服务端。建议在确认 Web/Mobile
                      数据同步正常后，再清理本地数据。
                    </p>
                    <Button
                      onClick={handleClearLocal}
                      disabled={clearing}
                      variant="destructive"
                      size="sm"
                    >
                      {clearing ? '清理中...' : '清理本地数据'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>多端同步验证</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">迁移完成后，可执行以下验证步骤：</p>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>在 Web 端创建新的学习会话，确认数据写入服务端</li>
              <li>在 Expo 端登录相同账号（learnerKey），确认会话列表同步</li>
              <li>在 Expo 端追加记录，刷新 Web 端确认记录可见</li>
              <li>多端并发写入同一会话，确认 seq 严格递增无冲突</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              验证脚本位于：
              <code className="bg-gray-100 px-1 rounded">scripts/verify-multi-device-sync.ts</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  variant?: 'success' | 'info' | 'danger';
}

function StatCard({ label, value, highlight, variant }: StatCardProps) {
  const colorClass = highlight
    ? 'bg-purple-50 text-purple-900'
    : variant === 'success'
      ? 'bg-green-50 text-green-900'
      : variant === 'danger'
        ? 'bg-red-50 text-red-900'
        : variant === 'info'
          ? 'bg-blue-50 text-blue-900'
          : 'bg-gray-50 text-gray-900';

  return (
    <div className={`rounded-md p-3 ${colorClass}`}>
      <div className="text-xs font-medium opacity-75">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
