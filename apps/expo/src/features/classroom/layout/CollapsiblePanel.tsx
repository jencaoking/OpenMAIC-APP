import React, { useCallback, useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';

interface CollapsiblePanelProps {
  width: number;
  collapsed: boolean;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange: (width: number) => void;
  onCollapseChange: (collapsed: boolean) => void;
  side: 'left' | 'right';
  children: React.ReactNode;
}

const HANDLE_WIDTH = 6;

export function CollapsiblePanel({
  width,
  collapsed,
  minWidth = 160,
  maxWidth = 400,
  onWidthChange,
  onCollapseChange,
  side,
  children,
}: CollapsiblePanelProps) {
  const panX = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        startX.current = width;
        panX.setOffset(width);
        panX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx;
        let newWidth: number;
        if (side === 'right') {
          newWidth = startX.current - dx;
        } else {
          newWidth = startX.current + dx;
        }
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        panX.setValue(newWidth);
      },
      onPanResponderRelease: (_, gestureState) => {
        panX.flattenOffset();
        const dx = gestureState.dx;
        let newWidth: number;
        if (side === 'right') {
          newWidth = startX.current - dx;
        } else {
          newWidth = startX.current + dx;
        }
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

        // If dragged very close to edge, collapse
        if (newWidth < minWidth + 20) {
          onCollapseChange(true);
          onWidthChange(minWidth);
        } else {
          onCollapseChange(false);
          onWidthChange(newWidth);
        }
        panX.setValue(newWidth);
      },
    }),
  ).current;

  const panelWidth = collapsed ? 0 : width;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          width: panelWidth,
          overflow: 'hidden',
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
      {!collapsed && (
        <View
          style={[styles.handle, side === 'right' ? styles.handleLeft : styles.handleRight]}
          {...panResponder.panHandlers}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: '100%',
    position: 'relative',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    zIndex: 10,
  },
  handleLeft: {
    left: 0,
  },
  handleRight: {
    right: 0,
  },
});
