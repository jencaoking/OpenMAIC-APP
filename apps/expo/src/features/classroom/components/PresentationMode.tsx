import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';
import { useClassroomPlayback } from '../hooks/useClassroomPlayback';
import { TeacherAvatar } from './TeacherAvatar';
import { SpeechBubble } from './SpeechBubble';
import { StudentAvatars } from './StudentAvatars';

interface PresentationModeProps {
  /** 退出演示模式回调 */
  onExit: () => void;
}

/**
 * 演示模式（全屏）。
 * 移动端的 presentation mode，隐藏侧边栏和聊天面板，
 * 控制按钮浮动在底部。
 */
export function PresentationMode({ onExit }: PresentationModeProps) {
  const { scenes, currentSceneIndex, engineMode, lectureSpeech, speakingAgentId } =
    useClassroomStore();

  const { togglePlayPause, nextScene, prevScene } = useClassroomPlayback();

  const isPlaying = engineMode === 'playing';
  const isFirst = currentSceneIndex === 0;
  const isLast = currentSceneIndex >= scenes.length - 1;

  return (
    <View style={styles.container}>
      {/* 退出按钮 */}
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={styles.exitText}>✕ 退出演示</Text>
      </Pressable>

      {/* 场景信息 */}
      <View style={styles.sceneInfo}>
        <Text style={styles.sceneNumber}>{String(currentSceneIndex + 1).padStart(2, '0')}</Text>
        <Text style={styles.sceneTitle}>{scenes[currentSceneIndex]?.title || ''}</Text>
      </View>

      {/* 底部浮动控制栏 */}
      <View style={styles.bottomBar}>
        {/* 教师 */}
        <TeacherAvatar name="AI 教师" avatar="👨‍🏫" size={40} />

        {/* 对话区 */}
        <View style={styles.centerArea}>
          {lectureSpeech && (
            <SpeechBubble
              text={lectureSpeech}
              role={speakingAgentId === 'teacher' ? 'teacher' : 'user'}
            />
          )}
        </View>

        {/* 学生 */}
        <View style={styles.studentsArea}>
          <StudentAvatars size={28} />
        </View>
      </View>

      {/* 浮动播放控制 */}
      <View style={styles.floatingControls}>
        <Pressable
          style={[styles.controlBtn, isFirst && styles.controlBtnDisabled]}
          onPress={prevScene}
          disabled={isFirst}
        >
          <Text style={[styles.controlText, isFirst && styles.controlTextDisabled]}>◀</Text>
        </Pressable>

        <Pressable style={styles.playBtn} onPress={togglePlayPause}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>

        <Pressable
          style={[styles.controlBtn, isLast && styles.controlBtnDisabled]}
          onPress={nextScene}
          disabled={isLast}
        >
          <Text style={[styles.controlText, isLast && styles.controlTextDisabled]}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  exitBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
  },
  exitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  sceneInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 20,
  },
  sceneNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.1)',
  },
  sceneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  centerArea: {
    flex: 1,
  },
  studentsArea: {
    width: 80,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 20,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnDisabled: {
    opacity: 0.3,
  },
  controlText: {
    fontSize: 14,
    color: '#ffffff',
  },
  controlTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playIcon: {
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 2,
  },
});
