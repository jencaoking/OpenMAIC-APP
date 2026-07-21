import React from 'react';
import { render } from '@testing-library/react-native';
import { EditShell } from '../src/features/slides/edit/EditShell';

describe('EditShell', () => {
  const scenes = [
    { id: 's1', index: 0, title: 'Scene 1', type: 'slide' },
    { id: 's2', index: 1, title: 'Scene 2', type: 'slide' },
  ];

  it('should render with children', () => {
    const { getByText } = render(
      <EditShell
        sceneTitle="Test Scene"
        scenes={scenes}
        currentSceneId="s1"
        onSelectScene={() => {}}
      >
        <View testID="canvas" />
      </EditShell>
    );
    expect(getByText('Test Scene')).toBeTruthy();
  });

  it('should render scene nav rail', () => {
    const { getByText } = render(
      <EditShell
        sceneTitle="Test Scene"
        scenes={scenes}
        currentSceneId="s1"
        onSelectScene={() => {}}
      >
        <View />
      </EditShell>
    );
    expect(getByText('Scenes')).toBeTruthy();
  });
});

import { View } from 'react-native';
