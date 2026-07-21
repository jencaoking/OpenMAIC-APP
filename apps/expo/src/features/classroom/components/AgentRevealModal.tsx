import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import type { AgentConfig } from '../types/agent';

interface AgentRevealModalProps {
  agents: Array<{
    id: string;
    name: string;
    role: string;
    persona: string;
    avatar: string;
    color: string;
  }>;
  visible: boolean;
  onClose: () => void;
  onAllRevealed?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

function getRoleIcon(role: string): string {
  switch (role) {
    case 'teacher':
      return '👨‍🏫';
    case 'assistant':
      return '🤝';
    case 'student':
      return '🎓';
    default:
      return '👤';
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'teacher':
      return '教师';
    case 'assistant':
      return '助教';
    case 'student':
      return '学生';
    default:
      return role;
  }
}

/**
 * Agent 揭示模态框。
 * 3D 翻转卡片动画，逐个揭示 Agent。
 */
export function AgentRevealModal({
  agents,
  visible,
  onClose,
  onAllRevealed,
}: AgentRevealModalProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      setRevealedCount(0);
      setAllDone(false);
      return;
    }

    // 逐个揭示卡片
    const timer = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= agents.length) {
          clearInterval(timer);
          setTimeout(() => {
            setAllDone(true);
            onAllRevealed?.();
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [visible, agents.length]);

  if (!visible || agents.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 标题 */}
          <Text style={styles.title}>认识你的 AI 课堂团队</Text>
          <Text style={styles.subtitle}>
            {revealedCount} / {agents.length} 已揭示
          </Text>

          {/* 卡片网格 */}
          <View style={styles.cardGrid}>
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={index}
                isRevealed={index < revealedCount}
                delay={index * 100}
              />
            ))}
          </View>

          {/* 进度点 */}
          <View style={styles.dots}>
            {agents.map((_, index) => (
              <View key={index} style={[styles.dot, index < revealedCount && styles.dotActive]} />
            ))}
          </View>

          {/* 关闭按钮 */}
          {allDone && (
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>继续</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface AgentCardProps {
  agent: { id: string; name: string; role: string; persona: string; avatar: string; color: string };
  index: number;
  isRevealed: boolean;
  delay: number;
}

function AgentCard({ agent, index, isRevealed, delay }: AgentCardProps) {
  const rotateY = useSharedValue(180);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (isRevealed) {
      rotateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
      scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 }));
    }
  }, [isRevealed]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${rotateY.value}deg` }, { scale: scale.value }],
  }));

  return (
    <AnimatedView style={[styles.card, cardStyle]}>
      {isRevealed ? (
        <View style={styles.cardFront}>
          {/* 顶部渐变 */}
          <View style={[styles.cardGradient, { backgroundColor: agent.color }]} />

          {/* 头像 */}
          <View style={[styles.avatarContainer, { borderColor: agent.color }]}>
            <Text style={styles.avatarEmoji}>{agent.avatar}</Text>
          </View>

          {/* 信息 */}
          <Text style={styles.agentName}>{agent.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: agent.color + '20' }]}>
            <Text style={[styles.roleText, { color: agent.color }]}>
              {getRoleIcon(agent.role)} {getRoleLabel(agent.role)}
            </Text>
          </View>

          {/* 分割线 */}
          <View style={styles.divider} />

          {/* Persona */}
          <Text style={styles.persona} numberOfLines={3}>
            {agent.persona}
          </Text>
        </View>
      ) : (
        <View style={styles.cardBack}>
          <Text style={styles.questionMark}>?</Text>
        </View>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardFront: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 12,
    paddingHorizontal: 10,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    opacity: 0.3,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#242424',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  persona: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
    textAlign: 'center',
  },
  cardBack: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 36,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#7c3aed',
  },
  closeBtn: {
    paddingHorizontal: 32,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
