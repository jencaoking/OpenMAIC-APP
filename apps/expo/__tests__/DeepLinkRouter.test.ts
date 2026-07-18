/**
 * @file DeepLinkRouter.test.ts
 * @description Phase 7.5 单元测试：DeepLinkRouter URL 解析。
 */
import { DeepLinkRouter } from '../../src/core/navigation/DeepLinkRouter';

describe('DeepLinkRouter', () => {
  describe('parse(url)', () => {
    it('should parse session URL', () => {
      const target = DeepLinkRouter.parse('openmaic://session/abc-123');
      expect(target).toEqual({
        screen: 'chat',
        params: { sessionId: 'abc-123' },
      });
    });

    it('should parse quiz URL', () => {
      const target = DeepLinkRouter.parse('openmaic://quiz/quiz-456');
      expect(target).toEqual({
        screen: 'quiz',
        params: { quizId: 'quiz-456' },
      });
    });

    it('should parse dsl URL', () => {
      const target = DeepLinkRouter.parse('openmaic://dsl/content-789');
      expect(target).toEqual({
        screen: 'dsl',
        params: { dslId: 'content-789' },
      });
    });

    it('should parse home URL', () => {
      const target = DeepLinkRouter.parse('openmaic://home');
      expect(target).toEqual({
        screen: 'list',
        params: {},
      });
    });

    it('should return null for invalid scheme', () => {
      expect(DeepLinkRouter.parse('https://example.com')).toBeNull();
    });

    it('should return null for malformed URL', () => {
      expect(DeepLinkRouter.parse('openmaic://')).toBeNull();
      expect(DeepLinkRouter.parse('')).toBeNull();
      expect(DeepLinkRouter.parse('not-a-url')).toBeNull();
    });
  });

  describe('fromPayload(payload)', () => {
    it('should extract route from payload.route', () => {
      const target = DeepLinkRouter.fromPayload({
        route: 'session',
        sessionId: 'abc-123',
      });
      expect(target).toEqual({
        screen: 'chat',
        params: { sessionId: 'abc-123' },
      });
    });

    it('should infer route from kind when route is missing', () => {
      const target = DeepLinkRouter.fromPayload({
        kind: 'quiz',
        id: 'quiz-456',
      });
      expect(target).toEqual({
        screen: 'quiz',
        params: { quizId: 'quiz-456' },
      });
    });

    it('should return null for unrecognized payload', () => {
      expect(DeepLinkRouter.fromPayload({})).toBeNull();
    });
  });
});
