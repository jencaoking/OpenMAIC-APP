import React, { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import type { PPTTableElement, TableCell } from '@openmaic/dsl';
import {
  getHiddenCells,
  getTextStyleRN,
  getTableSubThemeColor,
  buildBorderStyle,
} from './tableUtils';

interface RNTableElementProps {
  element: PPTTableElement;
}

/**
 * Table element renderer with full colspan/rowspan support.
 *
 * Port of Web's StaticTable.tsx — supports:
 * - colspan/rowspan cell merging
 * - Theme colors (rowHeader, rowFooter, colHeader, colFooter, alternating)
 * - Outline borders (width, color, style)
 * - Per-cell styling (bold, italic, underline, strikethrough, color, align)
 * - Row heights (rowHeights[] or cellMinHeight)
 */
export function RNTableElement({ element }: RNTableElementProps) {
  const {
    width: tableWidth,
    data,
    colWidths,
    rowHeights,
    cellMinHeight = 40,
    outline,
    theme,
  } = element;

  const tableData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const tableColWidths = useMemo(() => (Array.isArray(colWidths) ? colWidths : []), [colWidths]);
  const tableRowHeights = useMemo(
    () => (Array.isArray(rowHeights) ? rowHeights : []),
    [rowHeights],
  );

  const totalCols = tableData[0]?.length ?? 0;
  const safeWidth = Number.isFinite(tableWidth) && tableWidth > 0 ? tableWidth : 1;
  const safeCellMinHeight =
    Number.isFinite(cellMinHeight) && cellMinHeight >= 0 ? cellMinHeight : 40;

  // Compute hidden cells from merges
  const hiddenCells = useMemo(() => getHiddenCells(tableData), [tableData]);

  // Compute sub-theme colors
  const [subThemeDark, subThemeLight] = useMemo(() => {
    if (!theme) return ['', ''] as const;
    return getTableSubThemeColor(theme.color);
  }, [theme]);

  // Parse outline border
  const borderConfig = useMemo(() => buildBorderStyle(outline), [outline]);

  // Build border style for each cell side
  const getCellBorder = (
    rowIdx: number,
    colIdx: number,
    cell: TableCell,
  ): ViewStyle => {
    // Per-cell borders take priority
    if (cell.borders) {
      const b = cell.borders;
      return {
        borderTopWidth: b.top?.width ?? 0,
        borderTopColor: b.top?.color ?? 'transparent',
        borderTopStyle: b.top?.style ?? 'solid',
        borderBottomWidth: b.bottom?.width ?? 0,
        borderBottomColor: b.bottom?.color ?? 'transparent',
        borderBottomStyle: b.bottom?.style ?? 'solid',
        borderLeftWidth: b.left?.width ?? 0,
        borderLeftColor: b.left?.color ?? 'transparent',
        borderLeftStyle: b.left?.style ?? 'solid',
        borderRightWidth: b.right?.width ?? 0,
        borderRightColor: b.right?.color ?? 'transparent',
        borderRightStyle: b.right?.style ?? 'solid',
      } as ViewStyle;
    }

    // Fallback to table-level outline
    const { borderWidth, borderColor, borderStyle } = borderConfig;
    return {
      borderWidth,
      borderColor,
      borderStyle,
    } as ViewStyle;
  };

  // Get background color for a cell based on theme and position
  const getCellBg = (rowIdx: number, colIdx: number, cellBackcolor?: string): string | undefined => {
    if (cellBackcolor) return cellBackcolor;
    if (!theme) return undefined;

    const rowCount = tableData.length;
    const colCount = tableData[0]?.length ?? 0;

    // Row header (first row) gets theme color
    if (theme.rowHeader && rowIdx === 0) return theme.color;
    // Row footer (last row) gets theme color
    if (theme.rowFooter && rowIdx === rowCount - 1) return theme.color;
    // Col header (first col) gets dark sub-theme
    if (theme.colHeader && colIdx === 0) return subThemeDark;
    // Col footer (last col) gets dark sub-theme
    if (theme.colFooter && colIdx === colCount - 1) return subThemeDark;

    // Alternating row colors (skip header row for counting)
    const effectiveRow = theme.rowHeader ? rowIdx - 1 : rowIdx;
    if (effectiveRow >= 0 && effectiveRow % 2 === 0) return subThemeLight;

    return undefined;
  };

  // Get text color for header/footer rows (white text on dark bg)
  const getHeaderTextColor = (rowIdx: number): string | undefined => {
    if (!theme) return undefined;
    const rowCount = tableData.length;
    if (theme.rowHeader && rowIdx === 0) return '#fff';
    if (theme.rowFooter && rowIdx === rowCount - 1) return '#fff';
    return undefined;
  };

  if (tableData.length === 0) return null;

  return (
    <View style={styles.container}>
      {tableData.map((row, rowIdx) => {
        const rowHeight = Number.isFinite(tableRowHeights[rowIdx])
          ? tableRowHeights[rowIdx]
          : safeCellMinHeight;

        return (
          <View
            key={rowIdx}
            style={[styles.row, { minHeight: rowHeight }]}
          >
            {(Array.isArray(row) ? row : []).map((cell, colIdx) => {
              // Skip positions occupied by a previous merge
              if (hiddenCells.has(`${rowIdx}_${colIdx}`)) return null;
              if (!cell) return null;

              const colspan =
                Number.isFinite(cell.colspan) && cell.colspan > 0 ? cell.colspan : 1;
              const rowspan =
                Number.isFinite(cell.rowspan) && cell.rowspan > 0 ? cell.rowspan : 1;

              // Compute cell width based on colspan
              const colWidth = tableColWidths[colIdx] ?? 1 / totalCols;
              let cellFlex = colWidth;
              for (let c = 1; c < colspan; c++) {
                cellFlex += tableColWidths[colIdx + c] ?? 1 / totalCols;
              }

              const bgColor = getCellBg(rowIdx, colIdx, cell.style?.backcolor);
              const headerColor = getHeaderTextColor(rowIdx);
              const cellTextStyle = getTextStyleRN(cell.style);
              const cellBorder = getCellBorder(rowIdx, colIdx, cell);

              // Header text color should be overridden only if cell doesn't have its own color
              if (headerColor && !cell.style?.color) {
                cellTextStyle.color = headerColor;
              }

              return (
                <View
                  key={cell.id || `${rowIdx}-${colIdx}`}
                  style={[
                    styles.cell,
                    cellBorder,
                    {
                      flex: cellFlex,
                      backgroundColor: bgColor || '#ffffff',
                    },
                    // Override borderWidth 0 when merging spans
                    colspan > 1 ? { borderRightWidth: 0 } : undefined,
                    rowspan > 1 ? { borderBottomWidth: 0 } : undefined,
                  ]}
                >
                  <Text
                    style={[styles.cellText, cellTextStyle]}
                    numberOfLines={0}
                  >
                    {cell.text || ''}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    padding: 5,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
