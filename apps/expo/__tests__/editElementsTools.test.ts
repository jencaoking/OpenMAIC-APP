import {
  validatePatches,
  patchesToIntents,
} from '../src/features/slides/agent/tools/editElements';

describe('editElementsTools', () => {
  describe('validatePatches', () => {
    it('should validate empty patches', () => {
      expect(validatePatches([], ['1', '2'])).toEqual({ valid: true });
    });

    it('should validate valid patches', () => {
      const patches = [
        { op: 'test' as const, path: '/elements/0/id', value: '1' },
        { op: 'replace' as const, path: '/elements/0/content', value: 'new' },
      ];
      expect(validatePatches(patches, ['1', '2'])).toEqual({ valid: true });
    });

    it('should reject invalid element index', () => {
      const patches = [
        { op: 'replace' as const, path: '/elements/5/content', value: 'new' },
      ];
      const result = validatePatches(patches, ['1', '2']);
      expect(result.valid).toBe(false);
    });

    it('should reject test with unknown id', () => {
      const patches = [
        { op: 'test' as const, path: '/elements/0/id', value: 'unknown' },
      ];
      const result = validatePatches(patches, ['1', '2']);
      expect(result.valid).toBe(false);
    });
  });

  describe('patchesToIntents', () => {
    it('should convert replace patches to intents', () => {
      const patches = [
        { op: 'replace' as const, path: '/elements/0/content', value: { text: 'new' } },
      ];
      const intents = patchesToIntents(patches, ['el1', 'el2']);
      expect(intents).toHaveLength(1);
      expect(intents[0].type).toBe('update_element');
      expect(intents[0].elementId).toBe('el1');
    });

    it('should skip test patches', () => {
      const patches = [
        { op: 'test' as const, path: '/elements/0/id', value: 'el1' },
      ];
      const intents = patchesToIntents(patches, ['el1']);
      expect(intents).toHaveLength(0);
    });
  });
});
