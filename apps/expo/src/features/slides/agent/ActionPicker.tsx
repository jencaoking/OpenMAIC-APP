import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface ActionPickerProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

const ACTION_OPTIONS = [
  { type: 'speech', label: 'Speech', icon: '💬', description: 'Add a speech/narration' },
  { type: 'spotlight', label: 'Spotlight', icon: '🔦', description: 'Focus on an element' },
  { type: 'laser', label: 'Laser', icon: '🔴', description: 'Point at an element' },
];

/**
 * ActionPicker - Action type selector.
 *
 * Port of Web's ActionPicker component.
 * Modal with action type options.
 */
export function ActionPicker({ onSelect, onClose }: ActionPickerProps) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Add Action</Text>

          {ACTION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={styles.option}
              onPress={() => onSelect(option.type)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 34,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
});
