import React from 'react';
import { render } from '@testing-library/react-native';
import { TeachingEffects } from '../src/features/slides/TeachingEffects';
import { useTeachingStore } from '../src/features/slides/teachingStore';

describe('TeachingEffects', () => {
  beforeEach(() => {
    useTeachingStore.getState().clearAllEffects();
  });

  const defaultPositions = {
    el1: { left: 100, top: 100, width: 200, height: 100 },
  };

  it('should render without effects', () => {
    const { toJSON } = render(
      <TeachingEffects
        canvasWidth={800}
        canvasHeight={600}
        elementPositions={defaultPositions}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with spotlight', () => {
    useTeachingStore.getState().setSpotlight('el1');
    const { toJSON } = render(
      <TeachingEffects
        canvasWidth={800}
        canvasHeight={600}
        elementPositions={defaultPositions}
        spotlightElementId="el1"
        spotlightOptions={{ dimness: 0.7 }}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with highlight', () => {
    useTeachingStore.getState().setHighlight(['el1']);
    const { toJSON } = render(
      <TeachingEffects
        canvasWidth={800}
        canvasHeight={600}
        elementPositions={defaultPositions}
        highlightedElementIds={['el1']}
        highlightOptions={{ color: '#ff0000', opacity: 0.3, borderWidth: 3 }}
      />
    );
    expect(toJSON()).toBeTruthy();
  });
});
