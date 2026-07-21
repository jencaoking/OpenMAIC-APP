import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { PPTShapeElement } from '@openmaic/dsl';

interface RNShapeElementProps {
  element: PPTShapeElement;
}

/**
 * 形状元素渲染器。
 * 移植自 Web 端 BaseShapeElement。
 *
 * Web 端使用 SVG <path> 渲染形状。
 * RN 端使用 react-native-svg 实现相同效果。
 */
export function RNShapeElement({ element }: RNShapeElementProps) {
  const { path, viewBox, width, height, fill, outline, gradient, opacity } = element;

  // 计算缩放比例
  const sx = viewBox ? width / (viewBox[0] || width || 1) : 1;
  const sy = viewBox ? height / (viewBox[1] || height || 1) : 1;

  // 描边样式
  const strokeWidth = outline?.width ?? 0;
  const strokeColor = outline?.color ?? 'transparent';
  const strokeDasharray =
    outline?.style === 'dashed' ? '8,4' : outline?.style === 'dotted' ? '2,2' : undefined;

  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {gradient && (
          <Defs>
            <LinearGradient id={`grad-${element.id}`} x1="0" y1="0" x2="1" y2="0">
              {gradient.colors.map((c, i) => (
                <Stop key={i} offset={`${c.pos * 100}%`} stopColor={c.color} />
              ))}
            </LinearGradient>
          </Defs>
        )}
        <Path
          d={path}
          fill={gradient ? `url(#grad-${element.id})` : fill || 'transparent'}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          transform={`scale(${sx}, ${sy})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
