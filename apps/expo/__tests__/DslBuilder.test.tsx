import React from 'react';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Modal: 'Modal',
  StyleSheet: { create: (s: any) => s },
}));

const { DslBuilder } = require('../src/features/slides/builder/DslBuilder');
const { useBuilderStore } = require('../src/features/slides/builder/builderStore');

describe('DslBuilder', () => {
  beforeEach(() => {
    useBuilderStore.getState().clear();
  });

  it('should render when open', () => {
    const result = DslBuilder({
      isOpen: true,
      onClose: () => {},
    });
    expect(result).toBeTruthy();
  });

  it('should return null when closed', () => {
    const result = DslBuilder({
      isOpen: false,
      onClose: () => {},
    });
    expect(result).toBeNull();
  });
});
