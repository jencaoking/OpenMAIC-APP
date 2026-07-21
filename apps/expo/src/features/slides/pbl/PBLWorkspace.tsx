import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { PBLProjectConfig, PBLChatMessage } from './pblTypes';
import { getActiveIssue } from './pblTypes';
import { PBLIssueboard } from './PBLIssueboard';
import { PBLChat } from './PBLChat';
import { usePBLStore } from './pblStore';

interface PBLWorkspaceProps {
  projectConfig: PBLProjectConfig;
  userRole: string;
  onConfigUpdate: (config: PBLProjectConfig) => void;
  onReset: () => void;
}

/**
 * PBL Workspace component.
 *
 * Port of Web's PBLWorkspace component.
 * Shows issueboard + chat in a tabbed layout (mobile-friendly).
 */
export function PBLWorkspace({
  projectConfig,
  userRole,
  onConfigUpdate,
  onReset,
}: PBLWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'chat'>('chat');
  const { messages, isLoading, setLoading } = usePBLStore();

  const currentIssue = getActiveIssue(projectConfig.issueboard);

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;

    // Add user message
    const userMessage: PBLChatMessage = {
      id: `msg_${Date.now()}`,
      agent_name: userRole,
      message: text,
      timestamp: Date.now(),
      read_by: [],
    };

    const newMessages = [...messages, userMessage];
    onConfigUpdate({
      ...projectConfig,
      chat: { messages: newMessages },
    });

    // Simulate agent response (in real implementation, this calls the API)
    setLoading(true);
    setTimeout(() => {
      const agentMessage: PBLChatMessage = {
        id: `msg_${Date.now() + 1}`,
        agent_name: currentIssue?.question_agent_name || 'AI Agent',
        message: `收到你的消息: "${text}"。这是一个模拟回复。在实际实现中，这将调用 PBL API 获取 Agent 回复。`,
        timestamp: Date.now(),
        read_by: [],
      };

      const updatedMessages = [...newMessages, agentMessage];
      onConfigUpdate({
        ...projectConfig,
        chat: { messages: updatedMessages },
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'issues' && styles.tabActive]}
          onPress={() => setActiveTab('issues')}
        >
          <Text style={[styles.tabText, activeTab === 'issues' && styles.tabTextActive]}>
            任务看板
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            聊天
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>重启</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'issues' ? (
          <PBLIssueboard issueboard={projectConfig.issueboard} />
        ) : (
          <PBLChat
            messages={messages}
            currentIssue={currentIssue}
            userRole={userRole}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#7c3aed',
  },
  resetButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 13,
    color: '#ef4444',
  },
  content: {
    flex: 1,
  },
});
