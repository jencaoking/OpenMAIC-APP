import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PPTTableElement } from '@openmaic/dsl';

interface RNTableElementProps {
  element: PPTTableElement;
}

/**
 * 表格元素渲染器。
 * 移植自 Web 端 BaseTableElement。
 *
 * 使用 flexbox 布局实现表格。
 */
export function RNTableElement({ element }: RNTableElementProps) {
  const { cols, rows, style, data } = element;

  if (!data || data.length === 0) return null;

  const colWidth = element.width / cols;

  return (
    <View style={[styles.container, { width: element.width, height: element.height }]}>
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.cell,
                {
                  width: colWidth,
                  backgroundColor: cell?.style?.backgroundColor || '#ffffff',
                  borderBottomWidth: rowIndex < data.length - 1 ? 1 : 0,
                  borderRightWidth: colIndex < cols - 1 ? 1 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  {
                    color: cell?.style?.color || '#333333',
                    fontWeight: cell?.style?.bold ? '700' : '400',
                    fontStyle: cell?.style?.italic ? 'italic' : 'normal',
                    textAlign: cell?.style?.align || 'left',
                  },
                ]}
                numberOfLines={0}
              >
                {cell?.text || ''}
              </Text>
            </View>
          ))}
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
