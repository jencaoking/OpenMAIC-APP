import React from 'react';
import { DslBuilder } from '../src/features/slides/builder/DslBuilder';
import { useBuilderStore } from '../src/features/slides/builder/builderStore';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Modal: 'Modal',
  StyleSheet: { create: (s: any) => s },
}));

describe('DslBuilder', () => {
  beforeEach(() => {
    useBuilderStore.getState().clear();
  });

  it('should render when open', () => {
    const element = React.createElement(DslBuilder, {
      isOpen: true,
      onClose: () => {},
    });
    expect(element).toBeTruthy();
  });

  it('should not render when closed', () => {
    const element = React.createElement(DslBuilder, {
      isOpen: false,
      onClose: () => {},
    });
    expect(element).toBeNull();
  });
});
