import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';
import { TeacherAvatar } from './TeacherAvatar';
import { StudentAvatars } from './StudentAvatars';
import { SpeechBubble } from './SpeechBubble';
import { ProactiveCard } from './ProactiveCard';

export function Roundtable() {
  const { lectureSpeech, liveSpeech, speakingAgentId, engineMode, isStreaming } =
    useClassroomStore();

  const [inputText, setInputText] = useState('');
  const [showDiscussion, setShowDiscussion] = useState(false);

  // 确定当前发言内容
  const currentSpeech = liveSpeech || lectureSpeech;
  const bubbleRole = speakingAgentId === 'teacher' ? 'teacher' : 'user';

  return (
    <View style={styles.container}>
      {/* Teacher Column */}
      <View style={styles.teacherColumn}>
        <TeacherAvatar name="AI 教师" avatar="👨‍🏫" size={48} />
      </View>

      {/* Center Stage */}
      <View style={styles.centerStage}>
        <View style={styles.chatCard}>
          {/* Speech Bubble */}
          {currentSpeech && (
            <SpeechBubble text={currentSpeech} role={bubbleRole} isStreaming={isStreaming} />
          )}

          {/* Thinking Dots */}
          {engineMode === 'live' && !currentSpeech && (
            <View style={styles.thinkingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          )}

          {/* Proactive Discussion Card */}
          <ProactiveCard
            visible={showDiscussion}
            onJoin={() => {
              setShowDiscussion(false);
              // TODO: 触发讨论
            }}
            onSkip={() => setShowDiscussion(false)}
          />

          {/* Text Input */}
          <View style={styles.inputPill}>
            <TextInput
              style={styles.input}
              placeholder="输入消息..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
            />
            <Pressable
              style={[styles.sendBtn, !inputText && styles.sendBtnDisabled]}
              onPress={() => {
                if (inputText.trim()) {
                  // TODO: 发送消息
                  setInputText('');
                }
              }}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Students Column */}
      <View style={styles.studentsColumn}>
        <StudentAvatars size={32} />
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
    backgroundColor: 'rgba(255,255,255,0.7)',
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
  sendBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  sendIcon: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  // Students
  studentsColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
