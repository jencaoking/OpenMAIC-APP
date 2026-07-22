import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import type { PPTElement } from '@openmaic/dsl';
import { RNSlideElement } from '../RNSlideElement';

interface WhiteboardCanvasProps {
  elements: PPTElement[];
  isClearing: boolean;
  onViewModifiedChange?: (modified: boolean) => void;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 562.5;

/**
 * WhiteboardCanvas - Pan/zoom canvas for whiteboard elements.
 *
 * Port of Web's WhiteboardCanvas component.
 * Uses PanResponder for drag-to-pan and Animated for zoom.
 */
export function WhiteboardCanvas({
  elements,
  isClearing,
  onViewModifiedChange,
}: WhiteboardCanvasProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const [currentScale, setCurrentScale] = useState(1);
  const [currentPanX, setCurrentPanX] = useState(0);
  const [currentPanY, setCurrentPanY] = useState(0);
  const lastScale = useRef(1);
  const lastPanX = useRef(0);
  const lastPanY = useRef(0);

  const isViewModified = currentScale !== 1 || currentPanX !== 0 || currentPanY !== 0;

  // Notify parent when view modified
  React.useEffect(() => {
    onViewModifiedChange?.(isViewModified);
  }, [isViewModified, onViewModifiedChange]);

  // Pan responder for drag-to-pan
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          panX.setOffset(lastPanX.current);
          panY.setOffset(lastPanY.current);
        },
        onPanResponderMove: (_, gestureState) => {
          panX.setValue(gestureState.dx / currentScale);
          panY.setValue(gestureState.dy / currentScale);
        },
        onPanResponderRelease: (_, gestureState) => {
          panX.flattenOffset();
          panY.flattenOffset();
          const newX = lastPanX.current + gestureState.dx / currentScale;
          const newY = lastPanY.current + gestureState.dy / currentScale;
          lastPanX.current = newX;
          lastPanY.current = newY;
          setCurrentPanX(newX);
          setCurrentPanY(newY);
        },
      }),
    [currentScale, panX, panY],
  );

  // Reset view function
  const resetView = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }),
      Animated.spring(panX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(panY, { toValue: 0, useNativeDriver: false }),
    ]).start();
    setCurrentScale(1);
    setCurrentPanX(0);
    setCurrentPanY(0);
    lastScale.current = 1;
    lastPanX.current = 0;
    lastPanY.current = 0;
  }, [scaleAnim, panX, panY]);

  // Calculate scale to fit canvas in container
  const containerWidth = Dimensions.get('window').width - 32;
  const containerHeight = Dimensions.get('window').height - 200;
  const fitScale = Math.min(containerWidth / CANVAS_WIDTH, containerHeight / CANVAS_HEIGHT);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.canvas,
          {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: [
              { translateX: panX },
              { translateY: panY },
              { scale: Animated.multiply(scaleAnim, fitScale) },
            ],
          },
        ]}
      >
        {/* Elements */}
        {elements.map((element, index) => (
          <RNSlideElement key={element.id} element={element} index={index} />
        ))}

        {/* Empty state */}
        {elements.length === 0 && !isClearing && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Whiteboard Ready</Text>
            <Text style={styles.emptyHint}>Draw or add elements</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9ca3af',
  },
  emptyHint: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
});
