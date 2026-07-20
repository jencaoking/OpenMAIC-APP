import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';

interface ProactiveCardProps {
  /** 邀请标题 */
  title?: string;
  /** 邀请内容 */
  message?: string;
  /** 倒计时秒数 */
  countdown?: number;
  /** 加入回调 */
  onJoin: () => void;
  /** 跳过回调 */
  onSkip: () => void;
  /** 是否显示 */
  visible?: boolean;
}

/**
 * 讨论邀请卡片。
 * 当 AI 教师发起讨论时显示，用户可以选择加入或跳过。
 */
export function ProactiveCard({
  title = '加入讨论',
  message = 'AI 教师邀请你参与课堂讨论',
  countdown = 30,
  onJoin,
  onSkip,
  visible = true,
}: ProactiveCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [remaining, setRemaining] = React.useState(countdown);

  useEffect(() => {
    if (visible) {
      // 入场动画
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // 倒计时
      const timer = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onSkip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* 内容 */}
      <Text style={styles.message}>{message}</Text>

      {/* 倒计时 */}
      <View style={styles.countdownRow}>
        <View style={styles.countdownBar}>
          <View
            style={[
              styles.countdownFill,
              { width: `${(remaining / countdown) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.countdownText}>{remaining}s</Text>
      </View>

      {/* 按钮 */}
      <View style={styles.buttons}>
        <Pressable style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipText}>跳过</Text>
        </Pressable>
        <Pressable style={styles.joinBtn} onPress={onJoin}>
          <Text style={styles.joinText}>加入讨论</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  message: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  countdownBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  skipBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  joinBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  joinText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
