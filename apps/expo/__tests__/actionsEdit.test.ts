import {
  insertAt,
  removeById,
  moveByIdDir,
  moveById,
  setSpeechText,
  setDiscussionTopic,
  setElementId,
  hasDiscussion,
  appendDiscussion,
} from '../src/features/slides/agent/actionsEdit';

describe('actionsEdit', () => {
  const speechAction = { id: '1', type: 'speech', text: 'Hello' };
  const spotlightAction = { id: '2', type: 'spotlight', elementId: 'el1' };
  const laserAction = { id: '3', type: 'laser', elementId: 'el2' };
  const discussionAction = { id: '4', type: 'discussion', topic: 'Topic' };

  describe('insertAt', () => {
    it('should insert at beginning', () => {
      const result = insertAt([speechAction], 0, spotlightAction);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('should insert at end', () => {
      const result = insertAt([speechAction], 1, spotlightAction);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('removeById', () => {
    it('should remove action by id', () => {
      const result = removeById([speechAction, spotlightAction], '1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return same array if id not found', () => {
      const result = removeById([speechAction], '999');
      expect(result).toHaveLength(1);
    });
  });

  describe('moveByIdDir', () => {
    it('should move up', () => {
      const result = moveByIdDir([speechAction, spotlightAction, laserAction], '2', 'up');
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('should move down', () => {
      const result = moveByIdDir([speechAction, spotlightAction, laserAction], '1', 'down');
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('should not move if at boundary', () => {
      const result = moveByIdDir([speechAction, spotlightAction], '1', 'up');
      expect(result[0].id).toBe('1');
    });
  });

  describe('moveById', () => {
    it('should move to target index', () => {
      const result = moveById([speechAction, spotlightAction, laserAction], '1', 2);
      expect(result[2].id).toBe('1');
    });
  });

  describe('setSpeechText', () => {
    it('should update speech text', () => {
      const result = setSpeechText([speechAction], '1', 'New text');
      expect(result[0].text).toBe('New text');
    });
  });

  describe('setDiscussionTopic', () => {
    it('should update discussion topic', () => {
      const result = setDiscussionTopic([discussionAction], '4', 'New topic');
      expect(result[0].topic).toBe('New topic');
    });
  });

  describe('setElementId', () => {
    it('should update spotlight elementId', () => {
      const result = setElementId([spotlightAction], '2', 'new-el');
      expect(result[0].elementId).toBe('new-el');
    });

    it('should update laser elementId', () => {
      const result = setElementId([laserAction], '3', 'new-el');
      expect(result[0].elementId).toBe('new-el');
    });
  });

  describe('hasDiscussion', () => {
    it('should return true when discussion exists', () => {
      expect(hasDiscussion([discussionAction])).toBe(true);
    });

    it('should return false when no discussion', () => {
      expect(hasDiscussion([speechAction, spotlightAction])).toBe(false);
    });
  });

  describe('appendDiscussion', () => {
    it('should append discussion', () => {
      const result = appendDiscussion([speechAction], '4');
      expect(result).toHaveLength(2);
      expect(result[1].type).toBe('discussion');
    });

    it('should not append if already exists', () => {
      const result = appendDiscussion([discussionAction], '5');
      expect(result).toHaveLength(1);
    });
  });
});
