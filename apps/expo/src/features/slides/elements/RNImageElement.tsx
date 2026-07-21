import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { PPTImageElement } from '@openmaic/dsl';

interface RNImageElementProps {
  element: PPTImageElement;
}

/**
 * 图片元素渲染器。
 * 移植自 Web 端 BaseImageElement。
 *
 * Web 端支持 clip-path、filter、flip、softEdge 等 CSS 特性。
 * RN 端简化为基础图片渲染，支持 flip 和基本裁剪。
 */
export function RNImageElement({ element }: RNImageElementProps) {
  const { src, flipH, flipV } = element;

  if (!src) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          {
            transform: [{ scaleX: flipH ? -1 : 1 }, { scaleY: flipV ? -1 : 1 }],
          },
        ]}
      >
        <Image source={{ uri: src }} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
