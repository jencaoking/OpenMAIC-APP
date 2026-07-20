import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedPressableProps extends PressableProps {
  /** 按下时的缩放比例 */
  scaleDown?: number;
  /** 弹簧配置 */
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

/**
 * 带按压缩放动画的 Pressable。
 * 使用 react-native-reanimated 实现流畅的 60fps 动画。
 */
export function AnimatedPressable({
  scaleDown = 0.95,
  springConfig = { damping: 15, stiffness: 400 },
  children,
  style,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleDown, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedTouchable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}
