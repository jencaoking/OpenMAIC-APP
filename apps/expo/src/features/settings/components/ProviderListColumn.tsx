/**
 * @file ProviderListColumn.tsx
 * @description 移动端提供商列表组件。
 *
 * 1:1 对应 Web 端 `components/settings/index.tsx` 中的 `ProviderListColumn` 与
 * `components/settings/provider-list.tsx` 中的 `ProviderList`，适配 React Native。
 *
 * - 使用 `FlatList` 渲染提供商列表（虚拟化以支持长列表）
 * - 每项：图标占位（首字母）+ 名称 + `serverConfigured` 徽章
 * - 选中项：紫色浅底 (#F5F3FF) + 紫色左边框
 * - 底部添加按钮（当 `onAdd` 提供时显示）
 *
 * 严格隔离规则：
 * - 仅使用 react-native 原生组件 + `./ui` 共享组件
 * - 不引用任何 Web 端包（shadcn/ui、lucide-react、@radix-ui/* 等）
 */

import type { ReactElement, ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { Button, colors } from './ui';

/**
 * 提供商列表项的最小结构（与 Web 端 ProviderListColumn 一致）。
 */
export interface ProviderListItem<T extends string> {
  /** 提供商 ID */
  id: T;
  /** 提供商显示名 */
  name: string;
  /** 可选图标 URL（移动端不展示远程图标，仅作为标识传递） */
  icon?: string;
}

/**
 * 提供商配置查询表的最小约束（仅读取 `isServerConfigured` 字段）。
 */
export interface ProviderConfigLookup {
  /** 是否由服务端托管配置 */
  isServerConfigured?: boolean;
}

/**
 * `ProviderListColumn` 组件 props。
 */
export interface ProviderListColumnProps<T extends string> {
  /** 待渲染的提供商列表 */
  providers: Array<ProviderListItem<T>>;
  /** 提供商 ID 到配置信息的查询表（仅用于读取 `isServerConfigured`） */
  configs: Record<string, ProviderConfigLookup>;
  /** 当前选中的提供商 ID */
  selectedId: T;
  /** 选中提供商的回调 */
  onSelect: (id: T) => void;
  /** 点击"添加"按钮的回调；未提供则不渲染按钮 */
  onAdd?: () => void;
  /** i18n 翻译函数（来自 `useSettingsI18n`） */
  t: (key: string) => string;
}

/**
 * 提供商列表列（RN 版）。
 *
 * 对应 Web 端 `ProviderListColumn` 与 `ProviderList`。Web 端是固定宽度的左侧栏，
 * 移动端适配为可滚动 FlatList 占满父容器宽度。
 *
 * @example
 * ```tsx
 * <ProviderListColumn
 *   providers={Object.values(PROVIDERS)}
 *   configs={providersConfig}
 *   selectedId={selectedProviderId}
 *   onSelect={setSelectedProviderId}
 *   t={t}
 * />
 * ```
 */
export function ProviderListColumn<T extends string>({
  providers,
  configs,
  selectedId,
  onSelect,
  onAdd,
  t,
}: ProviderListColumnProps<T>): ReactNode {
  const renderItem: ListRenderItem<ProviderListItem<T>> = ({ item }): ReactElement | null => {
    const isSelected = item.id === selectedId;
    const isServerConfigured = configs[item.id]?.isServerConfigured === true;
    const initial = item.name?.charAt(0)?.toUpperCase() ?? '?';

    return (
      <Pressable
        onPress={() => onSelect(item.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
        style={({ pressed }) => [
          styles.row,
          isSelected && styles.rowSelected,
          !isSelected && pressed && styles.rowPressed,
        ]}
      >
        {/* 选中态左边框 */}
        {isSelected ? <View style={styles.selectedLeftBar} /> : null}

        {/* 图标占位：用首字母圆角方块代替远程 SVG logo */}
        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
          <Text style={[styles.iconText, isSelected && styles.iconTextSelected]}>{initial}</Text>
        </View>

        {/* 提供商名称 */}
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        {/* 服务端配置徽章 */}
        {isServerConfigured ? (
          <View style={styles.serverBadge}>
            <Text style={styles.serverBadgeText}>{t('settings.serverConfigured')}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {onAdd ? (
        <View style={styles.footer}>
          <Button variant="outline" size="sm" onPress={onAdd} style={styles.addButton}>
            {`+ ${t('settings.addProviderButton')}`}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
  },
  rowSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderLeftWidth: 0, // 由 selectedLeftBar 显式提供
  },
  rowPressed: {
    backgroundColor: colors.mutedLight,
  },
  selectedLeftBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.mutedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: colors.primary,
  },
  iconText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.foreground,
  },
  iconTextSelected: {
    color: colors.white,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  serverBadge: {
    backgroundColor: colors.mutedLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  serverBadgeText: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
  },
  separator: {
    height: 4,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    width: '100%',
  },
});
