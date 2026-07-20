import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAgentRegistry } from '../store/agentRegistry';
import { VoicePill } from './VoicePill';
import type { AgentConfig } from '../types/agent';

interface AgentBarProps {
  onAgentSelect?: (agentIds: string[]) => void;
}

/**
 * Agent 选择栏。
 * 显示可选的 Agent 列表，支持切换选择。
 */
export function AgentBar({ onAgentSelect }: AgentBarProps) {
  const { agents, selectedAgentIds, agentMode, setAgentMode, toggleAgent } = useAgentRegistry();
  const [isExpanded, setIsExpanded] = useState(false);

  const agentList = Object.values(agents);
  const selectedCount = selectedAgentIds.length;

  const handleToggleAgent = (id: string) => {
    toggleAgent(id);
    // 通知父组件
    const newSelected = selectedAgentIds.includes(id)
      ? selectedAgentIds.filter((sid) => sid !== id)
      : [...selectedAgentIds, id];
    onAgentSelect?.(newSelected);
  };

  return (
    <View style={styles.container}>
      {/* 折叠状态：显示选中的 Agent 头像 */}
      <Pressable style={styles.pill} onPress={() => setIsExpanded(!isExpanded)}>
        {/* 教师头像 */}
        {agentList
          .filter((a) => a.role === 'teacher' && selectedAgentIds.includes(a.id))
          .slice(0, 1)
          .map((a) => (
            <View
              key={a.id}
              style={[styles.miniAvatar, { backgroundColor: a.color, zIndex: 3 }]}
            >
              <Text style={styles.miniAvatarText}>{a.avatar}</Text>
            </View>
          ))}

        {/* 学生头像 */}
        {agentList
          .filter((a) => a.role !== 'teacher' && selectedAgentIds.includes(a.id))
          .slice(0, 2)
          .map((a, i) => (
            <View
              key={a.id}
              style={[styles.miniAvatar, { backgroundColor: a.color, zIndex: 2 - i }]}
            >
              <Text style={styles.miniAvatarText}>{a.avatar}</Text>
            </View>
          ))}

        <Text style={styles.countText}>{selectedCount}</Text>
      </Pressable>

      {/* 展开状态：Agent 列表 */}
      {isExpanded && (
        <View style={styles.dropdown}>
          {/* 模式切换 */}
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeBtn, agentMode === 'preset' && styles.modeBtnActive]}
              onPress={() => setAgentMode('preset')}
            >
              <Text style={[styles.modeText, agentMode === 'preset' && styles.modeTextActive]}>
                手动选择
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, agentMode === 'auto' && styles.modeBtnActive]}
              onPress={() => setAgentMode('auto')}
            >
              <Text style={[styles.modeText, agentMode === 'auto' && styles.modeTextActive]}>
                自动生成
              </Text>
            </Pressable>
          </View>

          {/* Agent 列表 */}
          <ScrollView style={styles.agentList} showsVerticalScrollIndicator={false}>
            {agentList.map((agent) => {
              const isSelected = selectedAgentIds.includes(agent.id);
              const isTeacher = agent.role === 'teacher';

              return (
                <Pressable
                  key={agent.id}
                  style={[styles.agentRow, isSelected && styles.agentRowSelected]}
                  onPress={() => !isTeacher && handleToggleAgent(agent.id)}
                >
                  {/* 选择框 */}
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  {/* 头像 */}
                  <View style={[styles.avatar, { borderColor: agent.color }]}>
                    <Text style={styles.avatarText}>{agent.avatar}</Text>
                  </View>

                  {/* 信息 */}
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.agentRole}>{getRoleLabel(agent.role)}</Text>
                  </View>

                  {/* 声音选择 */}
                  {isSelected && (
                    <VoicePill
                      agentId={agent.id}
                      agentIndex={selectedAgentIds.indexOf(agent.id)}
                      isTeacher={isTeacher}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'teacher': return '教师';
    case 'assistant': return '助教';
    case 'student': return '学生';
    default: return role;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(12px)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  miniAvatarText: {
    fontSize: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 280,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  modeRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#f3e8ff',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  modeTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  agentList: {
    maxHeight: 300,
    padding: 8,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
  },
  agentRowSelected: {
    backgroundColor: '#faf5ff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  checkmark: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#242424',
  },
  agentRole: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
