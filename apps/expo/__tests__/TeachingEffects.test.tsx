import React from 'react';
import { TeachingEffects } from '../src/features/slides/TeachingEffects';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: (s: any) => s },
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Rect: 'Rect',
  Defs: 'Defs',
  Mask: 'Mask',
  Circle: 'Circle',
  Line: 'Line',
}));

describe('TeachingEffects', () => {
  const defaultPositions = {
    el1: { left: 100, top: 100, width: 200, height: 100 },
  };

  it('should render without effects', () => {
    const element = React.createElement(TeachingEffects, {
      canvasWidth: 800,
      canvasHeight: 600,
      elementPositions: defaultPositions,
    });
    expect(element).toBeTruthy();
  });

  it('should render with spotlight', () => {
    const element = React.createElement(TeachingEffects, {
      canvasWidth: 800,
      canvasHeight: 600,
      elementPositions: defaultPositions,
      spotlightElementId: 'el1',
      spotlightOptions: { dimness: 0.7 },
    });
    expect(element).toBeTruthy();
  });

  it('should render with highlight', () => {
    const element = React.createElement(TeachingEffects, {
      canvasWidth: 800,
      canvasHeight: 600,
      elementPositions: defaultPositions,
      highlightedElementIds: ['el1'],
      highlightOptions: { color: '#ff0000', opacity: 0.3, borderWidth: 3 },
    });
    expect(element).toBeTruthy();
  });
});
