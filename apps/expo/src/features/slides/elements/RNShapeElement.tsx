import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Pattern,
  Image as SvgImage,
} from 'react-native-svg';
import type { PPTShapeElement } from '@openmaic/dsl';

interface RNShapeElementProps {
  element: PPTShapeElement;
}

/**
 * Shape element renderer with full gradient and pattern support.
 *
 * Port of Web's BaseShapeElement — supports:
 * - Linear gradient with rotation
 * - Radial gradient
 * - Pattern fill (image texture)
 * - Fill priority: pattern > gradient > solid color
 * - SVG path rendering with viewBox scaling
 * - Outline (stroke width, color, dash array)
 * - Flip (horizontal/vertical)
 * - Opacity
 */
export function RNShapeElement({ element }: RNShapeElementProps) {
  const {
    id,
    path,
    viewBox,
    width,
    height,
    fill,
    outline,
    gradient,
    pattern,
    opacity,
    flipH,
    flipV,
    shadow,
  } = element;

  // Compute viewBox scaling
  const sx = viewBox ? width / (viewBox[0] || width || 1) : 1;
  const sy = viewBox ? height / (viewBox[1] || height || 1) : 1;

  // Compute fill: pattern > gradient > solid color
  const fillColor = useMemo(() => {
    if (pattern) return `url(#pattern-${id})`;
    if (gradient) return `url(#gradient-${id})`;
    return fill || 'transparent';
  }, [pattern, gradient, fill, id]);

  // Stroke styles
  const strokeWidth = outline?.width ?? 0;
  const strokeColor = outline?.color ?? 'transparent';
  const strokeDasharray = useMemo(() => {
    if (outline?.style === 'dashed') return '8,4';
    if (outline?.style === 'dotted') return '2,2';
    return undefined;
  }, [outline?.style]);

  // Flip transform
  const flipTransform = useMemo(() => {
    const parts: string[] = [];
    if (flipH) parts.push('scale(-1,1)');
    if (flipV) parts.push('scale(1,-1)');
    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [flipH, flipV]);

  // Shadow style
  const shadowStyle = useMemo(() => {
    if (!shadow) return undefined;
    const { h = 0, v = 0, blur = 0, color = 'rgba(0,0,0,0.3)' } = shadow;
    return `${h}px ${v}px ${blur}px ${color}`;
  }, [shadow]);

  // Gradient rotation for linear gradient
  const gradientTransform = useMemo(() => {
    if (!gradient || gradient.type !== 'linear') return undefined;
    const angle = gradient.rotate || 0;
    return `rotate(${angle}, 0.5, 0.5)`;
  }, [gradient]);

  // Build transform string
  const transformStr = useMemo(() => {
    const parts: string[] = [`scale(${sx}, ${sy})`];
    if (flipTransform) parts.push(flipTransform);
    return parts.join(' ');
  }, [sx, sy, flipTransform]);

  return (
    <View
      style={[
        styles.container,
        opacity !== undefined ? { opacity } : undefined,
        shadowStyle
          ? {
              shadowColor: shadow?.color || '#000',
              shadowOffset: { width: shadow?.h || 0, height: shadow?.v || 0 },
              shadowOpacity: 0.3,
              shadowRadius: shadow?.blur || 0,
              elevation: 3,
            }
          : undefined,
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Linear gradient */}
          {gradient && gradient.type === 'linear' && (
            <LinearGradient
              id={`gradient-${id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              gradientTransform={gradientTransform}
            >
              {gradient.colors.map((c, i) => (
                <Stop key={i} offset={`${c.pos}%`} stopColor={c.color} />
              ))}
            </LinearGradient>
          )}

          {/* Radial gradient */}
          {gradient && gradient.type === 'radial' && (
            <RadialGradient id={`gradient-${id}`}>
              {gradient.colors.map((c, i) => (
                <Stop key={i} offset={`${c.pos}%`} stopColor={c.color} />
              ))}
            </RadialGradient>
          )}

          {/* Pattern fill */}
          {pattern && (
            <Pattern
              id={`pattern-${id}`}
              patternContentUnits="objectBoundingBox"
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <SvgImage href={pattern} width="1" height="1" preserveAspectRatio="xMidYMid slice" />
            </Pattern>
          )}
        </Defs>

        <Path
          d={path}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="butt"
          strokeMiterlimit={8}
          vectorEffect="non-scaling-stroke"
          transform={transformStr}
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
