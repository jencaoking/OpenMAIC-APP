import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useWhiteboardStore } from './whiteboardStore';

interface WhiteboardHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * WhiteboardHistory - Snapshot history panel.
 *
 * Port of Web's WhiteboardHistory component.
 * Shows saved snapshots with restore functionality.
 */
export function WhiteboardHistory({ isOpen, onClose }: WhiteboardHistoryProps) {
  const { snapshots, restoreSnapshot } = useWhiteboardStore();

  const handleRestore = (index: number) => {
    restoreSnapshot(index);
    onClose();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.panel} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>History</Text>
            <Text style={styles.count}>{snapshots.length}</Text>
          </View>

          {/* Snapshot list */}
          <ScrollView style={styles.list}>
            {snapshots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No history yet</Text>
              </View>
            ) : (
              [...snapshots].reverse().map((snap, reverseIdx) => {
                const realIdx = snapshots.length - 1 - reverseIdx;
                return (
                  <View key={`${snap.timestamp}-${realIdx}`} style={styles.snapshotItem}>
                    <View style={styles.snapshotInfo}>
                      <Text style={styles.snapshotIndex}>#{realIdx + 1}</Text>
                      <Text style={styles.snapshotTime}>
                        {formatTime(snap.timestamp)} · {snap.elements.length} elements
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.restoreButton}
                      onPress={() => handleRestore(realIdx)}
                    >
                      <Text style={styles.restoreButtonText}>Restore</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  panel: {
    width: 280,
    maxHeight: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  count: {
    fontSize: 12,
    color: '#9ca3af',
  },
  list: {
    maxHeight: 260,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  snapshotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  snapshotInfo: {
    flex: 1,
  },
  snapshotIndex: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  snapshotTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  restoreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  restoreButtonText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
});
