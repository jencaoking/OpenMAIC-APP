'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Layout, Type, CircleDot, Image, FileText, Scroll, ChevronRight } from 'lucide-react';
import { useBuilderStore } from '@/lib/store/builder';
import { useEditMode } from '@/lib/contexts/edit-mode-context';
import type { DslComponentType, IDslNode } from '@openmaic/core-engine';
import { nanoid } from 'nanoid';

interface MaterialItem {
  type: DslComponentType;
  icon: React.ReactNode;
  label: string;
  description: string;
  defaultProps?: Record<string, unknown>;
}

const materials: MaterialItem[] = [
  {
    type: 'View',
    icon: <Layout className="h-5 w-5" />,
    label: 'View',
    description: 'Container for layout',
    defaultProps: {
      style: { padding: 16, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' },
    },
  },
  {
    type: 'Text',
    icon: <Type className="h-5 w-5" />,
    label: 'Text',
    description: 'Display text content',
    defaultProps: { style: { fontSize: 16, color: '#1e293b' }, children: ['New Text'] },
  },
  {
    type: 'Button',
    icon: <CircleDot className="h-5 w-5" />,
    label: 'Button',
    description: 'Interactive button',
    defaultProps: {
      style: { padding: '10px 20px', backgroundColor: '#722ed1', color: 'white', borderRadius: 6 },
      children: ['Button'],
    },
  },
  {
    type: 'Image',
    icon: <Image className="h-5 w-5" />,
    label: 'Image',
    description: 'Display image',
    defaultProps: {
      style: { width: 200, height: 150, backgroundColor: '#f1f5f9', borderRadius: 8 },
    },
  },
  {
    type: 'TextInput',
    icon: <FileText className="h-5 w-5" />,
    label: 'Text Input',
    description: 'User text input',
    defaultProps: {
      style: { padding: 12, border: '1px solid #e2e8f0', borderRadius: 6, width: '100%' },
      placeholder: 'Enter text...',
    },
  },
  {
    type: 'ScrollView',
    icon: <Scroll className="h-5 w-5" />,
    label: 'Scroll View',
    description: 'Scrollable container',
    defaultProps: {
      style: {
        height: 200,
        overflow: 'auto',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 16,
      },
    },
  },
];

export function MaterialPanel() {
  const { isMaterialPanelOpen, setMaterialPanelOpen, addNode, selectedNodeId, getNodeById } =
    useBuilderStore();
  const { isEditMode } = useEditMode();

  const handleAddMaterial = (material: MaterialItem) => {
    const newNode: IDslNode = {
      type: material.type,
      id: nanoid(),
      props: material.defaultProps,
      children: material.defaultProps?.children as (IDslNode | string)[] | undefined,
    };

    const parentId = selectedNodeId
      ? getNodeById(selectedNodeId)?.type === 'View' ||
        getNodeById(selectedNodeId)?.type === 'ScrollView'
        ? selectedNodeId
        : null
      : null;

    addNode(parentId, newNode);
    setMaterialPanelOpen(false);
  };

  if (!isEditMode) return null;

  return (
    <AnimatePresence>
      {isMaterialPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMaterialPanelOpen(false)}
          />

          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-70 bg-background border-r border-border shadow-xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Components</h2>
              <p className="text-sm text-muted-foreground mt-1">Drag to add to canvas</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {materials.map((material) => (
                  <motion.div
                    key={material.type}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddMaterial(material)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted hover:border-primary/50 cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {material.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{material.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {material.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {selectedNodeId ? (
                  <span>Selected: {getNodeById(selectedNodeId)?.type}</span>
                ) : (
                  <span>Click to select a container</span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
