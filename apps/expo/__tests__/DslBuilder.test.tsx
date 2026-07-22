// Simple module-level tests that don't require React rendering
describe('DslBuilder module', () => {
  it('should export builder store', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    expect(useBuilderStore).toBeDefined();
  });

  it('should manage DSL tree state', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    useBuilderStore.getState().clear();
    const tree = useBuilderStore.getState().dslTree;
    expect(tree).toHaveLength(1);
    expect(tree[0].type).toBe('View');
  });

  it('should add and remove nodes', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    useBuilderStore.getState().clear();
    const node = { type: 'Text', id: 'test-1', props: {}, children: ['Hello'] };
    useBuilderStore.getState().addNode(null, node);
    // Must call getState() again to get updated state
    expect(useBuilderStore.getState().dslTree).toHaveLength(2);
    useBuilderStore.getState().deleteNode('test-1');
    expect(useBuilderStore.getState().dslTree).toHaveLength(1);
  });

  it('should undo and redo', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    useBuilderStore.getState().clear();
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
});
