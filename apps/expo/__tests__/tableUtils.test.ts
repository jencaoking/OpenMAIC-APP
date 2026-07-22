import {
  getHiddenCells,
  getTextStyleRN,
  getTableSubThemeColor,
  buildBorderStyle,
} from '../src/features/slides/elements/tableUtils';
import { calculateProgress } from '../src/features/slides/pbl/pblTypes';

describe('tableUtils', () => {
  describe('getHiddenCells', () => {
    it('should return empty set for empty data', () => {
      expect(getHiddenCells([])).toEqual(new Set());
    });

    it('should return empty set when no cells have colspan/rowspan', () => {
      const data = [
        [
          { id: '1', colspan: 1, rowspan: 1, text: 'A' },
          { id: '2', colspan: 1, rowspan: 1, text: 'B' },
        ],
      ];
      expect(getHiddenCells(data)).toEqual(new Set());
    });

    it('should hide cells covered by colspan', () => {
      const data = [
        [
          { id: '1', colspan: 2, rowspan: 1, text: 'A' },
          { id: '2', colspan: 1, rowspan: 1, text: 'B' },
        ],
      ];
      const hidden = getHiddenCells(data);
      expect(hidden.has('0_1')).toBe(true);
    });

    it('should hide cells covered by rowspan', () => {
      const data = [
        [
          { id: '1', colspan: 1, rowspan: 2, text: 'A' },
          { id: '2', colspan: 1, rowspan: 1, text: 'B' },
        ],
        [
          { id: '3', colspan: 1, rowspan: 1, text: 'C' },
          { id: '4', colspan: 1, rowspan: 1, text: 'D' },
        ],
      ];
      const hidden = getHiddenCells(data);
      expect(hidden.has('1_0')).toBe(true);
    });

    it('should handle combined colspan and rowspan', () => {
      const data = [
        [
          { id: '1', colspan: 2, rowspan: 2, text: 'A' },
          { id: '2', colspan: 1, rowspan: 1, text: 'B' },
        ],
        [
          { id: '3', colspan: 1, rowspan: 1, text: 'C' },
          { id: '4', colspan: 1, rowspan: 1, text: 'D' },
        ],
      ];
      const hidden = getHiddenCells(data);
      expect(hidden.has('0_1')).toBe(true);
      expect(hidden.has('1_0')).toBe(true);
      expect(hidden.has('1_1')).toBe(true);
    });
  });

  describe('getTextStyleRN', () => {
    it('should return empty style for undefined', () => {
      expect(getTextStyleRN(undefined)).toEqual({});
    });

    it('should return empty style for empty object', () => {
      expect(getTextStyleRN({})).toEqual({});
    });

    it('should convert bold', () => {
      expect(getTextStyleRN({ bold: true })).toEqual({ fontWeight: '700' });
    });

    it('should convert italic', () => {
      expect(getTextStyleRN({ em: true })).toEqual({ fontStyle: 'italic' });
    });

    it('should convert underline', () => {
      expect(getTextStyleRN({ underline: true })).toEqual({ textDecorationLine: 'underline' });
    });

    it('should convert strikethrough', () => {
      expect(getTextStyleRN({ strikethrough: true })).toEqual({
        textDecorationLine: 'line-through',
      });
    });

    it('should combine underline and strikethrough', () => {
      const result = getTextStyleRN({ underline: true, strikethrough: true });
      expect(result.textDecorationLine).toContain('underline');
      expect(result.textDecorationLine).toContain('line-through');
    });

    it('should convert color', () => {
      expect(getTextStyleRN({ color: '#ff0000' })).toEqual({ color: '#ff0000' });
    });

    it('should convert fontsize', () => {
      expect(getTextStyleRN({ fontsize: '16px' })).toEqual({ fontSize: 16 });
    });

    it('should convert fontname', () => {
      expect(getTextStyleRN({ fontname: 'Arial' })).toEqual({ fontFamily: 'Arial' });
    });

    it('should convert align', () => {
      expect(getTextStyleRN({ align: 'center' })).toEqual({ textAlign: 'center' });
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for empty issues', () => {
      expect(calculateProgress({ agent_ids: [], issues: [], current_issue_id: null })).toBe(0);
    });

    it('should return 0 when no issues done', () => {
      const issueboard = {
        agent_ids: [],
        issues: [
          { id: '1', is_done: false, is_active: true } as any,
          { id: '2', is_done: false, is_active: false } as any,
        ],
        current_issue_id: null,
      };
      expect(calculateProgress(issueboard)).toBe(0);
    });

    it('should return 100 when all issues done', () => {
      const issueboard = {
        agent_ids: [],
        issues: [
          { id: '1', is_done: true, is_active: false } as any,
          { id: '2', is_done: true, is_active: false } as any,
        ],
        current_issue_id: null,
      };
      expect(calculateProgress(issueboard)).toBe(100);
    });

    it('should return 50 when half done', () => {
      const issueboard = {
        agent_ids: [],
        issues: [
          { id: '1', is_done: true, is_active: false } as any,
          { id: '2', is_done: false, is_active: true } as any,
        ],
        current_issue_id: null,
      };
      expect(calculateProgress(issueboard)).toBe(50);
    });
  });

  describe('getTableSubThemeColor', () => {
    it('should return rgba colors for hex input', () => {
      const [dark, light] = getTableSubThemeColor('#7c3aed');
      expect(dark).toContain('rgba');
      expect(light).toContain('rgba');
      expect(dark).toContain('0.3');
      expect(light).toContain('0.1');
    });
  });

  describe('buildBorderStyle', () => {
    it('should return default border when no outline', () => {
      const result = buildBorderStyle(undefined);
      expect(result).toEqual({
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderStyle: 'solid',
      });
    });

    it('should use outline values', () => {
      const result = buildBorderStyle({ width: 2, color: '#000', style: 'dashed' });
      expect(result).toEqual({
        borderWidth: 2,
        borderColor: '#000',
        borderStyle: 'dashed',
      });
    });
  });
});
