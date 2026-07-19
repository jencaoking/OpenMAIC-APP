'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GripVertical, Settings, Copy, Trash2 } from 'lucide-react';
import { useEditMode } from '@/lib/contexts/edit-mode-context';
import { useBuilderStore } from '@/lib/store/builder';
import type { IDslNode, DslComponentType } from '@openmaic/core-engine';
import { useBuilderStore as builderStore } from '@/lib/store/builder';

interface DslCanvasProps {
  className?: string;
}

const componentMap: Record<
  DslComponentType,
  React.ComponentType<{
    children?: React.ReactNode;
    style?: Record<string, unknown>;
    onClick?: () => void;
    [key: string]: unknown;
  }>
> = {
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
  Image: ({ style, ...props }) => <img style={style as React.CSSProperties} {...props} />,
  TextInput: ({ style, ...props }) => (
    <input type="text" style={style as React.CSSProperties} {...props} />
  ),
  ScrollView: ({ children, style, ...props }) => (
    <div style={{ ...(style as React.CSSProperties), overflow: 'auto' }} {...props}>
      {children}
    </div>
  ),
};

interface DslNodeRendererProps {
  node: IDslNode;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, node: IDslNode) => void;
  onDragOver: (e: React.DragEvent, node: IDslNode) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, node: IDslNode) => void;
  dragOverIndex: number | null;
}

function DslNodeRenderer({
  node,
  isSelected,
  isEditMode,
  onSelect,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverIndex,
}: DslNodeRendererProps) {
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

  const nodeStyle = (node.props?.style as React.CSSProperties) || {};

  const isContainer = node.type === 'View' || node.type === 'ScrollView';
  const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0;

  return (
    <div
      draggable={isEditMode}
      onDragStart={(e) => onDragStart(e, node)}
      onDragOver={(e) => isContainer && onDragOver(e, node)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, node)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`relative group transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 rounded-lg'
          : 'hover:ring-2 hover:ring-border hover:ring-offset-1 rounded-lg'
      } ${isContainer && hasChildren ? 'drag-over-container' : ''}`}
      style={{ cursor: isEditMode ? 'move' : 'pointer', ...nodeStyle }}
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

      <div
        className={`absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}
      >
        <div className="flex flex-col gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      {typeof node.children === 'string' ? (
        <Component {...node.props}>{node.children}</Component>
      ) : (
        <Component {...node.props}>
          {isContainer && (
            <div
              className="h-2 w-full bg-primary/20 rounded my-1"
              onDragOver={(e) => onDragOver(e, node)}
              onDrop={(e) => {
                e.preventDefault();
                const nodeId = e.dataTransfer.getData('nodeId');
                if (nodeId) {
                  onDrop(e, node);
                }
              }}
            />
          )}
          {node.children?.map((child, index) =>
            typeof child === 'string' ? (
              <span key={index}>{child}</span>
            ) : (
              <div key={child.id || index}>
                {dragOverIndex === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 4 }}
                    exit={{ height: 0 }}
                    className="w-full bg-primary/40 rounded mb-1"
                  />
                )}
                <DslNodeRenderer
                  node={child}
                  isSelected={builderStore.getState().selectedNodeId === child.id}
                  isEditMode={isEditMode}
                  onSelect={() => selectNode(child.id || null)}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  dragOverIndex={dragOverIndex}
                />
              </div>
            ),
          )}
          {isContainer && (
            <div
              className="h-2 w-full bg-primary/20 rounded my-1"
              onDragOver={(e) => onDragOver(e, node)}
              onDrop={(e) => {
                e.preventDefault();
                const nodeId = e.dataTransfer.getData('nodeId');
                if (nodeId) {
                  onDrop(e, node);
                }
              }}
            />
          )}
        </Component>
      )}
    </div>
  );
}

export function DslCanvas({ className = '' }: DslCanvasProps) {
  const { isEditMode } = useEditMode();
  const { dslTree, selectedNodeId, selectNode, moveNode, getNodeById } = useBuilderStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverParentId, setDragOverParentId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, node: IDslNode) => {
    if (node.id) {
      e.dataTransfer.setData('nodeId', node.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, node: IDslNode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const isContainer = node.type === 'View' || node.type === 'ScrollView';
    if (!isContainer) return;

    const nodeId = e.dataTransfer.getData('nodeId');
    if (!nodeId || nodeId === node.id) return;

    setDragOverParentId(node.id || null);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const children = node.children || [];
    const childCount = children.filter((c) => typeof c !== 'string').length;

    if (childCount === 0) {
      setDragOverIndex(0);
      return;
    }

    const relativeY = y / height;
    const index = Math.floor(relativeY * childCount);
    setDragOverIndex(Math.min(index, childCount));
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDragOverParentId(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: IDslNode) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData('nodeId');
    if (!nodeId || nodeId === targetNode.id) {
      handleDragLeave();
      return;
    }

    const isContainer = targetNode.type === 'View' || targetNode.type === 'ScrollView';
    const newParentId = isContainer ? targetNode.id || null : null;
    const dropIndex = dragOverIndex ?? 0;

    moveNode(nodeId, newParentId, dropIndex);

    handleDragLeave();
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
              isEditMode={false}
              onSelect={() => {}}
              onDragStart={() => {}}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onDrop={() => {}}
              dragOverIndex={null}
            />
          ))
        ) : (
          <DslNodeRenderer
            node={dslTree}
            isSelected={false}
            isEditMode={false}
            onSelect={() => {}}
            onDragStart={() => {}}
            onDragOver={() => {}}
            onDragLeave={() => {}}
            onDrop={() => {}}
            dragOverIndex={null}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${className} min-h-full p-8`}
      onClick={handleCanvasClick}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverParentId(null);
        setDragOverIndex(0);
      }}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        const nodeId = e.dataTransfer.getData('nodeId');
        if (nodeId) {
          moveNode(nodeId, null, 0);
        }
        handleDragLeave();
      }}
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {Array.isArray(dslTree) ? (
            dslTree.map((node, index) => (
              <div key={node.id}>
                {dragOverParentId === null && dragOverIndex === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 4 }}
                    exit={{ height: 0 }}
                    className="w-full bg-primary/40 rounded mb-1"
                  />
                )}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <DslNodeRenderer
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    isEditMode={true}
                    onSelect={() => selectNode(node.id || null)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    dragOverIndex={dragOverIndex}
                  />
                </motion.div>
              </div>
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
                isEditMode={true}
                onSelect={() => selectNode(dslTree.id || null)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                dragOverIndex={dragOverIndex}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
