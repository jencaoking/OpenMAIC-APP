import { useBuilderStore } from '../src/features/slides/builder/builderStore';

describe('builderStore', () => {
  beforeEach(() => {
    useBuilderStore.getState().clear();
  });

  it('should have default DSL tree', () => {
    expect(useBuilderStore.getState().dslTree).toHaveLength(1);
    expect(useBuilderStore.getState().dslTree[0].type).toBe('View');
  });

  it('should add node', () => {
    const node = { type: 'Text', id: 'test-1', props: {}, children: ['Hello'] };
    useBuilderStore.getState().addNode(null, node);
    expect(useBuilderStore.getState().dslTree).toHaveLength(2);
  });

  it('should add node to parent', () => {
    const node = { type: 'Text', id: 'test-1', props: {}, children: ['Hello'] };
    useBuilderStore.getState().addNode('root', node);
    const root = useBuilderStore.getState().dslTree[0];
    expect(root.children).toHaveLength(2);
  });

  it('should select node', () => {
    useBuilderStore.getState().selectNode('root');
    expect(useBuilderStore.getState().selectedNodeId).toBe('root');
  });

  it('should get node by id', () => {
    const node = useBuilderStore.getState().getNodeById('root');
    expect(node).toBeTruthy();
    expect(node?.type).toBe('View');
  });

  it('should undo and redo', () => {
    useBuilderStore.getState().saveToHistory();
    const node = { type: 'Text', id: 'test-1', props: {}, children: ['Hello'] };
    useBuilderStore.getState().addNode(null, node);
    useBuilderStore.getState().saveToHistory();
    expect(useBuilderStore.getState().dslTree).toHaveLength(2);
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().dslTree).toHaveLength(1);
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().dslTree).toHaveLength(2);
  });

  it('should export and import JSON', () => {
    const json = useBuilderStore.getState().exportJson();
    expect(json).toBeTruthy();
    useBuilderStore.getState().importJson(json);
    expect(useBuilderStore.getState().dslTree).toHaveLength(1);
  });
});
