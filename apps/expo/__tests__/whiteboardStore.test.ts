import { useWhiteboardStore } from '../src/features/slides/whiteboard/whiteboardStore';

describe('whiteboardStore', () => {
  beforeEach(() => {
    useWhiteboardStore.getState().clearElements();
    useWhiteboardStore.getState().setOpen(false);
  });

  it('should toggle open', () => {
    useWhiteboardStore.getState().toggleOpen();
    expect(useWhiteboardStore.getState().isOpen).toBe(true);
    useWhiteboardStore.getState().toggleOpen();
    expect(useWhiteboardStore.getState().isOpen).toBe(false);
  });

  it('should set elements', () => {
    const elements = [{ id: '1', type: 'text', left: 0, top: 0, width: 100, height: 50 } as any];
    useWhiteboardStore.getState().setElements(elements);
    expect(useWhiteboardStore.getState().elements).toHaveLength(1);
  });

  it('should push snapshot', () => {
    const elements = [{ id: '1', type: 'text' } as any];
    useWhiteboardStore.getState().pushSnapshot(elements);
    expect(useWhiteboardStore.getState().snapshots).toHaveLength(1);
  });

  it('should get snapshot', () => {
    const elements = [{ id: '1', type: 'text' } as any];
    useWhiteboardStore.getState().pushSnapshot(elements);
    const snapshot = useWhiteboardStore.getState().getSnapshot(0);
    expect(snapshot).toBeTruthy();
    expect(snapshot?.elements).toHaveLength(1);
  });

  it('should clear elements', () => {
    useWhiteboardStore.getState().setElements([{ id: '1' } as any]);
    useWhiteboardStore.getState().clearElements();
    expect(useWhiteboardStore.getState().elements).toHaveLength(0);
  });

  it('should restore snapshot', () => {
    const elements = [{ id: '1', type: 'text' } as any];
    useWhiteboardStore.getState().pushSnapshot(elements);
    useWhiteboardStore.getState().clearElements();
    expect(useWhiteboardStore.getState().elements).toHaveLength(0);
    useWhiteboardStore.getState().restoreSnapshot(0);
    expect(useWhiteboardStore.getState().elements).toHaveLength(1);
  });
});
