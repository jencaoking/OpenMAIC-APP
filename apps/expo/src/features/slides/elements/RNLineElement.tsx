import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { PPTLineElement } from '@openmaic/dsl';

interface RNLineElementProps {
  element: PPTLineElement;
}

/**
 * 线条元素渲染器。
 * PPTLineElement 使用 start/end 坐标，不是 width/height。
 */
export function RNLineElement({ element }: RNLineElementProps) {
  const { start, end, color, style } = element;

  const strokeWidth = 2;
  const strokeColor = color || '#333333';
  const strokeDasharray = style === 'dashed' ? '8,4' : style === 'dotted' ? '2,2' : undefined;

  // 计算 SVG viewBox
  const minX = Math.min(start[0], end[0]);
  const minY = Math.min(start[1], end[1]);
  const maxX = Math.max(start[0], end[0]);
  const maxY = Math.max(start[1], end[1]);
  const svgWidth = Math.max(maxX - minX + 10, 10);
  const svgHeight = Math.max(maxY - minY + 10, 10);

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={svgHeight}>
        <Line
          x1={start[0] - minX + 5}
          y1={start[1] - minY + 5}
          x2={end[0] - minX + 5}
          y2={end[1] - minY + 5}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 线条默认居中
  },
});
