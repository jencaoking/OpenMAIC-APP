import { getClipShape, getImagePosition } from '../src/features/slides/elements/imageClipUtils';

describe('imageClipUtils', () => {
  describe('getClipShape', () => {
    it('should return rect for undefined shape', () => {
      const result = getClipShape(undefined, 100, 100);
      expect(result.type).toBe('rect');
    });

    it('should return rect for "rect" shape', () => {
      const result = getClipShape('rect', 100, 100);
      expect(result.type).toBe('rect');
    });

    it('should return roundRect with radius', () => {
      const result = getClipShape('roundRect', 100, 100, 10);
      expect(result.type).toBe('roundRect');
      expect(result.borderRadius).toBe(10);
    });

    it('should return roundRect with default radius', () => {
      const result = getClipShape('roundRect', 100, 100);
      expect(result.type).toBe('roundRect');
      expect(result.borderRadius).toBe(10);
    });

    it('should return ellipse shape', () => {
      const result = getClipShape('ellipse', 200, 100);
      expect(result.type).toBe('ellipse');
      expect(result.svgPath).toContain('A');
    });

    it('should return polygon for triangle', () => {
      const result = getClipShape('triangle', 100, 100);
      expect(result.type).toBe('polygon');
      expect(result.svgPath).toContain('M');
      expect(result.svgPath).toContain('Z');
    });

    it('should return polygon for rhombus', () => {
      const result = getClipShape('rhombus', 100, 100);
      expect(result.type).toBe('polygon');
    });

    it('should return polygon for hexagon', () => {
      const result = getClipShape('hexagon', 100, 100);
      expect(result.type).toBe('polygon');
    });

    it('should return rect for unknown shape', () => {
      const result = getClipShape('unknown', 100, 100);
      expect(result.type).toBe('rect');
    });
  });

  describe('getImagePosition', () => {
    it('should return full image when no range', () => {
      const result = getImagePosition(undefined);
      expect(result).toEqual({
        top: 0,
        left: 0,
        widthPercent: 100,
        heightPercent: 100,
      });
    });

    it('should calculate position from range', () => {
      const result = getImagePosition([
        [10, 10],
        [90, 90],
      ]);
      expect(result.left).toBeLessThan(0);
      expect(result.top).toBeLessThan(0);
      expect(result.widthPercent).toBeGreaterThan(100);
      expect(result.heightPercent).toBeGreaterThan(100);
    });

    it('should handle full range', () => {
      const result = getImagePosition([
        [0, 0],
        [100, 100],
      ]);
      expect(result.left).toBeCloseTo(0);
      expect(result.top).toBeCloseTo(0);
      expect(result.widthPercent).toBe(100);
      expect(result.heightPercent).toBe(100);
    });
  });
});
