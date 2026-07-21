import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useBuilderStore } from './builderStore';

interface PropertyInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PropertyInspector - Property editor for selected node.
 *
 * Port of Web's PropertyInspector component.
 */
export function PropertyInspector({ isOpen, onClose }: PropertyInspectorProps) {
  const { selectedNodeId, getNodeById, updateNode, updateNodeProps, selectNode } = useBuilderStore();
  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;

  if (!isOpen || !selectedNode) return null;

  const props = selectedNode.props || {};

  const handleStyleChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    const finalValue = isNaN(numValue) ? value : numValue;
    updateNodeProps(selectedNode.id, ['style', key], finalValue);
  };

  const handleTextChange = (value: string) => {
    updateNode(selectedNode.id, { children: [value] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Properties</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              useBuilderStore.getState().deleteNode(selectedNode.id);
              selectNode(null);
            }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Node Type */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Type</Text>
          <Text style={styles.fieldValue}>{selectedNode.type}</Text>
        </View>

        {/* Node ID */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>ID</Text>
          <Text style={styles.fieldValue}>{selectedNode.id}</Text>
        </View>

        {/* Children (for Text/Button) */}
        {(selectedNode.type === 'Text' || selectedNode.type === 'Button') && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Content</Text>
            <TextInput
              style={styles.input}
              value={(selectedNode.children?.[0] as string) || ''}
              onChangeText={handleTextChange}
            />
          </View>
        )}

        {/* Style properties */}
        <Text style={styles.sectionTitle}>Style</Text>

        {(props.style as Record<string, unknown>) &&
          Object.entries(props.style as Record<string, unknown>).map(([key, value]) => (
            <View key={key} style={styles.field}>
              <Text style={styles.fieldLabel}>{key}</Text>
              <TextInput
                style={styles.input}
                value={String(value)}
                onChangeText={(v) => handleStyleChange(key, v)}
              />
            </View>
          ))}

        {/* Image src */}
        {selectedNode.type === 'Image' && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Source URL</Text>
            <TextInput
              style={styles.input}
              value={(props.src as string) || ''}
              onChangeText={(v) => updateNodeProps(selectedNode.id, ['src'], v)}
            />
          </View>
        )}

        {/* TextInput placeholder */}
        {selectedNode.type === 'TextInput' && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Placeholder</Text>
            <TextInput
              style={styles.input}
              value={(props.placeholder as string) || ''}
              onChangeText={(v) => updateNodeProps(selectedNode.id, ['placeholder'], v)}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
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
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  deleteText: {
    fontSize: 12,
    color: '#dc2626',
  },
  closeText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    padding: 12,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
});
