import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { PPTLineElement } from '@openmaic/dsl';

interface RNLineElementProps {
  element: PPTLineElement;
}

/**
 * 线条元素渲染器。
 * 移植自 Web 端 BaseLineElement。
 */
export function RNLineElement({ element }: RNLineElementProps) {
  const { width, height, outline, rotate } = element;

  const strokeWidth = outline?.width ?? 2;
  const strokeColor = outline?.color ?? '#000000';
  const strokeDasharray = outline?.style === 'dashed' ? '8,4' : 
                          outline?.style === 'dotted' ? '2,2' : undefined;

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ rotate: `${rotate ?? 0}deg` }],
        },
      ]}
    >
      <Svg width={width} height={height}>
        <Line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
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
