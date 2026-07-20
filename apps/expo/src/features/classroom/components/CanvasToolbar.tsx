import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';
import { useClassroomPlayback } from '../hooks/useClassroomPlayback';

export function CanvasToolbar() {
  const {
    scenes,
    currentSceneIndex,
    engineMode,
    speechProgress,
  } = useClassroomStore();

  const { togglePlayPause, nextScene, prevScene } = useClassroomPlayback();

  const isPlaying = engineMode === 'playing';
  const isFirst = currentSceneIndex === 0;
  const isLast = currentSceneIndex >= scenes.length - 1;

  return (
    <View style={styles.container}>
      {/* Prev */}
      <Pressable
        style={[styles.btn, isFirst && styles.btnDisabled]}
        onPress={prevScene}
        disabled={isFirst}
      >
        <Text style={[styles.btnText, isFirst && styles.btnTextDisabled]}>◀</Text>
      </Pressable>

      {/* Play/Pause */}
      <View style={styles.group}>
        <Pressable
          style={[styles.btn, isPlaying && styles.btnActive]}
          onPress={togglePlayPause}
        >
          <Text style={[styles.btnText, isPlaying && styles.btnTextActive]}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </Pressable>
      </View>

      {/* Next */}
      <Pressable
        style={[styles.btn, isLast && styles.btnDisabled]}
        onPress={nextScene}
        disabled={isLast}
      >
        <Text style={[styles.btnText, isLast && styles.btnTextDisabled]}>▶</Text>
      </Pressable>

      {/* Page Indicator */}
      <Text style={styles.pageIndicator}>
        {scenes.length > 0 ? `${currentSceneIndex + 1} / ${scenes.length}` : '0 / 0'}
      </Text>

      {/* Progress Bar */}
      {engineMode === 'playing' && speechProgress !== null && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(speechProgress || 0) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Speed */}
      <View style={styles.speedBadge}>
        <Text style={styles.speedText}>1.0x</Text>
      </View>

      <View style={styles.spacer} />

      {/* End Discussion */}
      {isPlaying && (
        <Pressable
          style={styles.endBtn}
          onPress={() => useClassroomStore.getState().setEngineMode('idle')}
        >
          <Text style={styles.endBtnText}>结束讨论</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  btnText: {
    fontSize: 13,
    color: '#64748b',
  },
  btnTextActive: {
    color: '#7c3aed',
  },
  btnTextDisabled: {
    color: '#cbd5e1',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  pageIndicator: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 8,
    fontVariant: ['tabular-nums'],
  },
  progressContainer: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginLeft: 8,
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  speedBadge: {
    width: 32,
    height: 20,
    borderRadius: 5,
    backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  speedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7c3aed',
    fontVariant: ['tabular-nums'],
  },
  spacer: {
    flex: 1,
  },
  endBtn: {
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 7,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
});
