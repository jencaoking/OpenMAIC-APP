import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';
import { CanvasToolbar } from './CanvasToolbar';

export function CanvasArea() {
  const { scenes, currentSceneIndex, engineMode, setEngineMode } = useClassroomStore();
  const currentScene = scenes[currentSceneIndex];

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
        <View style={styles.slide}>
          {/* Scene Number Badge */}
          {currentScene && (
            <Text style={styles.sceneNumber}>
              {String(currentSceneIndex + 1).padStart(2, '0')}
            </Text>
          )}

          {/* Slide Content Placeholder */}
          <View style={styles.slideContent}>
            {currentScene ? (
              <>
                <Text style={styles.slideTitle}>{currentScene.title}</Text>
                <Text style={styles.slideSubtitle}>场景 {currentSceneIndex + 1} / {scenes.length}</Text>
                <Text style={styles.slideType}>类型: {currentScene.type}</Text>
              </>
            ) : (
              <Text style={styles.placeholder}>选择一个场景开始</Text>
            )}
          </View>

          {/* Play Button (idle state) */}
          {engineMode === 'idle' && currentScene && (
            <Pressable style={styles.playBtn} onPress={handlePlayPause}>
              <Text style={styles.playIcon}>▶</Text>
            </Pressable>
          )}
        </View>
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
  slide: {
    aspectRatio: 16 / 9,
    height: '100%',
    maxHeight: '100%',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  sceneNumber: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.04)',
  },
  slideContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#242424',
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 4,
  },
  slideType: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  placeholder: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
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
  },
  playIcon: {
    fontSize: 28,
    color: '#7c3aed',
    marginLeft: 4,
  },
});
