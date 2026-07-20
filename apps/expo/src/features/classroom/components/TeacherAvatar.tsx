import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';

interface TeacherAvatarProps {
  /** 教师名称 */
  name?: string;
  /** 头像 emoji 或图片 URL */
  avatar?: string;
  /** 尺寸 */
  size?: number;
}

/**
 * 教师头像组件。
 * 支持发言状态指示（绿色圆点 + 紫色光环）。
 */
export function TeacherAvatar({
  name = 'AI 教师',
  avatar = '👨‍🏫',
  size = 48,
}: TeacherAvatarProps) {
  const { speakingAgentId, engineMode } = useClassroomStore();
  const isSpeaking = speakingAgentId === 'teacher' || engineMode === 'live';

  const avatarSize = size;
  const ringSize = avatarSize + 8;
  const dotSize = avatarSize * 0.3;

  return (
    <View style={styles.container}>
      {/* 发言光环 */}
      <View
        style={[
          styles.glowRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            opacity: isSpeaking ? 0.4 : 0,
          },
        ]}
      />

      {/* 头像容器 */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
          isSpeaking && styles.avatarActive,
        ]}
      >
        <Text style={[styles.emoji, { fontSize: avatarSize * 0.4 }]}>{avatar}</Text>

        {/* 在线/发言指示点 */}
        {isSpeaking && (
          <View
            style={[
              styles.speakingDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
              },
            ]}
          />
        )}
      </View>

      {/* 名称标签 */}
      <View style={styles.nameTag}>
        <Text style={styles.nameText} numberOfLines={1}>
          {name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  avatarContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarActive: {
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  emoji: {
    // fontSize set dynamically
  },
  speakingDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#22c55e',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  nameTag: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  nameText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    color: '#7c3aed',
  },
});
