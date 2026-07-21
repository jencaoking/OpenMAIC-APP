import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'teacher' | 'student' | 'assistant';
  name: string;
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  type: 'qa' | 'discussion' | 'lecture';
  title: string;
  status: 'active' | 'completed' | 'soft-closing';
  messages: ChatMessage[];
}

// 演示聊天数据
const DEMO_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    type: 'qa',
    title: '量子力学基础问答',
    status: 'completed',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        name: '张三',
        content: '量子叠加态是什么意思？',
        timestamp: '14:30',
      },
      {
        id: 'msg-2',
        role: 'teacher',
        name: 'AI 教师',
        content: '叠加态是指量子系统可以同时处于多个状态的线性组合中。最经典的例子是薛定谔的猫。',
        timestamp: '14:30',
      },
      {
        id: 'msg-3',
        role: 'student',
        name: '李四',
        content: '观测会导致叠加态坍缩吗？',
        timestamp: '14:31',
      },
      {
        id: 'msg-4',
        role: 'teacher',
        name: 'AI 教师',
        content: '是的！这就是量子力学的测量问题。观测会导致叠加态坍缩到一个确定的状态。',
        timestamp: '14:31',
      },
    ],
  },
  {
    id: 'session-2',
    type: 'discussion',
    title: '波粒二象性讨论',
    status: 'active',
    messages: [
      {
        id: 'msg-5',
        role: 'teacher',
        name: 'AI 教师',
        content: '大家对双缝实验有什么疑问吗？',
        timestamp: '14:35',
      },
    ],
  },
];

function getRoleColor(role: string): string {
  switch (role) {
    case 'teacher':
      return '#3b82f6';
    case 'user':
      return '#7c3aed';
    case 'student':
      return '#6366f1';
    default:
      return '#64748b';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return { label: '进行中', color: '#22c55e' };
    case 'completed':
      return { label: '已完成', color: '#94a3b8' };
    case 'soft-closing':
      return { label: '即将结束', color: '#f59e0b' };
    default:
      return { label: status, color: '#94a3b8' };
  }
}

export function ChatSessionList() {
  const [expandedId, setExpandedId] = useState<string | null>('session-1');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {DEMO_SESSIONS.map((session) => {
        const isExpanded = expandedId === session.id;
        const badge = getStatusBadge(session.status);

        return (
          <View key={session.id} style={styles.sessionCard}>
            {/* Session Header */}
            <Pressable
              style={styles.sessionHeader}
              onPress={() => setExpandedId(isExpanded ? null : session.id)}
            >
              <View style={styles.sessionHeaderLeft}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: session.type === 'qa' ? '#eff6ff' : '#fef3c7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: session.type === 'qa' ? '#3b82f6' : '#d97706' },
                    ]}
                  >
                    {session.type === 'qa' ? 'Q&A' : '讨论'}
                  </Text>
                </View>
                <Text style={styles.sessionTitle} numberOfLines={1}>
                  {session.title}
                </Text>
              </View>
              <View style={styles.sessionHeaderRight}>
                <View style={[styles.statusDot, { backgroundColor: badge.color }]} />
                <Text style={styles.expandIcon}>{isExpanded ? '▾' : '▸'}</Text>
              </View>
            </Pressable>

            {/* Messages */}
            {isExpanded && (
              <View style={styles.messagesContainer}>
                {session.messages.map((msg) => (
                  <View key={msg.id} style={styles.messageRow}>
                    <View style={[styles.msgAvatar, { backgroundColor: getRoleColor(msg.role) }]}>
                      <Text style={styles.msgAvatarText}>{msg.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.msgContent}>
                      <View style={styles.msgHeader}>
                        <Text style={styles.msgName}>{msg.name}</Text>
                        <Text style={styles.msgTime}>{msg.timestamp}</Text>
                      </View>
                      <Text style={styles.msgText}>{msg.content}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  sessionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  expandIcon: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  msgAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  msgContent: {
    flex: 1,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  msgName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  msgTime: {
    fontSize: 9,
    color: '#94a3b8',
  },
  msgText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
});
