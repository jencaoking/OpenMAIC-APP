import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';

export function Roundtable() {
  const { lectureSpeech, speakingAgentId, engineMode } = useClassroomStore();
  const [inputText, setInputText] = useState('');

  const isSpeaking = speakingAgentId !== null;
  const speechText = lectureSpeech || (engineMode === 'idle' ? null : '等待播放...');

  return (
    <View style={styles.container}>
      {/* Teacher Column */}
      <View style={styles.teacherColumn}>
        <View style={styles.teacherGradient} />
        <View style={[styles.teacherAvatar, isSpeaking && styles.teacherAvatarActive]}>
          <Text style={styles.teacherEmoji}>👨‍🏫</Text>
          {isSpeaking && <View style={styles.speakingDot} />}
        </View>
        <Text style={styles.teacherName}>AI 教师</Text>
      </View>

      {/* Center Stage */}
      <View style={styles.centerStage}>
        <View style={styles.chatCard}>
          {/* Speech Bubble */}
          {speechText && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{speechText}</Text>
            </View>
          )}

          {/* Thinking Dots */}
          {engineMode === 'live' && (
            <View style={styles.thinkingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          )}

          {/* Text Input */}
          <View style={styles.inputPill}>
            <TextInput
              style={styles.input}
              placeholder="输入消息..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
            />
            <Pressable style={styles.sendBtn}>
              <Text style={styles.sendIcon}>↑</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Students Column */}
      <View style={styles.studentsColumn}>
        <View style={[styles.studentAvatar, { backgroundColor: '#22c55e' }]}>
          <Text style={styles.studentText}>A</Text>
        </View>
        <View style={[styles.studentAvatar, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.studentText}>B</Text>
        </View>
        <View style={[styles.studentAvatar, { backgroundColor: '#3b82f6' }]}>
          <Text style={styles.studentText}>C</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
  },
  // Teacher
  teacherColumn: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  teacherGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(250,245,255,0.5)',
  },
  teacherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  teacherAvatarActive: {
    shadowOpacity: 0.5,
  },
  teacherEmoji: {
    fontSize: 18,
  },
  speakingDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  teacherName: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    color: '#7c3aed',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    overflow: 'hidden',
  },
  // Center Stage
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCard: {
    width: '100%',
    maxWidth: 400,
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8))',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  bubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#242424',
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    padding: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b5cf6',
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 11,
    color: '#242424',
    padding: 0,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  sendIcon: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  // Students
  studentsColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  studentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  studentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
