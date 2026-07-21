import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useBuilderStore, type DslComponentType, type IDslNode } from './builderStore';

interface MaterialItem {
  type: DslComponentType;
  icon: string;
  label: string;
  description: string;
  defaultProps?: Record<string, unknown>;
}

const materials: MaterialItem[] = [
  {
    type: 'View',
    icon: '◻',
    label: 'View',
    description: 'Container for layout',
    defaultProps: {
      style: { padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    },
  },
  {
    type: 'Text',
    icon: 'T',
    label: 'Text',
    description: 'Display text content',
    defaultProps: { style: { fontSize: 16, color: '#1e293b' }, children: ['New Text'] },
  },
  {
    type: 'Button',
    icon: '◉',
    label: 'Button',
    description: 'Interactive button',
    defaultProps: {
      style: { padding: 12, backgroundColor: '#722ed1', color: '#fff', borderRadius: 6 },
      children: ['Button'],
    },
  },
  {
    type: 'Image',
    icon: '🖼',
    label: 'Image',
    description: 'Display image',
    defaultProps: {
      style: { width: 200, height: 150, backgroundColor: '#f1f5f9', borderRadius: 8 },
    },
  },
  {
    type: 'TextInput',
    icon: '✎',
    label: 'Text Input',
    description: 'User text input',
    defaultProps: {
      style: { padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6 },
      placeholder: 'Enter text...',
    },
  },
  {
    type: 'ScrollView',
    icon: '↕',
    label: 'Scroll View',
    description: 'Scrollable container',
    defaultProps: {
      style: { maxHeight: 200, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
    },
  },
];

interface MaterialPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MaterialPanel - Component palette.
 *
 * Port of Web's MaterialPanel component.
 * Shows available DSL components to add.
 */
export function MaterialPanel({ isOpen, onClose }: MaterialPanelProps) {
  const { addNode, selectedNodeId } = useBuilderStore();

  const handleAddComponent = (item: MaterialItem) => {
    const newId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newNode: IDslNode = {
      type: item.type,
      id: newId,
      props: item.defaultProps || {},
      children: (item.defaultProps?.children as (string | IDslNode)[]) || [],
    };
    addNode(selectedNodeId, newNode);
  };

  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Components</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {materials.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={styles.item}
            onPress={() => handleAddComponent(item)}
          >
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <View style={styles.itemText}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
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
  closeText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  list: {
    padding: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  itemDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
});
