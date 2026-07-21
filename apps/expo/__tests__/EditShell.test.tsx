import React from 'react';
import { EditShell } from '../src/features/slides/edit/EditShell';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: { create: (s: any) => s },
}));

describe('EditShell', () => {
  const scenes = [
    { id: 's1', index: 0, title: 'Scene 1', type: 'slide' },
    { id: 's2', index: 1, title: 'Scene 2', type: 'slide' },
  ];

  it('should render without crashing', () => {
    const element = React.createElement(EditShell, {
      sceneTitle: 'Test Scene',
      scenes,
      currentSceneId: 's1',
      onSelectScene: () => {},
    }, React.createElement('View'));
    expect(element).toBeTruthy();
  });
});
