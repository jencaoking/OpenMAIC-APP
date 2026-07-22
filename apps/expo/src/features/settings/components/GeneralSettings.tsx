/**
 * @file GeneralSettings.tsx
 * @description 通用设置面板（移动端）。
 *
 * 1:1 对应 Web 端 `components/settings/general-settings.tsx` 的功能。
 *
 * 主要功能：
 * - 顶部：`UsageDashboard` 用量统计仪表板
 * - 危险区域：清空本地缓存
 *   - 红色边框卡片 + ⚠ 标识
 *   - 点击「清空本地缓存」打开确认 Modal
 *   - Modal 内含确认输入框（必须输入指定文本才能确认）
 *   - 确认后清空持久化设置并通过 `Updates.reloadAsync()` 重启应用
 *
 * 清空缓存实现说明：
 * - 任务规格要求 `AsyncStorage.clear()`，但本项目未安装 `@react-native-async-storage/async-storage`，
 *   且实际持久化后端为 `expo-secure-store`（见 `settingsStore.ts`）。
 * - 此处通过 `useSettingsStore.persist.getOptions()` 获取持久化 key 名，再显式调用
 *   `SecureStore.deleteItemAsync(key)` 删除持久化数据（await 避免与 reloadAsync 竞态），
 *   等效于清空全部持久化设置；同时调用 `persist.clearStorage()` 通知 zustand 清理内存状态。
 * - 之后调用 `Updates.reloadAsync()` 重启应用（expo-updates ~57 中 `reloadFromCache`
 *   已被 `reloadAsync` 取代）；在开发环境（无 OTA 通道）下会回退到提示用户手动重启。
 *
 * 严格隔离规则：
 * - 仅依赖 `react-native`、`expo-updates`、`expo-secure-store`、`./ui`、`./UsageDashboard`、`../i18n`、`../settingsStore`
 * - 不引用 `@openmaic/storage` 运行时
 * - 不引用 Web 端 `@/lib/utils/database`、`@/lib/logger`、`sonner` 等
 */

import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import * as SecureStore from 'expo-secure-store';

import { Button, Input, colors } from './ui';
import { UsageDashboard } from './UsageDashboard';
import { useSettingsI18n } from '../i18n';
import { useSettingsStore } from '../settingsStore';

/**
 * GeneralSettings 组件属性。
 *
 * 当前无外部属性，预留以备未来扩展（如自定义 API URL 透传给 UsageDashboard）。
 */
export interface GeneralSettingsProps {
  /** 可选的自定义 API 基础 URL，透传给 UsageDashboard。 */
  apiBaseUrl?: string;
}

/**
 * 通用设置面板组件。
 *
 * 包含用量统计与危险区域（清空缓存）两个区块。
 *
 * @param props - 组件属性
 * @returns React 节点
 */
export function GeneralSettings({ apiBaseUrl }: GeneralSettingsProps): ReactNode {
  const { t } = useSettingsI18n();

  // 清空缓存相关状态
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [clearing, setClearing] = useState(false);

  const confirmPhrase = t('settings.clearCacheConfirmPhrase');
  const isConfirmValid = confirmInput === confirmPhrase;

  /**
   * 打开确认对话框（重置已输入文本）。
   */
  const handleOpenClearDialog = useCallback(() => {
    setConfirmInput('');
    setShowClearDialog(true);
  }, []);

  /**
   * 关闭确认对话框（清空过程中禁止关闭）。
   */
  const handleCloseClearDialog = useCallback(() => {
    if (clearing) return;
    setShowClearDialog(false);
    setConfirmInput('');
  }, [clearing]);

  /**
   * 执行清空缓存：
   * 1. 通过 `SecureStore.deleteItemAsync` 显式删除持久化设置（await 避免与 reloadAsync 竞态）
   * 2. 调用 `useSettingsStore.persist.clearStorage()` 通知 zustand 清理内存状态
   * 3. 调用 `Updates.reloadAsync()` 重启应用
   * 4. 在开发环境（reloadAsync 失败）回退到提示用户手动重启
   *
   * 注：zustand 的 `clearStorage()` 不会 await 底层异步 `removeItem`，直接调用可能与
   * `reloadAsync()` 产生竞态。因此此处显式 await `SecureStore.deleteItemAsync` 确保
   * 持久化数据在重启前已被清除。
   */
  const handleClearCache = useCallback(async () => {
    if (!isConfirmValid) return;
    setClearing(true);
    try {
      // 1. 显式删除 SecureStore 中的持久化 key（await 确保完成）
      const persistOptions = useSettingsStore.persist.getOptions();
      const storageKey = persistOptions.name;
      if (storageKey) {
        await SecureStore.deleteItemAsync(storageKey);
      }

      // 2. 通知 zustand 清理内存状态（fire-and-forget 即可，因为持久化已删）
      useSettingsStore.persist.clearStorage();

      // 3. 尝试通过 OTA 通道重启应用
      try {
        await Updates.reloadAsync();
      } catch {
        // 开发环境 / 无 OTA 通道：提示用户手动重启
        // 此时设置已被清空，无需回滚 clearing 状态
        Alert.alert(t('settings.clearCacheSuccess'), '请手动重启应用以使设置生效。', [
          { text: t('common.confirm'), onPress: () => setShowClearDialog(false) },
        ]);
        return;
      }

      // 正常情况下 reloadAsync 会立即重启，后续代码不会执行
      setShowClearDialog(false);
    } catch (error) {
      // 清空失败：恢复 UI 状态，提示用户
      console.warn('[GeneralSettings] Failed to clear cache:', error);
      Alert.alert(t('settings.clearCacheFailed'));
      setClearing(false);
    }
  }, [isConfirmValid, t]);

  // 解析确认对话框中要展示的待删除项列表
  const clearCacheItems = t('settings.clearCacheConfirmItems')
    .split('、')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <View style={styles.container}>
      {/* 用量统计仪表板 */}
      <UsageDashboard apiBaseUrl={apiBaseUrl} />

      {/* 危险区域：清空本地缓存 */}
      <View style={styles.dangerZoneOuter}>
        <View style={styles.dangerZoneInner}>
          {/* Header */}
          <View style={styles.dangerHeader}>
            <View style={styles.dangerIconBadge}>
              <Text style={styles.dangerIconGlyph}>{'\u26A0'}</Text>
            </View>
            <Text style={styles.dangerHeaderText}>{t('settings.dangerZone')}</Text>
          </View>

          {/* Content */}
          <View style={styles.dangerContentRow}>
            <View style={styles.dangerContentTextWrap}>
              <Text style={styles.dangerContentTitle}>{t('settings.clearCache')}</Text>
              <Text style={styles.dangerContentDesc}>{t('settings.clearCacheDescription')}</Text>
            </View>
            <Button
              variant="destructive"
              size="sm"
              onPress={handleOpenClearDialog}
              style={styles.dangerButton}
            >
              {t('settings.clearCache')}
            </Button>
          </View>
        </View>
      </View>

      {/* 清空缓存确认 Modal */}
      <ClearCacheConfirmDialog
        open={showClearDialog}
        clearing={clearing}
        confirmInput={confirmInput}
        confirmPhrase={confirmPhrase}
        isConfirmValid={isConfirmValid}
        items={clearCacheItems}
        onConfirmInput={setConfirmInput}
        onCancel={handleCloseClearDialog}
        onConfirm={handleClearCache}
        t={t}
      />
    </View>
  );
}

// =========================================================================
// ClearCacheConfirmDialog — 自定义确认 Modal（含输入框）
// =========================================================================

/**
 * ClearCacheConfirmDialog 组件属性。
 */
interface ClearCacheConfirmDialogProps {
  /** 是否打开。 */
  open: boolean;
  /** 是否正在清空中。 */
  clearing: boolean;
  /** 当前输入文本。 */
  confirmInput: string;
  /** 必须输入的确认短语。 */
  confirmPhrase: string;
  /** 输入是否匹配确认短语。 */
  isConfirmValid: boolean;
  /** 待删除项列表。 */
  items: string[];
  /** 输入文本变化回调。 */
  onConfirmInput: (text: string) => void;
  /** 取消回调。 */
  onCancel: () => void;
  /** 确认回调。 */
  onConfirm: () => void;
  /** 翻译函数。 */
  t: ReturnType<typeof useSettingsI18n>['t'];
}

/**
 * 清空缓存确认对话框（自定义 Modal，含输入框与待删除项列表）。
 *
 * 共享 UI 的 `AlertDialog` 不支持 children（无法嵌入输入框），
 * 因此这里使用 `Modal` + `Input` 自定义实现。
 *
 * @param props - 组件属性
 * @returns React 节点
 */
function ClearCacheConfirmDialog({
  open,
  clearing,
  confirmInput,
  confirmPhrase,
  isConfirmValid,
  items,
  onConfirmInput,
  onCancel,
  onConfirm,
  t,
}: ClearCacheConfirmDialogProps): ReactNode {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          {/* 标题 */}
          <View style={styles.modalTitleRow}>
            <Text style={styles.modalTitleIcon}>{'\u26A0'}</Text>
            <Text style={styles.modalTitleText}>{t('settings.clearCacheConfirmTitle')}</Text>
          </View>

          {/* 描述 */}
          <Text style={styles.modalDescriptionText}>
            {t('settings.clearCacheConfirmDescription')}
          </Text>

          {/* 待删除项列表 */}
          <View style={styles.modalItemList}>
            {items.map((item, i) => (
              <View key={`${item}-${i}`} style={styles.modalItemRow}>
                <View style={styles.modalItemDot} />
                <Text style={styles.modalItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* 确认输入框 */}
          <View style={styles.modalInputWrap}>
            <Text style={styles.modalInputLabel}>{t('settings.clearCacheConfirmInput')}</Text>
            <Input
              value={confirmInput}
              onChangeText={onConfirmInput}
              placeholder={confirmPhrase}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              editable={!clearing}
              style={styles.modalInput}
            />
          </View>

          {/* 操作按钮 */}
          <View style={styles.modalActions}>
            <Button
              variant="outline"
              size="md"
              onPress={onCancel}
              disabled={clearing}
              style={styles.modalActionButton}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              size="md"
              onPress={onConfirm}
              disabled={!isConfirmValid || clearing}
              loading={clearing}
              style={styles.modalActionButton}
            >
              {t('settings.clearCacheButton')}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =========================================================================
// Styles
// =========================================================================

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },

  // Danger zone
  dangerZoneOuter: {
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 12,
    backgroundColor: colors.destructiveLight,
    overflow: 'hidden',
  },
  dangerZoneInner: {
    padding: 16,
    gap: 16,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIconGlyph: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  dangerHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.destructive,
  },
  dangerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dangerContentTextWrap: {
    flex: 1,
    gap: 4,
  },
  dangerContentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  dangerContentDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  dangerButton: {
    flexShrink: 0,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalTitleIcon: {
    fontSize: 18,
    color: colors.destructive,
    fontWeight: '600',
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.destructive,
    flex: 1,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  modalItemList: {
    gap: 6,
    marginBottom: 16,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.destructive,
  },
  modalItemText: {
    fontSize: 13,
    color: colors.foreground,
    flex: 1,
  },
  modalInputWrap: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 6,
  },
  modalInput: {
    height: 36,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
  },
});
