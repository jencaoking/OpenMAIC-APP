import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useBuilderStore } from './builderStore';
import { DslRenderer } from './DslRenderer';
import { MaterialPanel } from './MaterialPanel';
import { PropertyInspector } from './PropertyInspector';

interface DslBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialTree?: any;
  onExport?: (json: string) => void;
}

/**
 * DslBuilder - Main DSL Builder component.
 *
 * Port of Web's Builder page.
 * Visual editor for DSL components.
 */
export function DslBuilder({ isOpen, onClose, initialTree, onExport }: DslBuilderProps) {
  const {
    dslTree,
    selectedNodeId,
    selectNode,
    isMaterialPanelOpen,
    toggleMaterialPanel,
    undo,
    redo,
    canUndo,
    canRedo,
    exportJson,
    saveToHistory,
  } = useBuilderStore();

  const [showPropertyPanel, setShowPropertyPanel] = useState(false);

  const handleExport = () => {
    const json = exportJson();
    onExport?.(json);
  };

  const handleNodeSelect = (nodeId: string) => {
    selectNode(nodeId);
    setShowPropertyPanel(true);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.backText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>DSL Builder</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, !canUndo() && styles.actionButtonDisabled]}
              onPress={() => {
                undo();
              }}
              disabled={!canUndo()}
            >
              <Text style={styles.actionText}>↩</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, !canRedo() && styles.actionButtonDisabled]}
              onPress={() => {
                redo();
              }}
              disabled={!canRedo()}
            >
              <Text style={styles.actionText}>↪</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Material Panel */}
          <MaterialPanel isOpen={isMaterialPanelOpen} onClose={toggleMaterialPanel} />

          {/* Canvas */}
          <View style={styles.canvasArea}>
            <ScrollView style={styles.canvasScroll} contentContainerStyle={styles.canvasContent}>
              {dslTree.map((node) => (
                <DslRenderer
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => handleNodeSelect(node.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Property Inspector */}
          <PropertyInspector
            isOpen={showPropertyPanel && !!selectedNodeId}
            onClose={() => {
              setShowPropertyPanel(false);
              selectNode(null);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    color: '#6b7280',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#7c3aed',
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  canvasArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  canvasScroll: {
    flex: 1,
  },
  canvasContent: {
    padding: 20,
  },
});
