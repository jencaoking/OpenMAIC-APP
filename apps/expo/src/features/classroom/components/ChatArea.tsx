import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

type Tab = 'notes' | 'chat';

export function ChatArea() {
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            📖 笔记
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            💬 聊天
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {activeTab === 'notes' ? (
          <View>
            <Text style={styles.sectionTitle}>课堂笔记</Text>
            <Text style={styles.noteText}>
              课堂笔记将在这里显示。随着课程播放，笔记会自动滚动到当前页面。
            </Text>
            <View style={styles.noteCard}>
              <Text style={styles.noteCardTitle}>什么是量子力学</Text>
              <Text style={styles.noteCardBody}>
                量子力学是物理学的一个基础分支，研究微观粒子的行为规律。
              </Text>
            </View>
            <View style={styles.noteCard}>
              <Text style={styles.noteCardTitle}>波粒二象性</Text>
              <Text style={styles.noteCardBody}>
                光和物质同时具有波和粒子的双重性质。
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>聊天记录</Text>
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatText}>暂无聊天记录</Text>
              <Text style={styles.emptyChatHint}>在 Roundtable 中发送消息开始对话</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  tabs: {
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#f1f5f9',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
  },
  tabTextActive: {
    color: '#242424',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#242424',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#737373',
    lineHeight: 18,
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  noteCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#242424',
    marginBottom: 4,
  },
  noteCardBody: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 16,
  },
  emptyChat: {
    alignItems: 'center',
    padding: 32,
  },
  emptyChatIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyChatText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  emptyChatHint: {
    fontSize: 11,
    color: '#cbd5e1',
  },
});
