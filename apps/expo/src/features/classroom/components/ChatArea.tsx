import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LectureNotesView } from './LectureNotesView';
import { ChatSessionList } from './ChatSessionList';

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
          <Text style={[styles.tabIcon, activeTab === 'notes' && styles.tabIconActive]}>
            📖
          </Text>
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            笔记
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabIcon, activeTab === 'chat' && styles.tabIconActive]}>
            💬
          </Text>
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            聊天
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'notes' ? (
        <LectureNotesView />
      ) : (
        <ChatSessionList />
      )}
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
    paddingBottom: 4,
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
  tabIcon: {
    fontSize: 12,
  },
  tabIconActive: {
    // icon stays same
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
  },
  tabTextActive: {
    color: '#242424',
  },
});
