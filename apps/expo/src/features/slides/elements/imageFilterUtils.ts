/**
 * Image filter utilities for React Native.
 *
 * Port of Web's useFilter.ts.
 * Converts image filters to CSS filter string.
 */

export type ImageElementFilterKeys =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'grayscale'
  | 'saturate'
  | 'hue-rotate'
  | 'opacity'
  | 'sepia'
  | 'invert';

export interface ImageElementFilters {
  blur?: string;
  brightness?: string;
  contrast?: string;
  grayscale?: string;
  saturate?: string;
  'hue-rotate'?: string;
  sepia?: string;
  invert?: string;
  opacity?: string;
}

const FILTER_UNITS: Record<ImageElementFilterKeys, string> = {
  blur: 'px',
  brightness: '%',
  contrast: '%',
  grayscale: '%',
  saturate: '%',
  'hue-rotate': 'deg',
  sepia: '%',
  invert: '%',
  opacity: '%',
};

/**
 * Convert image filters to CSS filter string.
 */
export function imageFiltersToCss(filters?: ImageElementFilters): string {
  if (!filters) return '';
  const parts: string[] = [];
  for (const [name, value] of Object.entries(filters) as [ImageElementFilterKeys, string][]) {
    if (value === undefined || value === null || value === '') continue;
    const unit = FILTER_UNITS[name] ?? '';
    const rendered = unit && !value.endsWith(unit) ? `${value}${unit}` : value;
    parts.push(`${name}(${rendered})`);
  }
  return parts.join(' ');
}
