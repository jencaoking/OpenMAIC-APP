/**
 * @file WaveformAnimation.tsx
 * @description 语音模式音频波形动画组件。
 *
 * 设计灵感：Siri / GPT-4o 语音模式，三层光晕 + 动态高度柱状波形。
 * 使用 react-native-reanimated 的 `useAnimatedStyle` + `withTiming`，
 * 所有动画运行于 UI 线程，不阻塞 JS 主线程。
 */
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  useDerivedValue,
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';

export interface WaveformAnimationProps {
  /** 实时音量（0~1）。 */
  level: number;
  /** 当前状态，决定配色。 */
  state: 'listening' | 'thinking' | 'speaking' | 'barge-in' | 'idle' | 'error';
  /** 直径（px）。 */
  size?: number;
}

const PALETTES: Record<WaveformAnimationProps['state'], { core: string; halo: string; bars: string }> = {
  listening: { core: '#3b82f6', halo: '#60a5fa', bars: '#93c5fd' },
  thinking: { core: '#8b5cf6', halo: '#a78bfa', bars: '#c4b5fd' },
  speaking: { core: '#10b981', halo: '#34d399', bars: '#6ee7b7' },
  'barge-in': { core: '#f59e0b', halo: '#fbbf24', bars: '#fcd34d' },
  idle: { core: '#9ca3af', halo: '#d1d5db', bars: '#e5e7eb' },
  error: { core: '#ef4444', halo: '#f87171', bars: '#fca5a5' },
};

/**
 * 单根波形柱。
 */
const WaveBar: React.FC<{
  index: number;
  total: number;
  level: SharedValue<number>;
  color: string;
  baseHeight: number;
}> = ({ index, total, level, color, baseHeight }) => {
  const phase = useMemo(() => (index / total) * Math.PI * 2, [index, total]);

  const animatedStyle = useAnimatedStyle(() => {
    // 每根柱子叠加正弦相位，形成围绕中心呼吸的波形
    const wave = Math.sin(phase + level.value * 8) * 0.5 + 0.5;
    const height = baseHeight * (0.2 + level.value * 1.5 + wave * 0.3 * level.value);
    return {
      height: Math.max(4, Math.min(height, baseHeight * 2.5)),
      backgroundColor: color,
      opacity: interpolate(level.value, [0, 0.3, 1], [0.4, 0.7, 1]),
    };
  });

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

/**
 * 全屏沉浸式波形动画。
 */
export const WaveformAnimation: React.FC<WaveformAnimationProps> = ({
  level,
  state,
  size = 280,
}) => {
  const palette = PALETTES[state] ?? PALETTES.idle;
  const levelShared = useSharedValue(level);

  useEffect(() => {
    levelShared.value = withTiming(level, {
      duration: 80,
      easing: Easing.out(Easing.quad),
    });
  }, [level, levelShared]);

  // 三层光晕的呼吸缩放
  const haloScale1 = useSharedValue(1);
  const haloScale2 = useSharedValue(1);
  const haloScale3 = useSharedValue(1);

  useEffect(() => {
    const base = 1 + level * 0.4;
    haloScale1.value = withRepeat(
      withSequence(
        withTiming(base * 1.05, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(base * 0.95, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    haloScale2.value = withRepeat(
      withSequence(
        withTiming(base * 1.15, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(base * 0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    haloScale3.value = withRepeat(
      withSequence(
        withTiming(base * 1.25, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(base * 0.85, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [level, haloScale1, haloScale2, haloScale3]);

  const halo1Style = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale1.value }],
    opacity: interpolate(levelShared.value, [0, 0.5, 1], [0.3, 0.4, 0.6]),
  }));
  const halo2Style = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale2.value }],
    opacity: interpolate(levelShared.value, [0, 0.5, 1], [0.2, 0.3, 0.5]),
  }));
  const halo3Style = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale3.value }],
    opacity: interpolate(levelShared.value, [0, 0.5, 1], [0.1, 0.2, 0.4]),
  }));

  const coreScale = useDerivedValue(() => 1 + levelShared.value * 0.3);
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));

  const bars = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 三层光晕 */}
      <Animated.View
        style={[styles.halo, halo3Style, { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.halo }]}
      />
      <Animated.View
        style={[styles.halo, halo2Style, { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4, backgroundColor: palette.halo }]}
      />
      <Animated.View
        style={[styles.halo, halo1Style, { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, backgroundColor: palette.halo }]}
      />

      {/* 中心圆 */}
      <Animated.View
        style={[
          styles.core,
          coreStyle,
          { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175, backgroundColor: palette.core },
        ]}
      />

      {/* 环形波形柱阵列 */}
      <View style={[styles.barsRing, { width: size * 1.1, height: size * 1.1 }]}>
        {bars.map((i) => (
          <View
            key={i}
            style={[
              styles.barSlot,
              {
                transform: [
                  { rotate: `${(i / bars.length) * 360}deg` },
                  { translateY: -size * 0.5 },
                ],
              },
            ]}
          >
            <WaveBar
              index={i}
              total={bars.length}
              level={levelShared}
              color={palette.bars}
              baseHeight={size * 0.08}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    opacity: 0.3,
  },
  core: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  barsRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barSlot: {
    position: 'absolute',
    width: 4,
    alignItems: 'center',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
