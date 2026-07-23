/**
 * Image outline utilities for React Native.
 *
 * Port of Web's useElementOutline hook.
 */

export interface OutlineStyles {
  outlineWidth: number;
  outlineColor: string;
  strokeDasharray: string;
}

/**
 * Calculate outline styles from element outline config.
 */
export function getElementOutline(outline?: {
  width?: number;
  style?: string;
  color?: string;
}): OutlineStyles {
  if (!outline) {
    return { outlineWidth: 0, outlineColor: 'transparent', strokeDasharray: '0 0' };
  }

  const outlineWidth = outline.width ?? 0;
  const outlineStyle = outline.style || 'solid';
  const outlineColor = outline.color || '#d14424';

  let strokeDasharray = '0 0';
  if (outlineStyle === 'dashed') {
    strokeDasharray =
      outlineWidth <= 6
        ? `${outlineWidth * 4.5} ${outlineWidth * 2}`
        : `${outlineWidth * 4} ${outlineWidth * 1.5}`;
  } else if (outlineStyle === 'dotted') {
    strokeDasharray =
      outlineWidth <= 6
        ? `${outlineWidth * 1.8} ${outlineWidth * 1.6}`
        : `${outlineWidth * 1.5} ${outlineWidth * 1.2}`;
  }

  return { outlineWidth, outlineColor, strokeDasharray };
}

/**
 * Get clip shape path for polygon outlines.
 */
export const CLIP_PATHS: Record<string, (w: number, h: number) => string> = {
  rect2: (w, h) => `M 0 0 L ${w * 0.8} 0 L ${w} ${h * 0.2} L ${w} ${h} L 0 ${h} Z`,
  rect3: (w, h) =>
    `M 0 0 L ${w * 0.8} 0 L ${w} ${h * 0.2} L ${w} ${h} L ${w * 0.2} ${h} L 0 ${h * 0.8} Z`,
  triangle: (w, h) => `M ${w * 0.5} 0 L 0 ${h} L ${w} ${h} Z`,
  triangle2: (w, h) => `M ${w * 0.5} ${h} L 0 0 L ${w} 0 Z`,
  triangle3: (w, h) => `M 0 0 L 0 ${h} L ${w} ${h} Z`,
  rhombus: (w, h) => `M ${w * 0.5} 0 L ${w} ${h * 0.5} L ${w * 0.5} ${h} L 0 ${h * 0.5} Z`,
  pentagon: (w, h) =>
    `M ${w * 0.5} 0 L ${w} ${h * 0.38} L ${w * 0.82} ${h} L ${w * 0.18} ${h} L 0 ${h * 0.38} Z`,
  hexagon: (w, h) =>
    `M ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h * 0.5} L ${w * 0.8} ${h} L ${w * 0.2} ${h} L 0 ${h * 0.5} Z`,
  heptagon: (w, h) =>
    `M ${w * 0.5} 0 L ${w * 0.9} ${h * 0.2} L ${w} ${h * 0.6} L ${w * 0.75} ${h} L ${w * 0.25} ${h} L 0 ${h * 0.6} L ${w * 0.1} ${h * 0.2} Z`,
  octagon: (w, h) =>
    `M ${w * 0.3} 0 L ${w * 0.7} 0 L ${w} ${h * 0.3} L ${w} ${h * 0.7} L ${w * 0.7} ${h} L ${w * 0.3} ${h} L 0 ${h * 0.7} L 0 ${h * 0.3} Z`,
  chevron: (w, h) =>
    `M ${w * 0.75} 0 L ${w} ${h * 0.5} L ${w * 0.75} ${h} L 0 ${h} L ${w * 0.25} ${h * 0.5} L 0 0 Z`,
  point: (w, h) => `M 0 0 L ${w * 0.75} 0 L ${w} ${h * 0.5} L ${w * 0.75} ${h} L 0 ${h} Z`,
  arrow: (w, h) =>
    `M 0 ${h * 0.2} L ${w * 0.6} ${h * 0.2} L ${w * 0.6} 0 L ${w} ${h * 0.5} L ${w * 0.6} ${h} L ${w * 0.6} ${h * 0.8} L 0 ${h * 0.8} Z`,
  parallelogram: (w, h) => `M ${w * 0.3} 0 L ${w} 0 L ${w * 0.7} ${h} L 0 ${h} Z`,
  parallelogram2: (w, h) => `M ${w * 0.3} ${h} L ${w} ${h} L ${w * 0.7} 0 L 0 0 Z`,
  trapezoid: (w, h) => `M ${w * 0.25} 0 L ${w * 0.75} 0 L ${w} ${h} L 0 ${h} Z`,
  trapezoid2: (w, h) => `M 0 0 L ${w} 0 L ${w * 0.75} ${h} L ${w * 0.25} ${h} Z`,
};
