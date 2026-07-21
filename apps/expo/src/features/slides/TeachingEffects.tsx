import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Rect, Defs, Mask, Circle, Line } from 'react-native-svg';
import type { PPTElement } from '@openmaic/dsl';

/**
 * Teaching effects overlay for Mobile.
 *
 * Implements Spotlight (聚光灯), Highlight (高亮), and Laser (激光笔) effects.
 * Port of Web's SpotlightOverlay.tsx, HighlightOverlay.tsx, and LaserOverlay.tsx.
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

export interface LaserOptions {
  color?: string;
  duration?: number;
}

export interface ZoomTarget {
  elementId: string;
  scale: number;
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

  /** Laser state */
  laserElementId?: string;
  laserOptions?: LaserOptions | null;

  /** Zoom state */
  zoomTarget?: ZoomTarget | null;
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
 * Laser pointer overlay — flies in from nearest corner to element center.
 * Features a red dot with ring pulse animation.
 * Port of Web's LaserOverlay.tsx.
 */
function LaserOverlay({
  canvasWidth,
  canvasHeight,
  laserElementId,
  laserOptions,
  elementPositions,
}: Pick<TeachingEffectsProps, 'canvasWidth' | 'canvasHeight' | 'laserElementId' | 'laserOptions' | 'elementPositions'>) {
  const color = laserOptions?.color ?? '#ff3b30';
  const duration = laserOptions?.duration ?? 3000;
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  const center = useMemo(() => {
    if (!laserElementId) return null;
    const pos = elementPositions[laserElementId];
    if (!pos) return null;
    return {
      x: ((pos.left + pos.width / 2) / canvasWidth) * 100,
      y: ((pos.top + pos.height / 2) / canvasHeight) * 100,
    };
  }, [laserElementId, elementPositions, canvasWidth, canvasHeight]);

  // Fly-in animation from nearest corner
  useEffect(() => {
    if (!center) {
      animOpacity.setValue(0);
      return;
    }

    const startX = center.x > 50 ? 105 : -5;
    const startY = center.y > 50 ? 105 : -5;

    animX.setValue(startX);
    animY.setValue(startY);
    animOpacity.setValue(0);

    // Fly in
    Animated.parallel([
      Animated.timing(animX, {
        toValue: center.x,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animY, {
        toValue: center.y,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();

    // Ring pulse animation (loops)
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 2.8,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: false,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );
    pulseAnim.start();

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, duration);

    return () => {
      pulseAnim.stop();
      clearTimeout(hideTimer);
    };
  }, [center, duration, animX, animY, animOpacity, ringScale, ringOpacity]);

  if (!center) return null;

  return (
    <Animated.View
      style={[
        styles.laserContainer,
        {
          left: animX.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
          top: animY.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
          opacity: animOpacity,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.laserDotWrapper}>
        {/* Ring pulse */}
        <Animated.View
          style={[
            styles.laserRing,
            {
              borderColor: color,
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
        {/* Light core */}
        <View
          style={[
            styles.laserCore,
            {
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

/**
 * Zoom wrapper — scales the canvas around an element center.
 * Port of Web's ZoomWrapper.tsx.
 */
function ZoomWrapper({
  children,
  zoomTarget,
  elementPositions,
  canvasWidth,
  canvasHeight,
}: {
  children: React.ReactNode;
  zoomTarget?: ZoomTarget | null;
  elementPositions: Record<string, { left: number; top: number; width: number; height: number }>;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const center = useMemo(() => {
    if (!zoomTarget) return null;
    const pos = elementPositions[zoomTarget.elementId];
    if (!pos) return null;
    return {
      x: ((pos.left + pos.width / 2) / canvasWidth) * 100,
      y: ((pos.top + pos.height / 2) / canvasHeight) * 100,
    };
  }, [zoomTarget, elementPositions, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!zoomTarget) {
      // Animate back to scale 1
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        stiffness: 200,
        damping: 25,
      }).start();
      return;
    }

    // Animate to target scale
    Animated.spring(scaleAnim, {
      toValue: zoomTarget.scale,
      useNativeDriver: false,
      stiffness: 200,
      damping: 25,
    }).start();
  }, [zoomTarget, scaleAnim]);

  if (!zoomTarget || !center) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      style={[
        styles.zoomWrapper,
        {
          transformOrigin: `${center.x}% ${center.y}%`,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Main teaching effects component.
 * Renders Spotlight, Highlight, Laser, and Zoom effects.
 */
export function TeachingEffects({
  canvasWidth,
  canvasHeight,
  spotlightElementId,
  spotlightOptions,
  elementPositions,
  highlightedElementIds,
  highlightOptions,
  laserElementId,
  laserOptions,
  zoomTarget,
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

      {/* Laser pointer effect (flies in from corner) */}
      <LaserOverlay
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        laserElementId={laserElementId}
        laserOptions={laserOptions}
        elementPositions={elementPositions}
      />
    </View>
  );
}

/**
 * Standalone ZoomWrapper for wrapping canvas content.
 * Use this to wrap the slide content for zoom effect.
 */
export { ZoomWrapper };

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
  laserContainer: {
    position: 'absolute',
    zIndex: 101,
  },
  laserDotWrapper: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
    marginTop: -5,
  },
  laserRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  laserCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  zoomWrapper: {
    width: '100%',
    height: '100%',
  },
});
