import React from 'react';
import { Whiteboard } from '../src/features/slides/whiteboard/Whiteboard';
import { useWhiteboardStore } from '../src/features/slides/whiteboard/whiteboardStore';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Modal: 'Modal',
  Animated: {
    Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn() })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
  },
  StyleSheet: { create: (s: any) => s },
}));

describe('Whiteboard', () => {
  beforeEach(() => {
    useWhiteboardStore.getState().clearElements();
    useWhiteboardStore.getState().setOpen(false);
  });

  it('should not render when closed', () => {
    const element = React.createElement(Whiteboard, {
      isOpen: false,
      onClose: () => {},
    });
    expect(element).toBeNull();
  });

  it('should render when open', () => {
    const element = React.createElement(Whiteboard, {
      isOpen: true,
      onClose: () => {},
    });
    expect(element).toBeTruthy();
  });
});
