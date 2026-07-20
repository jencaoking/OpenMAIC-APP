import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Slide } from '@openmaic/dsl';
import { RNSlideCanvas } from '../../slides/RNSlideCanvas';

interface SceneThumbnailProps {
  slide: Slide;
  width?: number;
}

/**
 * 场景缩略图。
 * 渲染一个微型幻灯片预览。
 */
export function SceneThumbnail({ slide, width = 120 }: SceneThumbnailProps) {
  const height = width * (slide.viewportRatio || 0.5625);

  return (
    <View style={[styles.container, { width, height }]}>
      <RNSlideCanvas slide={slide} scale={width / (slide.viewportSize || 1000)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
});
