import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';
import { SceneThumbnail } from './SceneThumbnail';
import { DEMO_SLIDES } from '../../slides/demoSlides';

export function SceneSidebar() {
  const { scenes, currentSceneIndex, setCurrentSceneIndex } = useClassroomStore();

  return (
    <View style={styles.container}>
      {/* Logo Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>OpenMAIC</Text>
      </View>

      {/* Scene List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {scenes.map((scene, index) => {
          const isActive = index === currentSceneIndex;
          const slide = DEMO_SLIDES[index];

          return (
            <Pressable
              key={scene.id}
              style={[styles.sceneItem, isActive && styles.sceneActive]}
              onPress={() => setCurrentSceneIndex(index)}
            >
              {/* Number Badge */}
              <View style={styles.numRow}>
                <View style={[styles.numBadge, isActive ? styles.numActive : styles.numInactive]}>
                  <Text style={[styles.numText, isActive && styles.numTextActive]}>
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.sceneTitle, isActive && styles.sceneTitleActive]}
                  numberOfLines={2}
                >
                  {scene.title}
                </Text>
              </View>

              {/* Thumbnail */}
              {slide ? (
                <SceneThumbnail slide={slide} width={140} />
              ) : (
                <View style={styles.placeholderThumb} />
              )}
            </Pressable>
          );
        })}

        {scenes.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无场景</Text>
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
  header: {
    height: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#722ed1',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  sceneItem: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
    cursor: 'pointer',
  },
  sceneActive: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  numBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numActive: {
    backgroundColor: '#7c3aed',
  },
  numInactive: {
    backgroundColor: '#f1f5f9',
  },
  numText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  numTextActive: {
    color: '#ffffff',
  },
  sceneTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  sceneTitleActive: {
    color: '#7c3aed',
  },
  placeholderThumb: {
    width: 140,
    height: 79,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
