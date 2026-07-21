import {
  makeAction,
  getActionLabel,
  getActionIcon,
} from '../src/features/slides/agent/actionTypes';

describe('actionTypes', () => {
  describe('makeAction', () => {
    it('should create speech action', () => {
      const action = makeAction('speech', '1');
      expect(action).toEqual({ id: '1', type: 'speech', text: '' });
    });

    it('should create spotlight action', () => {
      const action = makeAction('spotlight', '2');
      expect(action).toEqual({ id: '2', type: 'spotlight', elementId: '' });
    });

    it('should create laser action', () => {
      const action = makeAction('laser', '3');
      expect(action).toEqual({ id: '3', type: 'laser', elementId: '' });
    });
  });

  describe('getActionLabel', () => {
    it('should return speech text', () => {
      expect(getActionLabel({ id: '1', type: 'speech', text: 'Hello' } as any)).toBe('Hello');
    });

    it('should return "Speech" for empty text', () => {
      expect(getActionLabel({ id: '1', type: 'speech', text: '' } as any)).toBe('Speech');
    });

    it('should return "Spotlight"', () => {
      expect(getActionLabel({ id: '1', type: 'spotlight', elementId: '' } as any)).toBe('Spotlight');
    });

    it('should return "Laser"', () => {
      expect(getActionLabel({ id: '1', type: 'laser', elementId: '' } as any)).toBe('Laser');
    });

    it('should return discussion topic', () => {
      expect(getActionLabel({ id: '1', type: 'discussion', topic: 'Topic' } as any)).toBe('Topic');
    });
  });

  describe('getActionIcon', () => {
    it('should return 💬 for speech', () => {
      expect(getActionIcon({ id: '1', type: 'speech', text: '' } as any)).toBe('💬');
    });

    it('should return 🔦 for spotlight', () => {
      expect(getActionIcon({ id: '1', type: 'spotlight', elementId: '' } as any)).toBe('🔦');
    });

    it('should return 🔴 for laser', () => {
      expect(getActionIcon({ id: '1', type: 'laser', elementId: '' } as any)).toBe('🔴');
    });
  });
});
