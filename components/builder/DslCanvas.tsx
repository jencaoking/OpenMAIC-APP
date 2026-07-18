'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GripVertical, Settings, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditMode } from '@/lib/contexts/edit-mode-context';
import { useBuilderStore } from '@/lib/store/builder';
import type { IDslNode, DslComponentType } from '@openmaic/core-engine';
import { useBuilderStore as builderStore } from '@/lib/store/builder';

interface DslCanvasProps {
  className?: string;
}

const componentMap: Record<DslComponentType, React.ComponentType<{
  children?: React.ReactNode;
  style?: Record<string, unknown>;
  onClick?: () => void;
  [key: string]: unknown;
}>> = {
  View: ({ children, style, onClick, ...props }) => (
    <div
      style={style as React.CSSProperties}
      onClick={onClick}
      {...props}
      className="flex flex-col"
    >
      {children}
    </div>
  ),
  Text: ({ children, style, ...props }) => (
    <span style={style as React.CSSProperties} {...props}>
      {children}
    </span>
  ),
  Button: ({ children, style, onClick, ...props }) => (
    <button
      style={style as React.CSSProperties}
      onClick={onClick}
      {...props}
      className="cursor-pointer"
    >
      {children}
    </button>
  ),
  Image: ({ style, ...props }) => (
    <img style={style as React.CSSProperties} {...props} />
  ),
  TextInput: ({ style, ...props }) => (
    <input type="text" style={style as React.CSSProperties} {...props} />
  ),
  ScrollView: ({ children, style, ...props }) => (
    <div
      style={{ ...(style as React.CSSProperties), overflow: 'auto' }}
      {...props}
    >
      {children}
    </div>
  ),
};

function DslNodeRenderer({
  node,
  isSelected,
  onSelect,
  onDragStart,
}: {
  node: IDslNode;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, node: IDslNode) => void;
}) {
  const { selectNode, copyNode, deleteNode } = useBuilderStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const Component = componentMap[node.type];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setShowMenu(true);
  };

  const handleCopy = () => {
    if (node.id) {
      copyNode(node.id);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (node.id) {
      deleteNode(node.id);
    }
    setShowMenu(false);
  };

  const nodeStyle = node.props?.style as React.CSSProperties || {};

  return (
    <div
      draggable={isSelected}
      onDragStart={(e) => onDragStart(e, node)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`relative group transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : 'hover:ring-2 hover:ring-border hover:ring-offset-1 rounded-lg'
      }`}
      style={{ cursor: isSelected ? 'move' : 'pointer', ...nodeStyle }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-0 flex items-center gap-1 bg-background border border-border rounded shadow-lg z-10"
            ref={menuRef}
          >
            <button
              className="p-1 hover:bg-accent rounded"
              onMouseDown={(e) => e.stopPropagation()}
              title="Drag"
            >
              <GripVertical className="h-3 w-3" />
            </button>
            <button
              className="p-1 hover:bg-accent rounded"
              onMouseDown={(e) => e.stopPropagation()}
              title="Copy"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
              onMouseDown={(e) => e.stopPropagation()}
              title="Delete"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </button>
            <button
              className="p-1 hover:bg-accent rounded"
              onMouseDown={(e) => e.stopPropagation()}
              title="Settings"
            >
              <Settings className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
        <div className="flex flex-col gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      {typeof node.children === 'string' ? (
        <Component {...node.props}>{node.children}</Component>
      ) : (
        <Component {...node.props}>
          {node.children?.map((child, index) =>
            typeof child === 'string' ? (
              <span key={index}>{child}</span>
            ) : (
              <DslNodeRenderer
                key={child.id || index}
                node={child}
                isSelected={builderStore.getState().selectedNodeId === child.id}
                onSelect={() => selectNode(child.id || null)}
                onDragStart={onDragStart}
              />
            )
          )}
        </Component>
      )}
    </div>
  );
}

export function DslCanvas({ className = '' }: DslCanvasProps) {
  const { isEditMode } = useEditMode();
  const { dslTree, selectedNodeId, selectNode } = useBuilderStore();

  const handleDragStart = (e: React.DragEvent, node: IDslNode) => {
    if (node.id) {
      e.dataTransfer.setData('nodeId', node.id);
    }
  };

  const handleCanvasClick = () => {
    selectNode(null);
  };

  if (!isEditMode) {
    return (
      <div className={`${className}`}>
        {Array.isArray(dslTree) ? (
          dslTree.map((node) => (
            <DslNodeRenderer
              key={node.id}
              node={node}
              isSelected={false}
              onSelect={() => {}}
              onDragStart={() => {}}
            />
          ))
        ) : (
          <DslNodeRenderer
            node={dslTree}
            isSelected={false}
            onSelect={() => {}}
            onDragStart={() => {}}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${className} min-h-full p-8`}
      onClick={handleCanvasClick}
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {Array.isArray(dslTree) ? (
            dslTree.map((node) => (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DslNodeRenderer
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => selectNode(node.id || null)}
                  onDragStart={handleDragStart}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DslNodeRenderer
                node={dslTree}
                isSelected={selectedNodeId === dslTree.id}
                onSelect={() => selectNode(dslTree.id || null)}
                onDragStart={handleDragStart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}