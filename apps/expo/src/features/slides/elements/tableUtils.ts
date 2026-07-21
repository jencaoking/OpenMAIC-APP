import type { TextStyle } from 'react-native';
import type { TableCell, TableCellStyle } from '@openmaic/dsl';

/**
 * Convert TableCellStyle to React Native TextStyle.
 * Port of Web's tableUtils.ts getTextStyle().
 */
export function getTextStyleRN(style?: TableCellStyle): TextStyle {
  if (!style) return {};

  const ts: TextStyle = {};

  if (style.bold) ts.fontWeight = '700';
  if (style.em) ts.fontStyle = 'italic';
  if (style.underline) ts.textDecorationLine = 'underline';
  if (style.strikethrough) {
    ts.textDecorationLine = ts.textDecorationLine
      ? `${ts.textDecorationLine} line-through`
      : 'line-through';
  }
  if (style.color) ts.color = style.color;
  if (style.backcolor) ts.backgroundColor = style.backcolor;
  if (style.fontsize) ts.fontSize = parseInt(style.fontsize, 10) || 12;
  if (style.fontname) ts.fontFamily = style.fontname;
  if (style.align) ts.textAlign = style.align;

  return ts;
}

/**
 * Format text for RN: preserve \n (RN Text handles newlines natively).
 * Port of Web's tableUtils.ts formatText() simplified for RN.
 */
export function formatTextRN(text: unknown): string {
  if (typeof text !== 'string') return '';
  return text;
}

/**
 * Compute hidden cell positions based on colspan/rowspan merges.
 * Returns a Set of "row_col" keys for cells that should be hidden.
 * Port of Web's tableUtils.ts getHiddenCells() — identical algorithm.
 */
export function getHiddenCells(data: TableCell[][]): Set<string> {
  const hidden = new Set<string>();

  for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (!Array.isArray(row)) continue;

    let realColIdx = 0;
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      // Skip positions already occupied by a previous merge
      while (hidden.has(`${rowIdx}_${realColIdx}`)) {
        realColIdx++;
      }

      const cell = row[colIdx];
      const colspan = Number.isFinite(cell?.colspan) && cell.colspan > 0 ? cell.colspan : 1;
      const rowspan = Number.isFinite(cell?.rowspan) && cell.rowspan > 0 ? cell.rowspan : 1;

      if (colspan > 1 || rowspan > 1) {
        for (let r = 0; r < rowspan; r++) {
          for (let c = 0; c < colspan; c++) {
            if (r === 0 && c === 0) continue;
            hidden.add(`${rowIdx + r}_${realColIdx + c}`);
          }
        }
      }

      realColIdx += colspan;
    }
  }

  return hidden;
}

/**
 * Parse a CSS border shorthand (e.g. "1px solid #000") into components.
 */
function parseBorder(border: string): { width: number; style: string; color: string } {
  const parts = border.split(' ').filter(Boolean);
  return {
    width: parseInt(parts[0], 10) || 1,
    style: parts[1] || 'solid',
    color: parts[2] || '#000',
  };
}

/**
 * Get table sub-theme colors using simple hex→rgba conversion.
 * Port of Web's getTableSubThemeColor() but without tinycolor dependency.
 *
 * Returns [darkVariant (30% alpha), lightVariant (10% alpha)]
 */
export function getTableSubThemeColor(themeColor: string): [string, string] {
  const rgb = hexToRgb(themeColor);
  if (!rgb) return ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)'];
  return [
    `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
    `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`,
  ];
}

/**
 * Convert hex color to RGB object.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle rgb()/rgba() strings
  const rgbMatch = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
  }

  // Handle hex strings
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6) return null;

  const num = parseInt(h, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Build border style string for RN from table outline config.
 */
export function buildBorderStyle(
  outline?: { width?: number; color?: string; style?: string },
): { borderWidth: number; borderColor: string; borderStyle: 'solid' | 'dashed' | 'dotted' } {
  if (!outline) {
    return { borderWidth: 1, borderColor: '#e5e5e5', borderStyle: 'solid' };
  }
  return {
    borderWidth: outline.width ?? 1,
    borderColor: outline.color ?? '#000',
    borderStyle: outline.style === 'dashed' ? 'dashed' : outline.style === 'dotted' ? 'dotted' : 'solid',
  };
}
