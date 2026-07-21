import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FloatingToolbarProps {
  selectedElementId: string | null;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onClose?: () => void;
}

/**
 * FloatingToolbar - Context toolbar for selected elements.
 *
 * Port of Web's FloatingToolbar component.
 * Shows when an element is selected with quick actions.
 */
export function FloatingToolbar({
  selectedElementId,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onClose,
}: FloatingToolbarProps) {
  if (!selectedElementId) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onDuplicate}>
        <Text style={styles.buttonText}>Copy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onBringForward}>
        <Text style={styles.buttonText}>↑</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onSendBackward}>
        <Text style={styles.buttonText}>↓</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
        <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 4,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  closeButtonText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
