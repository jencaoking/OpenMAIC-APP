import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CommandBarProps {
  title: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onBack?: () => void;
  onSettings?: () => void;
}

/**
 * CommandBar - Top bar of Pro mode chrome.
 *
 * Port of Web's CommandBar component.
 * Shows undo/redo, title, and action buttons.
 */
export function CommandBar({
  title,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onBack,
  onSettings,
}: CommandBarProps) {
  return (
    <View style={styles.container}>
      {/* Left: Back + Undo/Redo + Title */}
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
        )}

        {onUndo && (
          <TouchableOpacity
            style={[styles.iconButton, !canUndo && styles.iconButtonDisabled]}
            onPress={onUndo}
            disabled={!canUndo}
          >
            <Text style={[styles.iconText, !canUndo && styles.iconTextDisabled]}>↩</Text>
          </TouchableOpacity>
        )}

        {onRedo && (
          <TouchableOpacity
            style={[styles.iconButton, !canRedo && styles.iconButtonDisabled]}
            onPress={onRedo}
            disabled={!canRedo}
          >
            <Text style={[styles.iconText, !canRedo && styles.iconTextDisabled]}>↪</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right: Settings */}
      {onSettings && (
        <TouchableOpacity style={styles.iconButton} onPress={onSettings}>
          <Text style={styles.iconText}>⚙</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
  iconText: {
    fontSize: 18,
    color: '#374151',
  },
  iconTextDisabled: {
    color: '#9ca3af',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
});
