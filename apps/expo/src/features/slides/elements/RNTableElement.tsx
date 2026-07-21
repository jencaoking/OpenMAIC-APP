import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PPTTableElement } from '@openmaic/dsl';

interface RNTableElementProps {
  element: PPTTableElement;
}

/**
 * 表格元素渲染器。
 * PPTTableElement 使用 data: TableCell[][]，不是 cols/rows。
 */
export function RNTableElement({ element }: RNTableElementProps) {
  const { data, colWidths } = element;

  if (!data || data.length === 0) return null;

  const totalCols = data[0]?.length ?? 0;

  return (
    <View style={styles.container}>
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => {
            const colWidth = colWidths?.[colIndex] ?? 1 / totalCols;
            return (
              <View
                key={cell.id}
                style={[
                  styles.cell,
                  {
                    flex: colWidth,
                    backgroundColor: cell.style?.backcolor || '#ffffff',
                    borderBottomWidth: rowIndex < data.length - 1 ? 1 : 0,
                    borderRightWidth: colIndex < totalCols - 1 ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    {
                      color: cell.style?.color || '#333333',
                      fontWeight: cell.style?.bold ? '700' : '400',
                      fontStyle: cell.style?.em ? 'italic' : 'normal',
                      textAlign: cell.style?.align || 'left',
                    },
                  ]}
                  numberOfLines={0}
                >
                  {cell.text || ''}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
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
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 4,
  },
  cellText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
