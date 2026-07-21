import { useTeachingStore } from '../src/features/slides/teachingStore';

describe('teachingStore', () => {
  beforeEach(() => {
    useTeachingStore.getState().clearAllEffects();
  });

  describe('Spotlight', () => {
    it('should set spotlight', () => {
      useTeachingStore.getState().setSpotlight('el1');
      const state = useTeachingStore.getState();
      expect(state.spotlightElementId).toBe('el1');
      expect(state.spotlightOptions).toBeTruthy();
    });

    it('should clear spotlight', () => {
      useTeachingStore.getState().setSpotlight('el1');
      useTeachingStore.getState().clearSpotlight();
      expect(useTeachingStore.getState().spotlightElementId).toBe('');
    });
  });

  describe('Highlight', () => {
    it('should set highlight', () => {
      useTeachingStore.getState().setHighlight(['el1', 'el2']);
      const state = useTeachingStore.getState();
      expect(state.highlightedElementIds).toEqual(['el1', 'el2']);
      expect(state.highlightOptions).toBeTruthy();
    });

    it('should clear highlight', () => {
      useTeachingStore.getState().setHighlight(['el1']);
      useTeachingStore.getState().clearHighlight();
      expect(useTeachingStore.getState().highlightedElementIds).toEqual([]);
    });
  });

  describe('Laser', () => {
    it('should set laser', () => {
      useTeachingStore.getState().setLaser('el1');
      const state = useTeachingStore.getState();
      expect(state.laserElementId).toBe('el1');
      expect(state.laserOptions).toBeTruthy();
    });

    it('should clear laser', () => {
      useTeachingStore.getState().setLaser('el1');
      useTeachingStore.getState().clearLaser();
      expect(useTeachingStore.getState().laserElementId).toBe('');
    });
  });

  describe('clearAllEffects', () => {
    it('should clear all effects', () => {
      useTeachingStore.getState().setSpotlight('el1');
      useTeachingStore.getState().setHighlight(['el1']);
      useTeachingStore.getState().setLaser('el1');
      useTeachingStore.getState().clearAllEffects();
      const state = useTeachingStore.getState();
      expect(state.spotlightElementId).toBe('');
      expect(state.highlightedElementIds).toEqual([]);
      expect(state.laserElementId).toBe('');
    });
  });
});
