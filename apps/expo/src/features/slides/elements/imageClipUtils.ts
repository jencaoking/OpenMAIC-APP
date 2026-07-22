/**
 * Image clip path utilities for React Native.
 *
 * Maps Web's CSS clip-path values to SVG mask/clipPath data for react-native-svg.
 * Supports rect, roundRect, ellipse, and all polygon shapes.
 */

export type ClipShapeType = 'rect' | 'roundRect' | 'ellipse' | 'polygon';

export interface ClipShape {
  type: ClipShapeType;
  svgPath: string;
  borderRadius?: number;
}

/**
 * All clip shapes from configs/image-clip.ts, converted to SVG paths.
 * Each path is relative to a 100x100 viewBox (percentage-based).
 * For full-width/height rendering, multiply by actual dimensions.
 */
const CLIP_PATHS: Record<string, string> = {
  rect2: 'M 0 0 L 80 0 L 100 20 L 100 100 L 0 100 Z',
  rect3: 'M 0 0 L 80 0 L 100 20 L 100 100 L 20 100 L 0 80 Z',
  triangle: 'M 50 0 L 0 100 L 100 100 Z',
  triangle2: 'M 50 100 L 0 0 L 100 0 Z',
  triangle3: 'M 0 0 L 0 100 L 100 100 Z',
  rhombus: 'M 50 0 L 100 50 L 50 100 L 0 50 Z',
  pentagon: 'M 50 0 L 100 38 L 82 100 L 18 100 L 0 38 Z',
  hexagon: 'M 20 0 L 80 0 L 100 50 L 80 100 L 20 100 L 0 50 Z',
  heptagon: 'M 50 0 L 90 20 L 100 60 L 75 100 L 25 100 L 0 60 L 10 20 Z',
  octagon: 'M 30 0 L 70 0 L 100 30 L 100 70 L 70 100 L 30 100 L 0 70 L 0 30 Z',
  chevron: 'M 75 0 L 100 50 L 75 100 L 0 100 L 25 50 L 0 0 Z',
  point: 'M 0 0 L 75 0 L 100 50 L 75 100 L 0 100 Z',
  arrow: 'M 0 20 L 60 20 L 60 0 L 100 50 L 60 100 L 60 80 L 0 80 Z',
  parallelogram: 'M 30 0 L 100 0 L 70 100 L 0 100 Z',
  parallelogram2: 'M 30 100 L 100 100 L 70 0 L 0 0 Z',
  trapezoid: 'M 25 0 L 75 0 L 100 100 L 0 100 Z',
  trapezoid2: 'M 0 0 L 100 0 L 75 100 L 25 100 Z',
};

/**
 * Scale a percentage-based SVG path to actual pixel dimensions.
 */
function scaleSvgPath(path: string, width: number, height: number): string {
  return path.replace(/(\d+\.?\d*)/g, (match, num) => {
    const n = parseFloat(num);
    // X coordinates (even positions in path)
    return String(n);
  });
}

/**
 * Get the clip shape for a given clip shape name and dimensions.
 */
export function getClipShape(
  shapeName: string | undefined,
  width: number,
  height: number,
  radius?: number,
): ClipShape {
  // No clip or rect clip
  if (!shapeName || shapeName === 'rect') {
    if (radius !== undefined && radius > 0) {
      return { type: 'roundRect', svgPath: '', borderRadius: radius };
    }
    return { type: 'rect', svgPath: '' };
  }

  // Round rect
  if (shapeName === 'roundRect') {
    const r = radius !== undefined ? radius : 10;
    return { type: 'roundRect', svgPath: '', borderRadius: r };
  }

  // Ellipse (circle)
  if (shapeName === 'ellipse') {
    // Use SVG path for ellipse
    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2;
    const ry = height / 2;
    const path = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} Z`;
    return { type: 'ellipse', svgPath: path };
  }

  // Polygon shapes
  const svgPercent = CLIP_PATHS[shapeName];
  if (svgPercent) {
    // Scale from 100x100 viewBox to actual dimensions
    const path = svgPercent
      .split(' ')
      .map((part) => {
        if (part === 'M' || part === 'L' || part === 'Z') return part;
        const [x, y] = part.split(',').map(Number);
        return `${(x / 100) * width},${(y / 100) * height}`;
      })
      .join(' ');
    return { type: 'polygon', svgPath: path };
  }

  return { type: 'rect', svgPath: '' };
}

/**
 * Calculate image position within a crop range.
 * Port of Web's useClipImage.ts imgPosition logic.
 */
export function getImagePosition(clipRange?: [[number, number], [number, number]]): {
  top: number;
  left: number;
  widthPercent: number;
  heightPercent: number;
} {
  if (!clipRange) {
    return { top: 0, left: 0, widthPercent: 100, heightPercent: 100 };
  }

  const [start, end] = clipRange;
  const widthScale = (end[0] - start[0]) / 100;
  const heightScale = (end[1] - start[1]) / 100;
  const left = start[0] / widthScale;
  const top = start[1] / heightScale;

  return {
    left: -left,
    top: -top,
    widthPercent: 100 / widthScale,
    heightPercent: 100 / heightScale,
  };
}
