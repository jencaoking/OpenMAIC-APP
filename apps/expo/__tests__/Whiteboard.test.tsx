import React from 'react';

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

// Mock @openmaic/dsl
jest.mock('@openmaic/dsl', () => ({
  ElementTypes: { TEXT: 'text', IMAGE: 'image', SHAPE: 'shape', LINE: 'line', TABLE: 'table', CODE: 'code', LATEX: 'latex', CHART: 'chart', VIDEO: 'video', AUDIO: 'audio' },
}));

// Mock whiteboard components
jest.mock('../src/features/slides/whiteboard/WhiteboardCanvas', () => ({
  WhiteboardCanvas: 'WhiteboardCanvas',
}));

jest.mock('../src/features/slides/whiteboard/WhiteboardHistory', () => ({
  WhiteboardHistory: 'WhiteboardHistory',
}));

// Mock slide components
jest.mock('../src/features/slides/RNSlideElement', () => ({
  RNSlideElement: 'RNSlideElement',
}));

jest.mock('../src/features/slides/elements/RNTextElement', () => ({
  RNTextElement: 'RNTextElement',
}));

jest.mock('../src/features/slides/elements/RNImageElement', () => ({
  RNImageElement: 'RNImageElement',
}));

jest.mock('../src/features/slides/elements/RNShapeElement', () => ({
  RNShapeElement: 'RNShapeElement',
}));

jest.mock('../src/features/slides/elements/RNLineElement', () => ({
  RNLineElement: 'RNLineElement',
}));

jest.mock('../src/features/slides/elements/RNTableElement', () => ({
  RNTableElement: 'RNTableElement',
}));

jest.mock('../src/features/slides/elements/RNCodeElement', () => ({
  RNCodeElement: 'RNCodeElement',
}));

jest.mock('../src/features/slides/elements/RNLatexElement', () => ({
  RNLatexElement: 'RNLatexElement',
}));

jest.mock('../src/features/slides/elements/RNChartElement', () => ({
  RNChartElement: 'RNChartElement',
}));

jest.mock('../src/features/slides/elements/RNInteractiveScene', () => ({
  RNInteractiveScene: 'RNInteractiveScene',
}));

jest.mock('../src/features/slides/pbl/PBLRenderer', () => ({
  PBLRenderer: 'PBLRenderer',
}));

jest.mock('../src/features/slides/editor/textEditorStore', () => ({
  useTextEditorStore: { getState: jest.fn(() => ({ setEditingElementId: jest.fn() })) },
}));

const { Whiteboard } = require('../src/features/slides/whiteboard/Whiteboard');
const { useWhiteboardStore } = require('../src/features/slides/whiteboard/whiteboardStore');

describe('Whiteboard', () => {
  beforeEach(() => {
    useWhiteboardStore.getState().clearElements();
    useWhiteboardStore.getState().setOpen(false);
  });

  it('should not render when closed', () => {
    const result = Whiteboard({ isOpen: false, onClose: () => {} });
    expect(result).toBeNull();
  });

  it('should render when open', () => {
    const result = Whiteboard({ isOpen: true, onClose: () => {} });
    expect(result).toBeTruthy();
  });
});
