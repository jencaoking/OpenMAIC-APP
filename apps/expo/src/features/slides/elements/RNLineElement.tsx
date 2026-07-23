import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, Marker, Circle } from 'react-native-svg';
import type { PPTLineElement, LinePoint } from '@openmaic/dsl';

interface RNLineElementProps {
  element: PPTLineElement;
}

/**
 * Line element renderer with endpoint markers.
 *
 * Port of Web's BaseLineElement + LinePointMarker.
 * Supports dot and arrow markers at line endpoints.
 */
export function RNLineElement({ element }: RNLineElementProps) {
  const { start, end, color, style, width: lineWidth = 2, points } = element;

  const strokeColor = color || '#333333';
  const strokeDasharray = style === 'dashed' ? '8,4' : style === 'dotted' ? '2,2' : undefined;

  // Calculate SVG viewBox
  const svgWidth = useMemo(() => {
    const w = Math.abs(start[0] - end[0]);
    return w < 24 ? 24 : w;
  }, [start, end]);

  const svgHeight = useMemo(() => {
    const h = Math.abs(start[1] - end[1]);
    return h < 24 ? 24 : h;
  }, [start, end]);

  // Calculate path coordinates relative to viewBox
  const x1 = start[0];
  const y1 = start[1];
  const x2 = end[0];
  const y2 = end[1];

  // Marker size based on line width
  const markerSize = Math.max(lineWidth * 1.5, 3);

  // Check if we have endpoints
  const hasStartMarker = (points && points[0] === 'arrow') || points[0] === 'dot';
  const hasEndMarker = (points && points[1] === 'arrow') || points[1] === 'dot';

  // Build path for the line
  const pathD = `M ${x1} ${y1} L ${x2} ${y2}`;

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <Defs>
          {/* Start marker */}
          {hasStartMarker && (
            <Marker
              id={`marker-start-${element.id}`}
              markerUnits="userSpaceOnUse"
              orient="auto"
              markerWidth={markerSize * 3}
              markerHeight={markerSize * 3}
              refX={markerSize * 1.5}
              refY={markerSize * 1.5}
            >
              {points![0] === 'dot' ? (
                <Circle
                  cx={markerSize * 1.5}
                  cy={markerSize * 1.5}
                  r={markerSize * 0.8}
                  fill={strokeColor}
                />
              ) : (
                <Path
                  d="M0,0 L10,5 0,10 Z"
                  fill={strokeColor}
                  transform={`scale(${markerSize * 0.3}, ${markerSize * 0.3}) rotate(180, 5, 5)`}
                />
              )}
            </Marker>
          )}

          {/* End marker */}
          {hasEndMarker && (
            <Marker
              id={`marker-end-${element.id}`}
              markerUnits="userSpaceOnUse"
              orient="auto"
              markerWidth={markerSize * 3}
              markerHeight={markerSize * 3}
              refX={markerSize * 1.5}
              refY={markerSize * 1.5}
            >
              {points![1] === 'dot' ? (
                <Circle
                  cx={markerSize * 1.5}
                  cy={markerSize * 1.5}
                  r={markerSize * 0.8}
                  fill={strokeColor}
                />
              ) : (
                <Path
                  d="M0,0 L10,5 0,10 Z"
                  fill={strokeColor}
                  transform={`scale(${markerSize * 0.3}, ${markerSize * 0.3}) rotate(0, 5, 5)`}
                />
              )}
            </Marker>
          )}
        </Defs>

        {/* The line path with markers */}
        <Path
          d={pathD}
          stroke={strokeColor}
          strokeWidth={lineWidth}
          strokeDasharray={strokeDasharray}
          fill="none"
          markerStart={hasStartMarker ? `url(#marker-start-${element.id})` : undefined}
          markerEnd={hasEndMarker ? `url(#marker-end-${element.id})` : undefined}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
