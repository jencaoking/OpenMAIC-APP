import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { PPTImageElement } from '@openmaic/dsl';
import { getImagePosition } from './imageClipUtils';

interface RNImageElementProps {
  element: PPTImageElement;
}

/**
 * Image element renderer with clip-path support.
 *
 * Port of Web's BaseImageElement — supports:
 * - Rect/RoundRect clipping via borderRadius + overflow hidden
 * - Ellipse clipping via circular borderRadius
 * - Polygon clipping via WebView with CSS clip-path
 * - Image cropping via clip.range
 * - Horizontal/vertical flip
 * - Color mask overlay
 */

/** Shapes that can be approximated with borderRadius */
const SIMPLE_SHAPES = new Set(['rect', 'roundRect', 'ellipse']);

/** Shapes that need SVG clip-path (rendered via WebView) */
const POLYGON_SHAPES: Record<string, string> = {
  rect2: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%)',
  rect3: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 20% 100%, 0% 80%)',
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  triangle2: 'polygon(50% 100%, 0% 0%, 100% 0%)',
  triangle3: 'polygon(0% 0%, 0% 100%, 100% 100%)',
  rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  hexagon: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
  heptagon: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
  octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  chevron: 'polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)',
  point: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
  arrow: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
  parallelogram: 'polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%)',
  parallelogram2: 'polygon(30% 100%, 100% 100%, 70% 0%, 0% 0%)',
  trapezoid: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
  trapezoid2: 'polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)',
};

export function RNImageElement({ element }: RNImageElementProps) {
  const {
    src,
    width: elWidth = 200,
    height: elHeight = 200,
    flipH,
    flipV,
    clip,
    radius,
    colorMask,
  } = element;

  // Compute image position within crop range
  const imgPos = useMemo(
    () => getImagePosition(clip?.range),
    [clip?.range],
  );

  if (!src) return null;

  const shapeName = clip?.shape;
  const isSimple = !shapeName || SIMPLE_SHAPES.has(shapeName);
  const isPolygon = shapeName && shapeName in POLYGON_SHAPES;

  const flipStyle = {
    transform: [{ scaleX: flipH ? -1 : 1 }, { scaleY: flipV ? -1 : 1 }],
  };

  const imageInner = (
    <View style={[styles.imageWrapper, flipStyle]}>
      <View
        style={{
          position: 'absolute',
          top: `${imgPos.top}%`,
          left: `${imgPos.left}%`,
          width: `${imgPos.widthPercent}%`,
          height: `${imgPos.heightPercent}%`,
        }}
      >
        <Image source={{ uri: src }} style={styles.image} resizeMode="cover" />
      </View>
    </View>
  );

  const colorMaskLayer = colorMask ? (
    <View style={[styles.colorMask, { backgroundColor: colorMask }]} />
  ) : null;

  // Simple shapes: use native RN borderRadius
  if (isSimple) {
    let borderRadius = 0;
    if (shapeName === 'roundRect') {
      borderRadius = radius !== undefined ? radius : 10;
    } else if (shapeName === 'ellipse') {
      borderRadius = Math.min(elWidth, elHeight) / 2;
    } else if (radius !== undefined && radius > 0) {
      borderRadius = radius;
    }

    return (
      <View
        style={[
          styles.container,
          borderRadius > 0 ? { borderRadius, overflow: 'hidden' } : undefined,
        ]}
      >
        {imageInner}
        {colorMaskLayer}
      </View>
    );
  }

  // Polygon shapes: use WebView with CSS clip-path for 1:1 fidelity
  if (isPolygon && shapeName) {
    const cssClip = POLYGON_SHAPES[shapeName];
    const flipCss = `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;

    const html = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:transparent}
.clip{width:100%;height:100%;position:relative;clip-path:${cssClip};overflow:hidden}
.img{position:absolute;top:${imgPos.top}%;left:${imgPos.left}%;width:${imgPos.widthPercent}%;height:${imgPos.heightPercent}%;transform:${flipCss};object-fit:cover}
${colorMask ? `.mask{position:absolute;inset:0;background:${colorMask}}` : ''}
</style></head>
<body>
<div class="clip">
  <img class="img" src="${src}" draggable="false"/>
  ${colorMask ? '<div class="mask"></div>' : ''}
</div>
</body></html>`;

    return (
      <View style={styles.container}>
        <WebView
          source={{ html, baseUrl: '' }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled
          originWhitelist={['*']}
        />
      </View>
    );
  }

  // Fallback
  return (
    <View style={styles.container}>
      {imageInner}
      {colorMaskLayer}
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
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  colorMask: {
    ...StyleSheet.absoluteFillObject,
  },
});
