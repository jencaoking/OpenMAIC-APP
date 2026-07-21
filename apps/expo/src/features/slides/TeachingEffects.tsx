import React, { useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Rect, Defs, Mask, Circle, Line } from 'react-native-svg';
import type { PPTElement } from '@openmaic/dsl';

/**
 * Teaching effects overlay for Mobile.
 *
 * Implements Spotlight (聚光灯) and Highlight (高亮) effects.
 * Port of Web's SpotlightOverlay.tsx and HighlightOverlay.tsx.
 */

export interface SpotlightOptions {
  radius?: number;
  dimness?: number;
  transition?: number;
}

export interface HighlightOverlayOptions {
  color?: string;
  opacity?: number;
  borderWidth?: number;
  animated?: boolean;
}

interface TeachingEffectsProps {
  /** Canvas dimensions for percentage-based coordinate conversion */
  canvasWidth: number;
  canvasHeight: number;

  /** Spotlight state */
  spotlightElementId?: string;
  spotlightOptions?: SpotlightOptions | null;
  /** Element positions map: elementId → { left, top, width, height } */
  elementPositions: Record<string, { left: number; top: number; width: number; height: number }>;

  /** Highlight state */
  highlightedElementIds?: string[];
  highlightOptions?: HighlightOverlayOptions | null;
}

/**
 * Spotlight overlay — dims the background and creates a cutout around the target element.
 * Uses SVG mask for the dimming effect.
 */
function SpotlightOverlay({
  canvasWidth,
  canvasHeight,
  spotlightElementId,
  spotlightOptions,
  elementPositions,
}: Pick<TeachingEffectsProps, 'canvasWidth' | 'canvasHeight' | 'spotlightElementId' | 'spotlightOptions' | 'elementPositions'>) {
  const active = !!spotlightElementId && !!spotlightOptions;
  const dimness = spotlightOptions?.dimness ?? 0.7;

  // Convert pixel coordinates to SVG viewBox 0-100 coordinates
  const rect = useMemo(() => {
    if (!spotlightElementId) return null;
    const pos = elementPositions[spotlightElementId];
    if (!pos) return null;

    return {
      x: (pos.left / canvasWidth) * 100,
      y: (pos.top / canvasHeight) * 100,
      w: (pos.width / canvasWidth) * 100,
      h: (pos.height / canvasHeight) * 100,
    };
  }, [spotlightElementId, elementPositions, canvasWidth, canvasHeight]);

  if (!active || !rect) return null;

  const maskId = `spotlight-mask-${spotlightElementId}`;

  return (
    <View style={styles.overlay}>
      <Svg
        width={canvasWidth}
        height={canvasHeight}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.svg}
      >
        <Defs>
          <Mask id={maskId}>
            {/* White background = show mask layer (dimmed) */}
            <Rect x="0" y="0" width="100" height="100" fill="white" />
            {/* Black rectangle = hide mask layer (highlighted area / cutout) */}
            <Rect
              x={rect.x - 0.4}
              y={rect.y - 0.6}
              width={rect.w + 0.8}
              height={rect.h + 1.2}
              rx="1"
              fill="black"
            />
          </Mask>
        </Defs>

        {/* Dimmed Background */}
        <Rect
          width="100"
          height="100"
          fill={`rgba(0,0,0,${dimness})`}
          mask={`url(#${maskId})`}
        />

        {/* White border around spotlight area */}
        <Rect
          x={rect.x - 0.4}
          y={rect.y - 0.6}
          width={rect.w + 0.8}
          height={rect.h + 1.2}
          rx="1"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="0.3"
        />
      </Svg>
    </View>
  );
}

/**
 * Highlight overlay — adds glowing border around highlighted elements.
 * Supports multiple elements and animated pulse effect.
 */
function HighlightOverlay({
  highlightedElementIds,
  highlightOptions,
  elementPositions,
}: Pick<TeachingEffectsProps, 'highlightedElementIds' | 'highlightOptions' | 'elementPositions'>) {
  const {
    color = '#ff6b6b',
    opacity = 0.3,
    borderWidth = 3,
    animated = true,
  } = highlightOptions || {};

  const elements = useMemo(() => {
    if (!highlightedElementIds?.length) return [];
    return highlightedElementIds
      .map((id) => {
        const pos = elementPositions[id];
        if (!pos) return null;
        return { id, ...pos };
      })
      .filter(Boolean);
  }, [highlightedElementIds, elementPositions]);

  if (!elements.length) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {elements.map((el) => {
        if (!el) return null;
        return (
          <View
            key={el.id}
            style={[
              styles.highlightElement,
              {
                left: el.left,
                top: el.top,
                width: el.width,
                height: el.height,
              },
            ]}
          >
            {/* Highlight border with glow */}
            <View
              style={[
                styles.highlightBorder,
                {
                  borderWidth,
                  borderColor: color,
                  backgroundColor: `${color}${Math.round(opacity * 255)
                    .toString(16)
                    .padStart(2, '0')}`,
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: borderWidth * 3,
                  elevation: 5,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

/**
 * Main teaching effects component.
 * Renders Spotlight and Highlight overlays.
 */
export function TeachingEffects({
  canvasWidth,
  canvasHeight,
  spotlightElementId,
  spotlightOptions,
  elementPositions,
  highlightedElementIds,
  highlightOptions,
}: TeachingEffectsProps) {
  return (
    <View style={[styles.container, { width: canvasWidth, height: canvasHeight }]} pointerEvents="none">
      {/* Spotlight effect (dims background, highlights target) */}
      <SpotlightOverlay
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        spotlightElementId={spotlightElementId}
        spotlightOptions={spotlightOptions}
        elementPositions={elementPositions}
      />

      {/* Highlight effect (glowing borders on elements) */}
      <HighlightOverlay
        highlightedElementIds={highlightedElementIds}
        highlightOptions={highlightOptions}
        elementPositions={elementPositions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  highlightElement: {
    position: 'absolute',
  },
  highlightBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
});
