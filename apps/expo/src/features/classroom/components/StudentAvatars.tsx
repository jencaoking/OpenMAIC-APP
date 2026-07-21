import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Student {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isSpeaking?: boolean;
  isThinking?: boolean;
}

interface StudentAvatarsProps {
  students?: Student[];
  size?: number;
}

// 演示学生数据
const DEFAULT_STUDENTS: Student[] = [
  { id: '1', name: 'Alice', avatar: 'A', color: '#22c55e' },
  { id: '2', name: 'Bob', avatar: 'B', color: '#f59e0b' },
  { id: '3', name: 'Charlie', avatar: 'C', color: '#3b82f6' },
  { id: '4', name: 'Diana', avatar: 'D', color: '#ef4444' },
  { id: '5', name: 'Eve', avatar: 'E', color: '#8b5cf6' },
];

/**
 * 学生头像列表。
 * 水平滚动显示，支持发言/思考状态指示。
 */
export function StudentAvatars({ students = DEFAULT_STUDENTS, size = 32 }: StudentAvatarsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {students.map((student) => (
        <View key={student.id} style={styles.studentItem}>
          {/* 头像 */}
          <View
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: student.color,
              },
              student.isSpeaking && styles.avatarSpeaking,
              student.isThinking && styles.avatarThinking,
            ]}
          >
            <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{student.avatar}</Text>
          </View>

          {/* 发言指示 */}
          {student.isSpeaking && (
            <View style={styles.speakingIndicator}>
              <View style={styles.speakingDot} />
            </View>
          )}

          {/* 思考指示 */}
          {student.isThinking && (
            <View style={styles.thinkingIndicator}>
              <Text style={styles.thinkingText}>💭</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  studentItem: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarSpeaking: {
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  avatarThinking: {
    borderColor: '#f59e0b',
  },
  avatarText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 1,
  },
  speakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  thinkingIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 1,
  },
  thinkingText: {
    fontSize: 10,
  },
});
