'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditMode } from '@/lib/contexts/edit-mode-context';
import { useBuilderStore } from '@/lib/store/builder';
import { componentPropertySchemas } from './schemas';
import { PropertyForm } from './PropertyForm';
import type { IDslNode } from '@openmaic/core-engine';

export function PropertyInspector() {
  const { isEditMode } = useEditMode();
  const { selectedNodeId, getNodeById, updateNode, selectNode } = useBuilderStore();

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const schema = selectedNode ? componentPropertySchemas[selectedNode.type] : null;

  const handlePropertyChange = (path: string[], value: unknown) => {
    if (!selectedNodeId) return;

    const updatePropsRecursive = (
      props: Record<string, unknown>,
      currentPath: string[],
      currentValue: unknown,
    ): Record<string, unknown> => {
      if (currentPath.length === 1) {
        return { ...props, [currentPath[0]]: currentValue };
      }

      const [key, ...rest] = currentPath;
      const existingValue = props[key];
      const newValue =
        existingValue && typeof existingValue === 'object'
          ? updatePropsRecursive(existingValue as Record<string, unknown>, rest, currentValue)
          : {};

      return { ...props, [key]: newValue };
    };

    const node = getNodeById(selectedNodeId);
    if (!node) return;

    const currentProps = node.props || {};
    const newProps = updatePropsRecursive(currentProps, path, value);

    const needsChildrenUpdate = path[0] === 'text' || path[0] === 'label';
    if (needsChildrenUpdate) {
      updateNode(selectedNodeId, {
        props: newProps,
        children: [value as string],
      });
    } else {
      updateNode(selectedNodeId, { props: newProps });
    }
  };

  const getNodeValues = (node: IDslNode): Record<string, unknown> => {
    const values: Record<string, unknown> = {};

    if (node.type === 'Text' && node.children && Array.isArray(node.children)) {
      values.text = node.children[0] || '';
    }
    if (node.type === 'Button' && node.children && Array.isArray(node.children)) {
      values.label = node.children[0] || '';
    }

    if (node.props) {
      Object.entries(node.props).forEach(([key, value]) => {
        if (key !== 'children') {
          values[key] = value;
        }
      });
    }

    return values;
  };

  if (!isEditMode) return null;

  return (
    <AnimatePresence>
      {selectedNode && schema && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => selectNode(null)}
        />
      )}

      <motion.div
        initial={{ x: 320 }}
        animate={selectedNode && schema ? { x: 0 } : { x: 320 }}
        exit={{ x: 320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Properties</h2>
              <p className="text-sm text-muted-foreground">
                {selectedNode?.type || 'No selection'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectNode(null)}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {selectedNode && (
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>{selectedNode.id}</span>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-4">
            <AnimatePresence mode="wait">
              {selectedNode && schema ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PropertyForm
                    schema={schema}
                    values={getNodeValues(selectedNode)}
                    onChange={handlePropertyChange}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a component on the canvas to edit its properties
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}
