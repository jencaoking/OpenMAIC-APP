import { create } from 'zustand';

/**
 * Teaching effects store for Mobile.
 *
 * Port of Web's canvasStore teaching features:
 * - Spotlight (聚光灯)
 * - Highlight (高亮)
 * - Laser (激光笔) — placeholder for future implementation
 */

export interface SpotlightOptions {
  radius?: number;
  dimness?: number;
  transition?: number;
}

export interface HighlightOverlayOptions {
  color?: string;
  opacity?: number;
  borderWidth?: number;
  animated?: boolean;
}

export interface LaserOptions {
  color?: string;
  duration?: number;
}

export interface ZoomTarget {
  elementId: string;
  scale: number;
}

interface TeachingState {
  // Spotlight
  spotlightElementId: string;
  spotlightOptions: SpotlightOptions | null;

  // Highlight
  highlightedElementIds: string[];
  highlightOptions: HighlightOverlayOptions | null;

  // Laser
  laserElementId: string;
  laserOptions: LaserOptions | null;

  // Zoom
  zoomTarget: ZoomTarget | null;

  // Actions
  setSpotlight: (elementId: string, options?: SpotlightOptions) => void;
  clearSpotlight: () => void;
  setHighlight: (elementIds: string[], options?: HighlightOverlayOptions) => void;
  clearHighlight: () => void;
  setLaser: (elementId: string, options?: LaserOptions) => void;
  clearLaser: () => void;
  setZoom: (elementId: string, scale: number) => void;
  clearZoom: () => void;
  clearAllEffects: () => void;
}

export const useTeachingStore = create<TeachingState>((set) => ({
  // Spotlight
  spotlightElementId: '',
  spotlightOptions: null,

  // Highlight
  highlightedElementIds: [],
  highlightOptions: null,

  // Laser
  laserElementId: '',
  laserOptions: null,

  // Zoom
  zoomTarget: null,

  // Actions
  setSpotlight: (elementId, options = {}) =>
    set({
      spotlightElementId: elementId,
      spotlightOptions: {
        radius: 200,
        dimness: 0.7,
        transition: 300,
        ...options,
      },
    }),

  clearSpotlight: () =>
    set({
      spotlightElementId: '',
      spotlightOptions: null,
    }),

  setHighlight: (elementIds, options = {}) =>
    set({
      highlightedElementIds: elementIds,
      highlightOptions: {
        color: '#ff6b6b',
        opacity: 0.3,
        borderWidth: 3,
        animated: true,
        ...options,
      },
    }),

  clearHighlight: () =>
    set({
      highlightedElementIds: [],
      highlightOptions: null,
    }),

  setLaser: (elementId, options = {}) =>
    set({
      laserElementId: elementId,
      laserOptions: {
        color: '#ff0000',
        duration: 3000,
        ...options,
      },
    }),

  clearLaser: () =>
    set({
      laserElementId: '',
      laserOptions: null,
    }),

  setZoom: (elementId, scale) =>
    set({
      zoomTarget: { elementId, scale },
    }),

  clearZoom: () =>
    set({
      zoomTarget: null,
    }),

  clearAllEffects: () =>
    set({
      spotlightElementId: '',
      spotlightOptions: null,
      highlightedElementIds: [],
      highlightOptions: null,
      laserElementId: '',
      laserOptions: null,
      zoomTarget: null,
    }),
}));
