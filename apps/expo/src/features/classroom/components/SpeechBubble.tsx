import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface SpeechBubbleProps {
  /** 发言内容 */
  text: string | null;
  /** 发言者角色 */
  role?: 'teacher' | 'user' | 'student' | 'assistant';
  /** 是否正在流式输出 */
  isStreaming?: boolean;
}

/**
 * 对话气泡组件。
 * 支持打字动画效果。
 */
export function SpeechBubble({
  text,
  role = 'teacher',
  isStreaming = false,
}: SpeechBubbleProps) {
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // 打字光标闪烁动画
  useEffect(() => {
    if (isStreaming) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      cursorOpacity.setValue(0);
    }
  }, [isStreaming, cursorOpacity]);

  if (!text && !isStreaming) return null;

  const bgColor = getRoleBgColor(role);
  const textColor = getRoleTextColor(role);
  const borderRadius = getRoleBorderRadius(role);

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderRadius }]}>
      <Text style={[styles.text, { color: textColor }]} numberOfLines={0}>
        {text}
        {isStreaming && (
          <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
            ▌
          </Animated.Text>
        )}
      </Text>
    </View>
  );
}

function getRoleBgColor(role: string): string {
  switch (role) {
    case 'teacher':
      return '#ffffff';
    case 'user':
      return 'rgba(114, 46, 209, 0.95)';
    case 'student':
      return '#eef2ff';
    default:
      return '#f8fafc';
  }
}

function getRoleTextColor(role: string): string {
  switch (role) {
    case 'teacher':
      return '#242424';
    case 'user':
      return '#ffffff';
    case 'student':
      return '#334155';
    default:
      return '#64748b';
  }
}

function getRoleBorderRadius(role: string): number {
  switch (role) {
    case 'teacher':
      return 16;
    case 'user':
      return 16;
    default:
      return 12;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
  },
  cursor: {
    fontSize: 12,
    color: '#7c3aed',
  },
});
