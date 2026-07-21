import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

interface UseSlideScalingOptions {
  viewportSize?: number;
  viewportRatio?: number;
  containerPadding?: number;
}

interface UseSlideScalingResult {
  /** 设计稿宽度 (viewportSize) */
  viewportWidth: number;
  /** 设计稿高度 (viewportSize * viewportRatio) */
  viewportHeight: number;
  /** 缩放比例 */
  scale: number;
  /** 容器内水平偏移 */
  offsetX: number;
  /** 容器内垂直偏移 */
  offsetY: number;
  /** 容器可用宽度 */
  containerWidth: number;
  /** 容器可用高度 */
  containerHeight: number;
}

/**
 * 计算幻灯片在容器中的缩放和定位。
 * 移植自 @openmaic/renderer 的 useViewportSize hook。
 */
export function useSlideScaling(options: UseSlideScalingOptions = {}): UseSlideScalingResult {
  const { viewportSize = 1000, viewportRatio = 0.5625, containerPadding = 16 } = options;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return useMemo(() => {
    const containerWidth = screenWidth - containerPadding * 2;
    const containerHeight = screenHeight - containerPadding * 2;
    const viewportWidth = viewportSize;
    const viewportHeight = viewportSize * viewportRatio;

    let scale: number;
    let offsetX: number;
    let offsetY: number;

    if (containerHeight / containerWidth > viewportRatio) {
      // 容器比幻灯片更"高"，以宽度为基准
      scale = containerWidth / viewportWidth;
      offsetX = 0;
      offsetY = (containerHeight - viewportHeight * scale) / 2;
    } else {
      // 容器比幻灯片更"宽"，以高度为基准
      scale = containerHeight / viewportHeight;
      offsetX = (containerWidth - viewportWidth * scale) / 2;
      offsetY = 0;
    }

    return {
      viewportWidth,
      viewportHeight,
      scale,
      offsetX,
      offsetY,
      containerWidth,
      containerHeight,
    };
  }, [screenWidth, screenHeight, viewportSize, viewportRatio, containerPadding]);
}
