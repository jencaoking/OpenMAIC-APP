import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';
import { CanvasToolbar } from './CanvasToolbar';
import { RNSlideCanvas } from '../../slides/RNSlideCanvas';
import { DEMO_SLIDES } from '../../slides/demoSlides';

export function CanvasArea() {
  const { scenes, currentSceneIndex, engineMode, setEngineMode } = useClassroomStore();
  const currentScene = scenes[currentSceneIndex];

  // 获取当前幻灯片数据
  const currentSlide = DEMO_SLIDES[currentSceneIndex] || DEMO_SLIDES[0];

  const handlePlayPause = () => {
    if (engineMode === 'playing') {
      setEngineMode('paused');
    } else {
      setEngineMode('playing');
    }
  };

  return (
    <View style={styles.container}>
      {/* Slide Area */}
      <View style={styles.slideArea}>
        {/* 使用 RN 幻灯片渲染器 */}
        <RNSlideCanvas slide={currentSlide} />

        {/* Scene Number Badge */}
        {currentScene && (
          <Text style={styles.sceneNumber}>
            {String(currentSceneIndex + 1).padStart(2, '0')}
          </Text>
        )}

        {/* Play Button (idle state) */}
        {engineMode === 'idle' && currentScene && (
          <Pressable style={styles.playBtn} onPress={handlePlayPause}>
            <Text style={styles.playIcon}>▶</Text>
          </Pressable>
        )}
      </View>

      {/* Toolbar */}
      <CanvasToolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  sceneNumber: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.04)',
    zIndex: 10,
  },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 20,
  },
  playIcon: {
    fontSize: 28,
    color: '#7c3aed',
    marginLeft: 4,
  },
});
