/**
 * @file ImageSettings.tsx
 * @description 图像生成提供商设置面板（移动端）。
 *
 * 允许配置 API Key、Base URL、启用状态、模型列表 CRUD（新增 / 编辑 / 删除），
 * 并支持调用后端 `/api/generate/image` 接口进行连通性测试。
 *
 * 设计说明：
 * - 由于 `settingsStore` 仅暴露 `setImageProviderConfig`，无法直接修改全局
 *   `imageModelId`，因此当前选中的模型会被持久化到该提供商的
 *   `providerOptions.activeModelId` 中（按提供商隔离）。
 *   读取时优先使用 providerOptions，缺失则回退到全局状态。
 * - 模型 CRUD 通过底部 Sheet 弹出表单完成。
 * - 严格隔离：仅依赖 react-native 原生组件、./ui 共享组件、../settingsStore、
 *   ../constants、../types，不引用任何 Web 端包或 @openmaic/storage 运行时。
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  Input,
  Label,
  Switch,
  Card,
  SectionHeader,
  IconButton,
  Sheet,
  AlertDialog,
  colors,
} from './ui';
import { useSettingsStore } from '../settingsStore';
import { IMAGE_PROVIDERS } from '../constants';
import type { ImageProviderId } from '../types';

/** 图像生成测试 API 路径（相对于 API origin）。 */
const IMAGE_TEST_PATH = '/api/generate/image';

/** 默认 API origin，可通过 EXPO_PUBLIC_API_ORIGIN 环境变量覆盖。 */
const DEFAULT_API_ORIGIN = 'http://localhost:3000';

/**
 * 解析图像测试 API 完整 URL。
 * 优先使用 `EXPO_PUBLIC_API_ORIGIN` 环境变量，否则回退到 localhost。
 */
function resolveImageTestUrl(): string {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN;
  return `${origin}${IMAGE_TEST_PATH}`;
}

/** 安全读取 providerOptions 中的字符串字段。 */
function readOptString(
  opts: Record<string, unknown> | undefined,
  key: string,
): string | null {
  if (!opts) return null;
  const v = opts[key];
  return typeof v === 'string' ? v : null;
}

/** 图像设置面板 Props。 */
export interface ImageSettingsProps {
  /** 当前选中的图像生成提供商 ID。 */
  selectedProviderId: ImageProviderId;
}

/**
 * 图像生成设置面板组件。
 *
 * 提供以下能力：
 * - 启用/禁用当前图像生成提供商（写入 `GenericProviderConfig.enabled`）
 * - 配置 API Key（带显隐切换）与 Base URL
 * - 模型列表 CRUD：新增、编辑、删除（持久化到 `customModels`）
 * - 选择当前激活模型（写入 `providerOptions.activeModelId`）
 * - 调用后端图像生成接口进行连通性测试
 *
 * @param props - 组件属性，参见 {@link ImageSettingsProps}
 */
export function ImageSettings({ selectedProviderId }: ImageSettingsProps) {
  const imageProvidersConfig = useSettingsStore((s) => s.imageProvidersConfig);
  const setImageProviderConfig = useSettingsStore((s) => s.setImageProviderConfig);
  const globalImageModelId = useSettingsStore((s) => s.imageModelId);

  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>(
    'idle',
  );
  const [testMessage, setTestMessage] = useState('');

  // 模型 CRUD Sheet 状态
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modelForm, setModelForm] = useState({ id: '', name: '' });

  // 删除确认对话框
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const providerConfig = imageProvidersConfig[selectedProviderId];
  const providerMeta = IMAGE_PROVIDERS[selectedProviderId];
  const isServerConfigured = !!providerConfig?.isServerConfigured;
  const requiresApiKey = providerConfig?.requiresApiKey ?? true;

  // 从 providerOptions 读取激活模型，回退到全局状态
  const providerOpts = providerConfig?.providerOptions ?? undefined;
  const activeModelId =
    readOptString(providerOpts, 'activeModelId') ?? globalImageModelId ?? '';

  if (!providerConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>未找到该提供商的配置</Text>
      </View>
    );
  }

  const customModels = providerConfig.customModels ?? [];
  const providerName = providerMeta?.name ?? selectedProviderId;

  /** 打开新增模型 Sheet。 */
  const openAddModel = (): void => {
    setEditingIndex(null);
    setModelForm({ id: '', name: '' });
    setSheetOpen(true);
  };

  /** 打开编辑模型 Sheet。 */
  const openEditModel = (index: number): void => {
    const target = customModels[index];
    if (!target) return;
    setEditingIndex(index);
    setModelForm({ id: target.id, name: target.name });
    setSheetOpen(true);
  };

  /** 保存模型（新增或编辑）。 */
  const handleSaveModel = (): void => {
    const trimmedId = modelForm.id.trim();
    const trimmedName = modelForm.name.trim() || trimmedId;
    if (!trimmedId) return;

    const nextModels = [...customModels];
    if (editingIndex !== null) {
      nextModels[editingIndex] = { id: trimmedId, name: trimmedName };
    } else {
      // 去重：避免重复 id
      if (nextModels.some((m) => m.id === trimmedId)) return;
      nextModels.push({ id: trimmedId, name: trimmedName });
    }
    setImageProviderConfig(selectedProviderId, { customModels: nextModels });
    setSheetOpen(false);
  };

  /** 确认删除模型。 */
  const handleConfirmDelete = (): void => {
    if (deleteIndex === null) return;
    const nextModels = customModels.filter((_, i) => i !== deleteIndex);
    setImageProviderConfig(selectedProviderId, { customModels: nextModels });
    // 若删除的是当前激活模型，清空激活状态
    const deleted = customModels[deleteIndex];
    if (deleted && deleted.id === activeModelId) {
      setImageProviderConfig(selectedProviderId, {
        providerOptions: { ...providerOpts, activeModelId: '' },
      });
    }
    setDeleteIndex(null);
  };

  /** 设为当前激活模型。 */
  const setActiveModel = (modelId: string): void => {
    setImageProviderConfig(selectedProviderId, {
      providerOptions: { ...providerOpts, activeModelId: modelId },
    });
  };

  /** 处理图像生成测试按钮点击。 */
  const handleTest = async (): Promise<void> => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await fetch(resolveImageTestUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          modelId: activeModelId,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          prompt: '一只可爱的卡通猫',
          size: '1024x1024',
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (response.ok && data.success !== false) {
        setTestStatus('success');
        setTestMessage('图像生成测试成功');
      } else {
        setTestStatus('error');
        setTestMessage(`测试失败：${data.error ?? response.statusText}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(
        `测试失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader title={providerName} />

      {/* 启用/禁用开关 */}
      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Label>启用此提供商</Label>
            <Text style={styles.hint}>启用后可在图像生成功能中使用</Text>
          </View>
          <Switch
            value={providerConfig.enabled}
            onValueChange={(checked) =>
              setImageProviderConfig(selectedProviderId, { enabled: checked })
            }
          />
        </View>
      </Card>

      {/* 服务器托管提示 */}
      {isServerConfigured && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            此提供商由服务器统一配置，无需在此填写凭证。
          </Text>
        </View>
      )}

      {/* 凭证配置 */}
      {!isServerConfigured && (requiresApiKey || providerConfig.apiKey) && (
        <Card style={styles.section}>
          <SectionHeader title="API 凭证" />
          <View style={styles.field}>
            <Label>API Key</Label>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  value={providerConfig.apiKey}
                  onChangeText={(text) =>
                    setImageProviderConfig(selectedProviderId, { apiKey: text })
                  }
                  placeholder="请输入 API Key"
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>
              <IconButton
                icon={showApiKey ? 'eye-slash' : 'eye'}
                onPress={() => setShowApiKey((v) => !v)}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Label>Base URL</Label>
            <Input
              value={providerConfig.baseUrl}
              onChangeText={(text) =>
                setImageProviderConfig(selectedProviderId, { baseUrl: text })
              }
              placeholder="http://localhost:8000/v1"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="url"
            />
          </View>
        </Card>
      )}

      {/* 模型列表 CRUD */}
      <Card style={styles.section}>
        <SectionHeader
          title="模型列表"
          action={
            <Button size="sm" variant="outline" onPress={openAddModel}>
              + 新增
            </Button>
          }
        />
        {customModels.length === 0 ? (
          <Text style={styles.emptyText}>暂无模型，点击右上角新增</Text>
        ) : (
          <ScrollView style={styles.modelList} nestedScrollEnabled>
            {customModels.map((m, idx) => {
              const active = m.id === activeModelId;
              return (
                <View key={`${m.id}-${idx}`} style={styles.modelRow}>
                  <Pressable
                    onPress={() => setActiveModel(m.id)}
                    style={({ pressed }) => [
                      styles.modelRowInner,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <View style={styles.radioOuter}>
                      {active ? <View style={styles.radioInner} /> : null}
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.modelName}>{m.name}</Text>
                      <Text style={styles.modelId}>{m.id}</Text>
                    </View>
                  </Pressable>
                  <View style={styles.row}>
                    <IconButton
                      icon="edit"
                      size={16}
                      onPress={() => openEditModel(idx)}
                    />
                    <IconButton
                      icon="trash"
                      size={16}
                      color={colors.destructive}
                      onPress={() => setDeleteIndex(idx)}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </Card>

      {/* 连通性测试 */}
      <Card style={styles.section}>
        <SectionHeader title="连通性测试" />
        <Button
          onPress={handleTest}
          loading={testStatus === 'testing'}
          disabled={
            testStatus === 'testing' ||
            (requiresApiKey && !providerConfig.apiKey.trim() && !isServerConfigured)
          }
        >
          测试图像生成
        </Button>
        {testMessage ? (
          <View
            style={[
              styles.testResult,
              testStatus === 'success' && styles.testResultSuccess,
              testStatus === 'error' && styles.testResultError,
            ]}
          >
            <Text
              style={[
                styles.testResultText,
                testStatus === 'success' && styles.testResultTextSuccess,
                testStatus === 'error' && styles.testResultTextError,
              ]}
            >
              {testMessage}
            </Text>
          </View>
        ) : null}
      </Card>

      {/* 模型新增/编辑 Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingIndex === null ? '新增模型' : '编辑模型'}
      >
        <View style={styles.sheetContent}>
          <View style={styles.field}>
            <Label>模型 ID</Label>
            <Input
              value={modelForm.id}
              onChangeText={(text) => setModelForm((f) => ({ ...f, id: text }))}
              placeholder="例如 dall-e-3"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.field}>
            <Label>显示名称</Label>
            <Input
              value={modelForm.name}
              onChangeText={(text) => setModelForm((f) => ({ ...f, name: text }))}
              placeholder="留空则使用模型 ID"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.sheetActions}>
            <Button variant="outline" onPress={() => setSheetOpen(false)} style={styles.flex1}>
              取消
            </Button>
            <Button
              onPress={handleSaveModel}
              disabled={!modelForm.id.trim()}
              style={styles.flex1}
            >
              保存
            </Button>
          </View>
        </View>
      </Sheet>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIndex(null);
        }}
        title="删除模型"
        description="确定要删除此模型吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  section: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex1: { flex: 1 },
  field: { gap: 6, marginBottom: 8 },
  hint: { fontSize: 11, color: colors.muted, marginTop: 2 },
  emptyText: { color: colors.muted, textAlign: 'center', padding: 24 },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: { color: '#1D4ED8', fontSize: 12 },
  modelList: { maxHeight: 320 },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modelRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  modelName: { fontSize: 14, color: colors.foreground, fontWeight: '500' },
  modelId: { fontSize: 11, color: colors.muted, marginTop: 2 },
  testResult: { marginTop: 8, padding: 10, borderRadius: 8 },
  testResultSuccess: { backgroundColor: '#DCFCE7' },
  testResultError: { backgroundColor: colors.destructiveLight },
  testResultText: { fontSize: 12 },
  testResultTextSuccess: { color: colors.success },
  testResultTextError: { color: colors.destructive },
  buttonPressed: { opacity: 0.7 },
  sheetContent: { gap: 12, paddingBottom: 16 },
  sheetActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
