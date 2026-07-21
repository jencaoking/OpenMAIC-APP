import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import type { Action } from './actionTypes';
import { getActionLabel, getActionIcon } from './actionTypes';
import { insertAt, removeById, moveByIdDir, setSpeechText } from './actionsEdit';
import { ActionPicker } from './ActionPicker';

interface ActionsBarProps {
  actions: Action[];
  onActionsChange: (actions: Action[]) => void;
  onActionSelect?: (action: Action) => void;
}

/**
 * ActionsBar - Horizontal timeline for playback actions.
 *
 * Port of Web's ActionsBar component.
 * Simplified for Mobile: horizontal scrollable list.
 */
export function ActionsBar({ actions, onActionsChange, onActionSelect }: ActionsBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddAction = (type: string) => {
    const id = `action_${Date.now()}`;
    const newAction = { id, type } as any;
    const newActions = insertAt(actions, actions.length, newAction);
    onActionsChange(newActions);
    setShowPicker(false);
  };

  const handleDeleteAction = (id: string) => {
    const newActions = removeById(actions, id);
    onActionsChange(newActions);
  };

  const handleMoveAction = (id: string, direction: 'up' | 'down') => {
    const newActions = moveByIdDir(actions, id, direction);
    onActionsChange(newActions);
  };

  const handleStartEdit = (action: Action) => {
    if (action.type === 'speech') {
      setEditingId(action.id);
      setEditText(action.text);
    }
  };

  const handleFinishEdit = () => {
    if (editingId) {
      const newActions = setSpeechText(actions, editingId, editText);
      onActionsChange(newActions);
      setEditingId(null);
      setEditText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Actions Timeline</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView
        horizontal
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        showsHorizontalScrollIndicator={false}
      >
        {actions.map((action, index) => (
          <View key={action.id} style={styles.actionItem}>
            {/* Index */}
            <Text style={styles.actionIndex}>{index + 1}</Text>

            {/* Action Card */}
            <TouchableOpacity
              style={[
                styles.actionCard,
                action.type === 'speech' && styles.speechCard,
                action.type === 'spotlight' && styles.spotlightCard,
                action.type === 'laser' && styles.laserCard,
              ]}
              onPress={() => onActionSelect?.(action)}
              onLongPress={() => handleStartEdit(action)}
            >
              <Text style={styles.actionIcon}>{getActionIcon(action)}</Text>

              {editingId === action.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  onBlur={handleFinishEdit}
                  autoFocus
                  multiline
                />
              ) : (
                <Text style={styles.actionLabel} numberOfLines={2}>
                  {getActionLabel(action)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Controls */}
            <View style={styles.actionControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleMoveAction(action.id, 'up')}
                disabled={index === 0}
              >
                <Text style={[styles.controlText, index === 0 && styles.controlTextDisabled]}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleMoveAction(action.id, 'down')}
                disabled={index === actions.length - 1}
              >
                <Text style={[styles.controlText, index === actions.length - 1 && styles.controlTextDisabled]}>↓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleDeleteAction(action.id)}
              >
                <Text style={[styles.controlText, styles.deleteText]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {actions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No actions yet. Tap + Add to create one.</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Picker Modal */}
      {showPicker && (
        <ActionPicker
          onSelect={handleAddAction}
          onClose={() => setShowPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  addButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#7c3aed',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  timeline: {
    maxHeight: 120,
  },
  timelineContent: {
    padding: 8,
    gap: 8,
    alignItems: 'flex-start',
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionIndex: {
    fontSize: 10,
    color: '#9ca3af',
  },
  actionCard: {
    width: 80,
    minHeight: 60,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechCard: {
    backgroundColor: '#f5f3ff',
    borderColor: '#c4b5fd',
  },
  spotlightCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  laserCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  actionIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
  editInput: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    minWidth: 60,
  },
  actionControls: {
    flexDirection: 'row',
    gap: 4,
  },
  controlButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 10,
    color: '#6b7280',
  },
  controlTextDisabled: {
    color: '#d1d5db',
  },
  deleteText: {
    color: '#dc2626',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
