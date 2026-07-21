import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';

interface NoteItem {
  id: string;
  sceneIndex: number;
  title: string;
  content: string;
  timestamp?: string;
}

// 演示笔记数据
const DEMO_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    sceneIndex: 0,
    title: '什么是量子力学',
    content: '量子力学是物理学的一个基础分支，研究微观粒子的行为规律。',
    timestamp: '00:00',
  },
  {
    id: 'note-2',
    sceneIndex: 1,
    title: '波粒二象性',
    content: '光和物质同时具有波和粒子的双重性质。双缝实验是核心验证。',
    timestamp: '02:30',
  },
  {
    id: 'note-3',
    sceneIndex: 2,
    title: '不确定性原理',
    content: '海森堡不确定性原理：无法同时精确测量位置和动量。Δx · Δp ≥ ℏ/2',
    timestamp: '05:15',
  },
  {
    id: 'note-4',
    sceneIndex: 3,
    title: '量子叠加态',
    content: '叠加态是指量子系统可以同时处于多个状态的线性组合中。',
    timestamp: '08:00',
  },
  {
    id: 'note-5',
    sceneIndex: 4,
    title: '薛定谔的猫',
    content: '著名的思想实验：猫同时处于"活着"和"死了"的叠加态。',
    timestamp: '11:30',
  },
];

export function LectureNotesView() {
  const { currentSceneIndex, setCurrentSceneIndex } = useClassroomStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {DEMO_NOTES.map((note, index) => {
        const isCurrent = note.sceneIndex === currentSceneIndex;

        return (
          <Pressable
            key={note.id}
            style={[styles.noteCard, isCurrent && styles.noteCardActive]}
            onPress={() => setCurrentSceneIndex(note.sceneIndex)}
          >
            {/* Timeline dot */}
            <View style={styles.timelineRow}>
              <View style={[styles.dot, isCurrent && styles.dotActive]} />
              {index < DEMO_NOTES.length - 1 && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={styles.noteContent}>
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, isCurrent && styles.noteTitleActive]}>
                  {note.title}
                </Text>
                {note.timestamp && <Text style={styles.noteTime}>{note.timestamp}</Text>}
              </View>
              <Text style={styles.noteText} numberOfLines={3}>
                {note.content}
              </Text>
            </View>
          </Pressable>
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
  noteCard: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  noteCardActive: {
    // 高亮当前笔记
  },
  timelineRow: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginTop: 6,
  },
  dotActive: {
    backgroundColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    minHeight: 20,
  },
  noteContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  noteTitleActive: {
    color: '#7c3aed',
  },
  noteTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
  noteText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
});
