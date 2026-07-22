// Simple module-level tests that don't require React rendering
describe('DslBuilder module', () => {
  it('should export builder store', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    expect(useBuilderStore).toBeDefined();
  });

  it('should manage DSL tree state', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    const store = useBuilderStore.getState();
    store.clear();
    expect(store.dslTree).toHaveLength(1);
    expect(store.dslTree[0].type).toBe('View');
  });

  it('should add and remove nodes', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    const store = useBuilderStore.getState();
    store.clear();
    const node = { type: 'Text', id: 'test-1', props: {}, children: ['Hello'] };
    store.addNode(null, node);
    expect(store.dslTree).toHaveLength(2);
    store.deleteNode('test-1');
    expect(store.dslTree).toHaveLength(1);
  });

  it('should undo and redo', () => {
    const { useBuilderStore } = require('../src/features/slides/builder/builderStore');
    const store = useBuilderStore.getState();
    store.clear();
    store.saveToHistory();
    const node = { type: 'Text', id: 'test-1', props: {}, children: ['Hello'] };
    store.addNode(null, node);
    store.saveToHistory();
    expect(store.dslTree).toHaveLength(2);
    store.undo();
    expect(store.dslTree).toHaveLength(1);
    store.redo();
    expect(store.dslTree).toHaveLength(2);
  });
});
