import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useEditStore } from './editStore';

interface SceneThumb {
  id: string;
  index: number;
  title?: string;
  type: string;
}

interface SlideNavRailProps {
  scenes: SceneThumb[];
  currentSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onAddScene?: () => void;
  onDeleteScene?: (sceneId: string) => void;
  onDuplicateScene?: (sceneId: string) => void;
}

/**
 * SlideNavRail - Scene navigation rail.
 *
 * Port of Web's SlideNavRail component.
 * Simplified for Mobile: fixed width, tap to select, long-press for actions.
 */
export function SlideNavRail({
  scenes,
  currentSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
}: SlideNavRailProps) {
  const { railCollapsed, toggleRail } = useEditStore();

  const handleLongPress = useCallback(
    (sceneId: string) => {
      Alert.alert('Scene Actions', 'Choose an action', [
        { text: 'Duplicate', onPress: () => onDuplicateScene?.(sceneId) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm', 'Delete this scene?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDeleteScene?.(sceneId) },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [onDuplicateScene, onDeleteScene],
  );

  if (railCollapsed) {
    return (
      <View style={styles.collapsedContainer}>
        <TouchableOpacity style={styles.expandButton} onPress={toggleRail}>
          <Text style={styles.expandButtonText}>☰</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scenes</Text>
        <TouchableOpacity style={styles.collapseButton} onPress={toggleRail}>
          <Text style={styles.collapseButtonText}>◀</Text>
        </TouchableOpacity>
      </View>

      {/* Scene List */}
      <ScrollView style={styles.sceneList} contentContainerStyle={styles.sceneListContent}>
        {scenes.map((scene) => (
          <TouchableOpacity
            key={scene.id}
            style={[
              styles.sceneItem,
              scene.id === currentSceneId && styles.sceneItemActive,
            ]}
            onPress={() => onSelectScene(scene.id)}
            onLongPress={() => handleLongPress(scene.id)}
          >
            <View style={styles.sceneThumbnail}>
              <Text style={styles.sceneIndex}>{scene.index + 1}</Text>
            </View>
            <Text
              style={[
                styles.sceneTitle,
                scene.id === currentSceneId && styles.sceneTitleActive,
              ]}
              numberOfLines={1}
            >
              {scene.title || `Scene ${scene.index + 1}`}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Add Scene Button */}
        {onAddScene && (
          <TouchableOpacity style={styles.addButton} onPress={onAddScene}>
            <Text style={styles.addButtonText}>+ Add Scene</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  collapsedContainer: {
    width: 48,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    alignItems: 'center',
    paddingTop: 12,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  collapseButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapseButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sceneList: {
    flex: 1,
  },
  sceneListContent: {
    padding: 8,
    gap: 4,
  },
  sceneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  sceneItemActive: {
    backgroundColor: '#ede9fe',
  },
  sceneThumbnail: {
    width: 48,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneIndex: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  sceneTitle: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  sceneTitleActive: {
    color: '#7c3aed',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
