/**
 * Builder Store for Mobile.
 *
 * Port of Web's lib/store/builder.ts.
 * Manages DSL tree state with undo/redo.
 */

import { create } from 'zustand';

export type DslComponentType = 'View' | 'Text' | 'Button' | 'Image' | 'TextInput' | 'ScrollView';

export interface IDslNode {
  type: DslComponentType;
  id: string;
  props?: Record<string, unknown>;
  children?: (string | IDslNode)[];
  actions?: Record<string, unknown>;
}

export type DslSchema = IDslNode[];

interface BuilderState {
  dslTree: DslSchema;
  selectedNodeId: string | null;
  clipboardNode: IDslNode | null;
  history: DslSchema[];
  historyIndex: number;
  maxHistory: number;
  isMaterialPanelOpen: boolean;

  // Actions
  setDslTree: (tree: DslSchema) => void;
  updateNode: (nodeId: string, updates: Partial<IDslNode>) => void;
  updateNodeProps: (nodeId: string, path: string[], value: unknown) => void;
  addNode: (parentId: string | null, node: IDslNode) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string | null, index: number) => void;
  selectNode: (nodeId: string | null) => void;
  copyNode: (nodeId: string) => void;
  pasteNode: (parentId: string | null) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  exportJson: () => string;
  importJson: (json: string) => void;
  toggleMaterialPanel: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getNodeById: (nodeId: string) => IDslNode | null;
  clear: () => void;
}

const defaultDslTree: DslSchema = [
  {
    type: 'View',
    id: 'root',
    props: { style: { flex: 1, padding: 20, backgroundColor: '#f8fafc' } },
    children: [
      {
        type: 'Text',
        id: 'welcome-text',
        props: { style: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 } },
        children: ['Welcome to OpenMAIC Builder'],
      },
    ],
  },
];

function findNode(nodes: DslSchema, id: string): IDslNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        if (typeof child === 'object') {
          const found = findNode([child], id);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

function updateNodeInTree(nodes: DslSchema, id: string, updates: Partial<IDslNode>): DslSchema {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          typeof child === 'object' ? (child.id === id ? { ...child, ...updates } : child) : child,
        ),
      };
    }
    return node;
  });
}

function deleteNodeFromTree(nodes: DslSchema, id: string): DslSchema {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children) {
        return {
          ...node,
          children: node.children
            .filter((child) => (typeof child === 'object' ? child.id !== id : true))
            .map((child) =>
              typeof child === 'object'
                ? {
                    ...child,
                    children: deleteNodeFromTree((child.children || []) as IDslNode[], id),
                  }
                : child,
            ),
        };
      }
      return node;
    });
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  dslTree: defaultDslTree,
  selectedNodeId: null,
  clipboardNode: null,
  history: [defaultDslTree],
  historyIndex: 0,
  maxHistory: 50,
  isMaterialPanelOpen: true,

  setDslTree: (tree) => set({ dslTree: tree }),

  updateNode: (nodeId, updates) => {
    const { dslTree } = get();
    set({ dslTree: updateNodeInTree(dslTree, nodeId, updates) });
  },

  updateNodeProps: (nodeId, path, value) => {
    const { dslTree } = get();
    const node = findNode(dslTree, nodeId);
    if (!node) return;

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

    const newProps = updatePropsRecursive(node.props || {}, path, value);
    set({ dslTree: updateNodeInTree(dslTree, nodeId, { props: newProps }) });
  },

  addNode: (parentId, node) => {
    const { dslTree } = get();
    if (!parentId) {
      set({ dslTree: [...dslTree, node] });
    } else {
      set({
        dslTree: dslTree.map((n) =>
          n.id === parentId ? { ...n, children: [...(n.children || []), node] } : n,
        ),
      });
    }
  },

  deleteNode: (nodeId) => {
    const { dslTree } = get();
    set({ dslTree: deleteNodeFromTree(dslTree, nodeId) });
  },

  moveNode: (nodeId, newParentId, index) => {
    const { dslTree } = get();
    // Remove from current position
    const removed = findNode(dslTree, nodeId);
    if (!removed) return;
    const without = deleteNodeFromTree(dslTree, nodeId);
    // Add to new position
    if (!newParentId) {
      const newTree = [...without];
      newTree.splice(index, 0, removed);
      set({ dslTree: newTree });
    } else {
      set({
        dslTree: without.map((n) =>
          n.id === newParentId
            ? {
                ...n,
                children: [
                  ...(n.children || []).slice(0, index),
                  removed,
                  ...(n.children || []).slice(index),
                ],
              }
            : n,
        ),
      });
    }
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  copyNode: (nodeId) => {
    const { dslTree } = get();
    const node = findNode(dslTree, nodeId);
    if (node) set({ clipboardNode: JSON.parse(JSON.stringify(node)) });
  },

  pasteNode: (parentId) => {
    const { dslTree, clipboardNode } = get();
    if (!clipboardNode) return;
    const newNode = {
      ...JSON.parse(JSON.stringify(clipboardNode)),
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    get().addNode(parentId, newNode);
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        dslTree: history[historyIndex - 1],
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        dslTree: history[historyIndex + 1],
      });
    }
  },

  saveToHistory: () => {
    const { dslTree, history, historyIndex, maxHistory } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(dslTree)));
    if (newHistory.length > maxHistory) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  exportJson: () => JSON.stringify(get().dslTree, null, 2),

  importJson: (json) => {
    try {
      const tree = JSON.parse(json) as DslSchema;
      set({ dslTree: tree });
    } catch (e) {
      console.error('Invalid JSON', e);
    }
  },

  toggleMaterialPanel: () => set((s) => ({ isMaterialPanelOpen: !s.isMaterialPanelOpen })),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  getNodeById: (nodeId) => findNode(get().dslTree, nodeId),

  clear: () =>
    set({
      dslTree: defaultDslTree,
      selectedNodeId: null,
      history: [defaultDslTree],
      historyIndex: 0,
    }),
}));
