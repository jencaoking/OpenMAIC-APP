/**
 * 设置面板共享 UI 基础组件
 *
 * 移植自 Web 端 shadcn/ui，使用 React Native 原生组件实现。
 * - 零 Web 端依赖（无 shadcn/ui、@radix-ui/*、lucide-react）
 * - 零 @openmaic/storage 依赖，符合跨端隔离规则
 * - 所有可交互组件触摸目标 ≥ 44pt
 *
 * 设计令牌统一使用 `colors` 常量。
 *
 * 图标回退：因 @expo/vector-icons 未在 apps/expo 直接声明依赖，
 * 本文件使用 react-native-svg 内联 SVG 与纯文本符号（Unicode 字形）作为回退方案。
 * IconButton 的 `icon` prop 接受字符串，内部通过 ICON_GLYPHS 映射为 Unicode 字形，
 * 未命中的字符串将原样作为文本渲染。
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch as RNSwitch,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import type { PressableProps, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** 设计系统颜色令牌（语义化 token） */
export const colors = {
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  secondary: '#6366F1',
  accent: '#EC4899',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  foreground: '#0F172A',
  muted: '#6B7280',
  mutedLight: '#F3F4F6',
  border: '#E5E7EB',
  destructive: '#DC2626',
  destructiveLight: '#FEF2F2',
  success: '#16A34A',
  warning: '#D97706',
  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * FontAwesome 图标名 → Unicode 字形回退映射。
 * 当 @expo/vector-icons 不可用时，IconButton 使用此映射渲染图标。
 * 未命中的字符串将原样作为文本渲染。
 */
const ICON_GLYPHS: Record<string, string> = {
  close: '\u2715',
  times: '\u2715',
  'times-circle': '\u2715',
  x: '\u2715',
  plus: '+',
  'plus-circle': '+',
  add: '+',
  minus: '\u2212',
  'minus-circle': '\u2212',
  remove: '\u2212',
  check: '\u2713',
  'check-circle': '\u2713',
  'check-square': '\u2713',
  'chevron-down': '\u25BC',
  down: '\u25BC',
  'chevron-up': '\u25B2',
  up: '\u25B2',
  'chevron-left': '\u2039',
  left: '\u2039',
  'chevron-right': '\u203A',
  right: '\u203A',
  'arrow-right': '\u2192',
  'arrow-left': '\u2190',
  'arrow-up': '\u2191',
  'arrow-down': '\u2193',
  edit: '\u270E',
  pencil: '\u270E',
  trash: '\u232B',
  'trash-o': '\u232B',
  delete: '\u232B',
  cog: '\u2699',
  cogwheel: '\u2699',
  gear: '\u2699',
  settings: '\u2699',
  info: '\u2139',
  'info-circle': '\u2139',
  warning: '\u26A0',
  'exclamation-triangle': '\u26A0',
  refresh: '\u21BB',
  reload: '\u21BB',
  sync: '\u21BB',
  search: '\u{1F50D}',
  eye: '\u{1F441}',
  'eye-slash': '\u2014',
  copy: '\u2398',
  share: '\u2197',
  link: '\u26D3',
  external: '\u2197',
  'external-link': '\u2197',
  star: '\u2605',
  heart: '\u2665',
  user: '\u{1F464}',
  users: '\u{1F465}',
  lock: '\u{1F512}',
  unlock: '\u{1F513}',
  key: '\u{1F511}',
  bell: '\u{1F514}',
  home: '\u{1F3E0}',
  menu: '\u2630',
  bars: '\u2630',
};

/** 根据 icon 名称解析为可渲染的字形字符串 */
function resolveGlyph(icon: string): string {
  return ICON_GLYPHS[icon] ?? icon;
}

/** 内联 SVG 勾选图标（用于 Checkbox 选中态） */
function CheckIcon({ size = 16, color = colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// =========================================================================
// Button
// =========================================================================

/** Button 视觉变体 */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';

/** Button 尺寸：sm=32, md=40, lg=44, icon=36（最小高度，单位 pt） */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/** Button 组件属性 */
export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** 视觉变体，默认 primary */
  variant?: ButtonVariant;
  /** 尺寸，默认 md */
  size?: ButtonSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示加载指示器（加载时自动禁用） */
  loading?: boolean;
  /** 子元素（字符串将自动套用按钮文本样式） */
  children?: ReactNode;
  /** 自定义容器样式 */
  style?: StyleProp<ViewStyle>;
}

const BUTTON_MIN_HEIGHT: Record<ButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 44,
  icon: 36,
};

const BUTTON_VARIANT_STYLE: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: colors.destructive },
};

const BUTTON_TEXT_VARIANT_STYLE: Record<ButtonVariant, StyleProp<TextStyle>> = {
  primary: { color: colors.white },
  outline: { color: colors.foreground },
  ghost: { color: colors.primary },
  destructive: { color: colors.white },
};

/**
 * 按钮组件（对应 Web 端 shadcn Button）
 *
 * - primary：紫色背景白字
 * - outline：白色背景灰边框
 * - ghost：透明背景
 * - destructive：红色背景白字
 *
 * loading 时显示 ActivityIndicator 并自动禁用。
 * 触摸目标通过 hitSlop 扩展至 ≥ 44pt。
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const minHeight = BUTTON_MIN_HEIGHT[size];
  const containerVariant = BUTTON_VARIANT_STYLE[variant];
  const textVariant = BUTTON_TEXT_VARIANT_STYLE[variant];
  const spinnerColor = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        styles.buttonBase,
        { minHeight },
        containerVariant,
        isDisabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
        style,
      ]}
      {...rest}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} style={styles.buttonSpinner} />
        ) : null}
        {typeof children === 'string' || typeof children === 'number' ? (
          <Text style={[styles.buttonTextBase, textVariant]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}

// =========================================================================
// Input
// =========================================================================

/** Input 键盘类型 */
export type InputKeyboardType =
  | 'default'
  | 'email-address'
  | 'numeric'
  | 'phone-pad'
  | 'url'
  | 'number-pad'
  | 'decimal-pad'
  | 'visible-password';

/** Input 组件属性 */
export interface InputProps {
  /** 当前值 */
  value?: string;
  /** 值变化回调 */
  onChangeText?: (text: string) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 是否隐藏输入内容（密码） */
  secureTextEntry?: boolean;
  /** 自动大写策略 */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** 是否自动纠错 */
  autoCorrect?: boolean;
  /** 是否拼写检查 */
  spellCheck?: boolean;
  /** 键盘类型 */
  keyboardType?: InputKeyboardType;
  /** 是否可编辑 */
  editable?: boolean;
  /** 失焦回调 */
  onBlur?: () => void;
  /** 自定义样式 */
  style?: StyleProp<TextStyle>;
}

/**
 * 输入框组件（对应 Web 端 shadcn Input）
 *
 * - 高度 40，边框 #E5E7EB，圆角 8，内边距 12
 * - focus 时边框变紫色
 */
export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  autoCorrect,
  spellCheck,
  keyboardType = 'default',
  editable = true,
  onBlur,
  style,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      keyboardType={keyboardType}
      editable={editable}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        onBlur?.();
      }}
      style={[
        styles.inputBase,
        { borderColor: isFocused ? colors.primary : colors.border },
        !editable && styles.inputDisabled,
        style,
      ]}
    />
  );
}

// =========================================================================
// Label
// =========================================================================

/** Label 组件属性 */
export interface LabelProps {
  /** 标签文本 */
  children: ReactNode;
  /** 自定义样式 */
  style?: StyleProp<TextStyle>;
}

/**
 * 标签组件（对应 Web 端 shadcn Label）
 *
 * 字号 14，颜色 #374151，fontWeight 500。
 */
export function Label({ children, style }: LabelProps) {
  return <Text style={[styles.labelBase, style]}>{children}</Text>;
}

// =========================================================================
// Checkbox
// =========================================================================

/** Checkbox 组件属性 */
export interface CheckboxProps {
  /** 是否选中 */
  checked: boolean;
  /** 选中状态变化回调 */
  onCheckedChange?: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 旁边的标签文本 */
  label?: string;
}

/**
 * 复选框组件（对应 Web 端 shadcn Checkbox）
 *
 * - 尺寸 24x24
 * - 选中：紫色背景 + 白色勾（内联 SVG）
 * - 未选中：透明背景 + 灰色边框
 * - 触摸目标通过 hitSlop 扩展至 ≥ 44pt
 */
export function Checkbox({ checked, onCheckedChange, disabled = false, label }: CheckboxProps) {
  const handlePress = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.checkboxRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.checkboxBox,
          { backgroundColor: checked ? colors.primary : 'transparent' },
          !checked && styles.checkboxUnchecked,
          disabled && styles.buttonDisabled,
        ]}
      >
        {checked ? <CheckIcon size={16} color={colors.white} /> : null}
      </View>
      {label ? (
        <Text style={[styles.checkboxLabel, disabled && styles.buttonDisabled]}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

// =========================================================================
// Switch
// =========================================================================

/** Switch 组件属性 */
export interface SwitchProps {
  /** 当前开关状态 */
  value: boolean;
  /** 状态变化回调 */
  onValueChange: (value: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 开关组件（对应 Web 端 shadcn Switch）
 *
 * 使用 RN 原生 Switch，激活色为紫色（#7C3AED）。
 */
export function Switch({ value, onValueChange, disabled = false }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.border}
    />
  );
}

// =========================================================================
// AlertDialog
// =========================================================================

/** AlertDialog 组件属性 */
export interface AlertDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 打开状态变化回调（传入 false 表示请求关闭） */
  onOpenChange: (open: boolean) => void;
  /** 标题 */
  title?: string;
  /** 描述文本 */
  description?: string;
  /** 确认按钮文本，默认 "确认" */
  confirmText?: string;
  /** 取消按钮文本，默认 "取消" */
  cancelText?: string;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 是否为破坏性操作（确认按钮变红） */
  destructive?: boolean;
}

/**
 * 确认对话框（对应 Web 端 shadcn AlertDialog）
 *
 * - 使用 Modal 实现，遮罩层 rgba(0,0,0,0.5)
 * - 内容居中，白底圆角 12
 * - destructive 时确认按钮红色
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  destructive = false,
}: AlertDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable style={styles.alertOverlay} onPress={handleCancel}>
        <Pressable style={styles.alertContainer} onPress={() => {}}>
          {title ? <Text style={styles.alertTitle}>{title}</Text> : null}
          {description ? <Text style={styles.alertDescription}>{description}</Text> : null}
          <View style={styles.alertActions}>
            <Button variant="outline" size="md" onPress={handleCancel} style={styles.alertButton}>
              {cancelText}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              size="md"
              onPress={handleConfirm}
              style={styles.alertButton}
            >
              {confirmText}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =========================================================================
// Sheet
// =========================================================================

/** Sheet 组件属性 */
export interface SheetProps {
  /** 是否打开 */
  open: boolean;
  /** 打开状态变化回调（传入 false 表示请求关闭） */
  onOpenChange: (open: boolean) => void;
  /** 面板标题 */
  title?: string;
  /** 面板内容 */
  children?: ReactNode;
}

const SHEET_SLIDE_DISTANCE = 600;

/**
 * 底部弹出面板（对应 Web 端 shadcn Dialog/Sheet）
 *
 * - 使用 Modal + Animated 实现从底部滑入动画
 * - 遮罩层 rgba(0,0,0,0.5)
 * - 点击遮罩层关闭
 */
export function Sheet({ open, onOpenChange, title, children }: SheetProps) {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_SLIDE_DISTANCE)).current;

  // 打开：设置可见并执行滑入动画
  useEffect(() => {
    if (open) {
      setVisible(true);
      translateY.setValue(SHEET_SLIDE_DISTANCE);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 32,
        stiffness: 320,
      }).start();
    }
  }, [open, translateY]);

  // 关闭：执行滑出动画后隐藏
  useEffect(() => {
    if (!open && visible) {
      Animated.timing(translateY, {
        toValue: SHEET_SLIDE_DISTANCE,
        useNativeDriver: true,
        duration: 220,
      }).start(({ finished }) => {
        if (finished) {
          setVisible(false);
        }
      });
    }
  }, [open, visible, translateY]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandle} />
          {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

// =========================================================================
// Card
// =========================================================================

/** Card 组件属性 */
export interface CardProps {
  /** 卡片内容 */
  children: ReactNode;
  /** 自定义样式 */
  style?: StyleProp<ViewStyle>;
}

/**
 * 卡片容器（对应 Web 端 shadcn Card）
 *
 * 白底，边框 #E5E7EB，圆角 12，内边距 16。
 */
export function Card({ children, style }: CardProps) {
  return <View style={[styles.cardBase, style]}>{children}</View>;
}

// =========================================================================
// Badge
// =========================================================================

/** Badge 视觉变体 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive';

/** Badge 组件属性 */
export interface BadgeProps {
  /** 徽章内容 */
  children: ReactNode;
  /** 视觉变体，默认 default */
  variant?: BadgeVariant;
}

const BADGE_VARIANT_STYLE: Record<BadgeVariant, StyleProp<ViewStyle>> = {
  default: { backgroundColor: colors.mutedLight },
  success: { backgroundColor: '#DCFCE7' },
  warning: { backgroundColor: '#FEF3C7' },
  destructive: { backgroundColor: colors.destructiveLight },
};

const BADGE_TEXT_VARIANT_STYLE: Record<BadgeVariant, StyleProp<TextStyle>> = {
  default: { color: colors.foreground },
  success: { color: colors.success },
  warning: { color: colors.warning },
  destructive: { color: colors.destructive },
};

/**
 * 徽章组件（对应 Web 端 shadcn Badge）
 *
 * 小字号 11，圆角 4，内边距 4。
 */
export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badgeBase, BADGE_VARIANT_STYLE[variant]]}>
      <Text style={[styles.badgeTextBase, BADGE_TEXT_VARIANT_STYLE[variant]]}>{children}</Text>
    </View>
  );
}

// =========================================================================
// SectionHeader
// =========================================================================

/** SectionHeader 组件属性 */
export interface SectionHeaderProps {
  /** 标题文本 */
  title: string;
  /** 可选图标节点（建议传入内联 SVG 或 Unicode 字形文本） */
  icon?: ReactNode;
  /** 右侧操作区 */
  action?: ReactNode;
}

/**
 * 区块标题（对应 Web 端设置面板分区标题）
 *
 * 标题字号 16，fontWeight 600。
 */
export function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionHeaderLeft}>
        {icon ? <View style={styles.sectionHeaderIcon}>{icon}</View> : null}
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

// =========================================================================
// Divider
// =========================================================================

/** Divider 组件属性 */
export interface DividerProps {
  /** 自定义样式 */
  style?: StyleProp<ViewStyle>;
}

/**
 * 分隔线组件（对应 Web 端 shadcn Separator）
 *
 * 高度 1，颜色 #E5E7EB。
 */
export function Divider({ style }: DividerProps) {
  return <View style={[styles.dividerBase, style]} />;
}

// =========================================================================
// IconButton
// =========================================================================

/** IconButton 组件属性 */
export interface IconButtonProps {
  /** 图标名称（FontAwesome 名，回退渲染为 Unicode 字形；未命中则原样渲染） */
  icon: string;
  /** 点击回调 */
  onPress?: () => void;
  /** 图标字号，默认 20 */
  size?: number;
  /** 图标颜色，默认 colors.foreground */
  color?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式 */
  style?: StyleProp<ViewStyle>;
}

/**
 * 图标按钮（对应 Web 端 shadcn IconButton）
 *
 * - 最小 44x44 触摸区域
 * - icon 字符串通过 ICON_GLYPHS 映射为 Unicode 字形
 *
 * 注意：因 @expo/vector-icons 未在 apps/expo 直接声明依赖，
 * 此组件使用纯文本字形回退。后续若引入 @expo/vector-icons，
 * 可将内部 Text 渲染替换为 FontAwesome 组件。
 */
export function IconButton({
  icon,
  onPress,
  size = 20,
  color = colors.foreground,
  disabled = false,
  style,
}: IconButtonProps) {
  const glyph = resolveGlyph(icon);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={({ pressed }) => [
        styles.iconButtonBase,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={icon}
    >
      <Text style={[styles.iconButtonGlyph, { fontSize: size, color }]}>{glyph}</Text>
    </Pressable>
  );
}

// =========================================================================
// Styles
// =========================================================================

const styles = StyleSheet.create({
  // Button
  buttonBase: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSpinner: {
    marginRight: 4,
  },
  buttonTextBase: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
  },

  // Input
  inputBase: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.white,
  },
  inputDisabled: {
    backgroundColor: colors.surface,
    color: colors.muted,
  },

  // Label
  labelBase: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.foreground,
    flexShrink: 1,
  },

  // AlertDialog
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  alertButton: {
    flex: 1,
  },

  // Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },

  // Card
  cardBase: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },

  // Badge
  badgeBase: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: '600',
  },

  // SectionHeader
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  sectionHeaderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },

  // Divider
  dividerBase: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },

  // IconButton
  iconButtonBase: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconButtonGlyph: {
    fontWeight: '400',
  },
});
