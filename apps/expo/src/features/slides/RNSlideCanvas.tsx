import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Slide, PPTElement } from '@openmaic/dsl';
import { useSlideScaling } from './hooks/useSlideScaling';
import { RNSlideElement } from './RNSlideElement';

interface RNSlideCanvasProps {
  slide: Slide;
  /** 固定缩放比例（不使用自动适配） */
  scale?: number;
}

export function RNSlideCanvas({ slide, scale: fixedScale }: RNSlideCanvasProps) {
  const {
    viewportWidth,
    viewportHeight,
    scale: fitScale,
    offsetX,
    offsetY,
    containerWidth,
    containerHeight,
  } = useSlideScaling({
    viewportSize: slide.viewportSize,
    viewportRatio: slide.viewportRatio,
  });

  const canvasScale = fixedScale ?? fitScale;
  const elements = slide.elements ?? [];

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      {/* 幻灯片画布 */}
      <View
        style={[
          styles.slide,
          {
            width: viewportWidth * canvasScale,
            height: viewportHeight * canvasScale,
            left: offsetX,
            top: offsetY,
          },
        ]}
      >
        {/* 背景 */}
        <View
          style={[
            styles.background,
            {
              backgroundColor: slide.background?.color || '#ffffff',
            },
          ]}
        />

        {/* 元素容器（按设计稿坐标定位，通过 scale 缩放） */}
        <View
          style={[
            styles.elementsContainer,
            {
              width: viewportWidth,
              height: viewportHeight,
              transform: [{ scale: canvasScale }],
            },
          ]}
        >
          {elements.map((element, index) => (
            <RNSlideElement
              key={element.id}
              element={element}
              index={index}
              theme={slide.theme}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  elementsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  },
});
