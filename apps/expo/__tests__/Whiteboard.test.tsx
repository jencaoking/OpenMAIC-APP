// Simple module-level tests that don't require React rendering
describe('Whiteboard module', () => {
  it('should export whiteboard store', () => {
    const { useWhiteboardStore } = require('../src/features/slides/whiteboard/whiteboardStore');
    expect(useWhiteboardStore).toBeDefined();
  });

  it('should manage whiteboard state', () => {
    const { useWhiteboardStore } = require('../src/features/slides/whiteboard/whiteboardStore');
    const store = useWhiteboardStore.getState();
    store.clearElements();
    store.setOpen(false);
    expect(store.isOpen).toBe(false);
    expect(store.elements).toHaveLength(0);
  });
});
