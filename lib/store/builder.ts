import { create } from 'zustand';
import { createSelectors } from '@/lib/utils/create-selectors';
import type { IDslNode, DslSchema } from '@openmaic/core-engine';
import { createLogger } from '@/lib/logger';

const log = createLogger('BuilderStore');

interface BuilderState {
  dslTree: DslSchema;
  selectedNodeId: string | null;
  clipboardNode: IDslNode | null;
  history: DslSchema[];
  historyIndex: number;
  maxHistory: number;
  isMaterialPanelOpen: boolean;
  setDslTree: (tree: DslSchema) => void;
  updateNode: (nodeId: string, updates: Partial<IDslNode>) => void;
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
  setMaterialPanelOpen: (open: boolean) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getNodeById: (nodeId: string, tree?: DslSchema) => IDslNode | null;
  clear: () => void;
}

const defaultDslTree: DslSchema = [
  {
    type: 'View',
    id: 'root',
    props: { style: { flex: 1, backgroundColor: '#f8fafc', padding: 20 } },
    children: [
      {
        type: 'Text',
        id: 'welcome-text',
        props: { style: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 } },
        children: ['Welcome to OpenMAIC Builder'],
      },
      {
        type: 'View',
        id: 'button-container',
        props: { style: { flexDirection: 'row', gap: 12 } },
        children: [
          {
            type: 'Button',
            id: 'primary-btn',
            props: { style: { padding: '12px 24px', backgroundColor: '#722ed1', color: 'white', borderRadius: 8 } },
            children: ['Get Started'],
            actions: {
              onPress: { type: 'NAVIGATE', payload: { path: '/dashboard' } },
            },
          },
          {
            type: 'Button',
            id: 'secondary-btn',
            props: { style: { padding: '12px 24px', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: 8 } },
            children: ['Learn More'],
          },
        ],
      },
    ],
  },
];

function findNodeById(node: IDslNode | string, targetId: string): IDslNode | null {
  if (typeof node === 'string') return null;
  if (node.id === targetId) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

function findNodeInTree(tree: DslSchema, nodeId: string): IDslNode | null {
  if (Array.isArray(tree)) {
    for (const node of tree) {
      const found = findNodeById(node, nodeId);
      if (found) return found;
    }
  } else {
    return findNodeById(tree, nodeId);
  }
  return null;
}

function removeNodeById(
  node: IDslNode | string,
  nodeId: string,
): { node: IDslNode | string; removed: boolean } {
  if (typeof node === 'string') return { node, removed: false };
  if (node.id === nodeId) return { node: '', removed: true };

  if (node.children) {
    const newChildren: (IDslNode | string)[] = [];
    let removed = false;
    for (const child of node.children) {
      const result = removeNodeById(child, nodeId);
      if (!result.removed) {
        if (result.node !== '') {
          newChildren.push(result.node);
        }
      } else {
        removed = true;
      }
    }
    if (removed) {
      return { node: { ...node, children: newChildren.length > 0 ? newChildren : undefined }, removed: true };
    }
  }
  return { node, removed: false };
}

function removeNodeFromTree(tree: DslSchema, nodeId: string): DslSchema {
  if (Array.isArray(tree)) {
    const result: IDslNode[] = [];
    for (const node of tree) {
      const res = removeNodeById(node, nodeId);
      if (!res.removed && res.node !== '') {
        result.push(res.node as IDslNode);
      }
    }
    return result;
  } else {
    const res = removeNodeById(tree, nodeId);
    if (!res.removed && res.node !== '') {
      return res.node as IDslNode;
    }
    return [];
  }
}

function addNodeToParent(
  node: IDslNode | string,
  parentId: string,
  newNode: IDslNode,
): { node: IDslNode | string; added: boolean } {
  if (typeof node === 'string') return { node, added: false };
  if (node.id === parentId) {
    return {
      node: {
        ...node,
        children: node.children ? [...node.children, newNode] : [newNode],
      },
      added: true,
    };
  }

  if (node.children) {
    const newChildren: (IDslNode | string)[] = [];
    let added = false;
    for (const child of node.children) {
      const result = addNodeToParent(child, parentId, newNode);
      newChildren.push(result.node);
      if (result.added) added = true;
    }
    if (added) {
      return { node: { ...node, children: newChildren }, added: true };
    }
  }
  return { node, added: false };
}

function addNodeToTree(tree: DslSchema, parentId: string, newNode: IDslNode): DslSchema {
  if (Array.isArray(tree)) {
    const result: IDslNode[] = [];
    let added = false;
    for (const node of tree) {
      const res = addNodeToParent(node, parentId, newNode);
      result.push(res.node as IDslNode);
      if (res.added) added = true;
    }
    if (!added && parentId === null) {
      result.push(newNode);
    }
    return result;
  } else {
    const res = addNodeToParent(tree, parentId, newNode);
    if (res.added) {
      return res.node as IDslNode;
    }
    if (parentId === null) {
      return [tree, newNode];
    }
    return tree;
  }
}

const useBuilderStoreBase = create<BuilderState>()((set, get) => ({
  dslTree: defaultDslTree,
  selectedNodeId: null,
  clipboardNode: null,
  history: [JSON.parse(JSON.stringify(defaultDslTree))],
  historyIndex: 0,
  maxHistory: 50,

  isMaterialPanelOpen: false,

  setDslTree: (tree) => {
    set({ dslTree: tree });
    get().saveToHistory();
  },

  updateNode: (nodeId, updates) => {
    const updateNodeRecursive = (node: IDslNode | string): IDslNode | string => {
      if (typeof node === 'string') return node;
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursive),
        };
      }
      return node;
    };

    const { dslTree } = get();
    let newTree: DslSchema;
    if (Array.isArray(dslTree)) {
      newTree = dslTree.map(updateNodeRecursive) as IDslNode[];
    } else {
      newTree = updateNodeRecursive(dslTree) as IDslNode;
    }
    set({ dslTree: newTree });
    get().saveToHistory();
  },

  addNode: (parentId, node) => {
    const { dslTree } = get();
    const newTree = addNodeToTree(dslTree, parentId || '', node);
    set({ dslTree: newTree });
    get().saveToHistory();
  },

  deleteNode: (nodeId) => {
    const { dslTree, selectedNodeId } = get();
    const newTree = removeNodeFromTree(dslTree, nodeId);
    set({
      dslTree: newTree,
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    });
    get().saveToHistory();
  },

  moveNode: (nodeId, newParentId, index) => {
    const { dslTree } = get();
    const node = get().getNodeById(nodeId, dslTree);
    if (!node) return;

    let tempTree = removeNodeFromTree(dslTree, nodeId);

    const addAtIndex = (
      tree: DslSchema,
      parentId: string | null,
      nodeToAdd: IDslNode,
      targetIndex: number,
    ): DslSchema => {
      if (Array.isArray(tree)) {
        if (parentId === null) {
          const result = [...tree];
          result.splice(targetIndex, 0, nodeToAdd);
          return result;
        }
        const result = tree.map((n) => addAtIndex(n, parentId, nodeToAdd, targetIndex));
        return result as IDslNode[];
      }

      if (tree.id === parentId) {
        const children = tree.children || [];
        const result = [...children];
        result.splice(targetIndex, 0, nodeToAdd);
        return { ...tree, children: result };
      }

      if (tree.children) {
        const newChildren = tree.children.map((n) =>
          addAtIndex(n as IDslNode, parentId, nodeToAdd, targetIndex),
        );
        return {
          ...tree,
          children: newChildren as (IDslNode | string)[],
        };
      }
      return tree;
    };

    const newTree = addAtIndex(tempTree, newParentId, node, index);
    set({ dslTree: newTree });
    get().saveToHistory();
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  copyNode: (nodeId) => {
    const node = get().getNodeById(nodeId);
    if (node) {
      const copied = JSON.parse(JSON.stringify(node));
      copied.id = `${nodeId}-copy-${Date.now()}`;
      set({ clipboardNode: copied });
    }
  },

  pasteNode: (parentId) => {
    const { clipboardNode } = get();
    if (clipboardNode) {
      const pasted = JSON.parse(JSON.stringify(clipboardNode));
      pasted.id = `${clipboardNode.id}-pasted-${Date.now()}`;
      get().addNode(parentId, pasted);
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        dslTree: JSON.parse(JSON.stringify(history[newIndex])),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        dslTree: JSON.parse(JSON.stringify(history[newIndex])),
        historyIndex: newIndex,
      });
    }
  },

  saveToHistory: () => {
    const { dslTree, history, historyIndex, maxHistory } = get();
    const newSnapshot = JSON.parse(JSON.stringify(dslTree));

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSnapshot);

    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  exportJson: () => {
    return JSON.stringify(get().dslTree, null, 2);
  },

  importJson: (json) => {
    try {
      const parsed = JSON.parse(json);
      set({ dslTree: parsed });
      get().saveToHistory();
      log.info('DSL tree imported successfully');
    } catch (error) {
      log.error('Failed to import DSL tree:', error);
      throw error;
    }
  },

  toggleMaterialPanel: () => {
    set((s) => ({ isMaterialPanelOpen: !s.isMaterialPanelOpen }));
  },

  setMaterialPanelOpen: (open) => {
    set({ isMaterialPanelOpen: open });
  },

  canUndo: () => {
    return get().historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  getNodeById: (nodeId, tree = get().dslTree) => {
    return findNodeInTree(tree, nodeId);
  },

  clear: () => {
    set({
      dslTree: defaultDslTree,
      selectedNodeId: null,
      clipboardNode: null,
      history: [JSON.parse(JSON.stringify(defaultDslTree))],
      historyIndex: 0,
    });
  },
}));

export const useBuilderStore = createSelectors(useBuilderStoreBase);