import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { useWhiteboardStore } from './whiteboardStore';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import { WhiteboardHistory } from './WhiteboardHistory';

interface WhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Whiteboard component.
 *
 * Port of Web's Whiteboard component.
 * Overlay with pan/zoom canvas and history.
 */
export function Whiteboard({ isOpen, onClose }: WhiteboardProps) {
  const {
    elements,
    isClearing,
    setClearing,
    pushSnapshot,
    clearElements,
  } = useWhiteboardStore();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewModified, setViewModified] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  // Animate in/out
  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          stiffness: 120,
          damping: 18,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isOpen, fadeAnim, scaleAnim]);

  const handleClear = () => {
    if (elements.length === 0 || isClearing) return;

    // Save snapshot before clearing
    if (elements.length > 0) {
      pushSnapshot(elements);
    }

    // Clear with animation
    setClearing(true);
    setTimeout(() => {
      clearElements();
      setClearing(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>✏️</Text>
            </View>
            <Text style={styles.title}>Whiteboard</Text>
          </View>

          <View style={styles.headerRight}>
            {viewModified && (
              <TouchableOpacity style={styles.headerButton}>
                <Text style={styles.headerButtonText}>↺</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.headerButton, elements.length === 0 && styles.headerButtonDisabled]}
              onPress={handleClear}
              disabled={elements.length === 0}
            >
              <Text style={styles.headerButtonText}>🗑</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setHistoryOpen(true)}
            >
              <Text style={styles.headerButtonText}>📋</Text>
              {useWhiteboardStore.getState().snapshots.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {useWhiteboardStore.getState().snapshots.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Text style={styles.headerButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Canvas */}
        <View style={styles.canvasArea}>
          <WhiteboardCanvas
            elements={elements}
            isClearing={isClearing}
            onViewModifiedChange={setViewModified}
          />
        </View>

        {/* History Panel */}
        <WhiteboardHistory
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerButtonDisabled: {
    opacity: 0.3,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  canvasArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
