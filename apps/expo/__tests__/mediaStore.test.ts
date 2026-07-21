import { useMediaGenerationStore } from '../src/core/media/mediaStore';

describe('mediaStore', () => {
  beforeEach(() => {
    useMediaGenerationStore.getState().clearTasks();
  });

  it('should enqueue tasks', () => {
    const requests = [
      { type: 'image' as const, prompt: 'test', elementId: 'el1' },
    ];
    useMediaGenerationStore.getState().enqueueTasks('stage1', requests);
    expect(useMediaGenerationStore.getState().getTasksByStatus('pending')).toHaveLength(1);
  });

  it('should mark generating', () => {
    useMediaGenerationStore.getState().enqueueTasks('stage1', [
      { type: 'image', prompt: 'test', elementId: 'el1' },
    ]);
    useMediaGenerationStore.getState().markGenerating('el1');
    expect(useMediaGenerationStore.getState().getTask('el1')?.status).toBe('generating');
  });

  it('should mark done', () => {
    useMediaGenerationStore.getState().enqueueTasks('stage1', [
      { type: 'image', prompt: 'test', elementId: 'el1' },
    ]);
    useMediaGenerationStore.getState().markDone('el1', 'http://example.com/img.png');
    expect(useMediaGenerationStore.getState().getTask('el1')?.status).toBe('done');
  });

  it('should mark failed', () => {
    useMediaGenerationStore.getState().enqueueTasks('stage1', [
      { type: 'image', prompt: 'test', elementId: 'el1' },
    ]);
    useMediaGenerationStore.getState().markFailed('el1', 'Error', 'TEST_ERROR');
    expect(useMediaGenerationStore.getState().getTask('el1')?.status).toBe('failed');
  });
});
