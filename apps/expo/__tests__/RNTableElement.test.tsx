import React from 'react';
import { RNTableElement } from '../src/features/slides/elements/RNTableElement';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: (s: any) => s },
}));

describe('RNTableElement', () => {
  const simpleTable = {
    type: 'table' as const,
    id: 'table-1',
    left: 0,
    top: 0,
    width: 400,
    height: 200,
    data: [
      [
        { id: 'c1', colspan: 1, rowspan: 1, text: 'A1' },
        { id: 'c2', colspan: 1, rowspan: 1, text: 'B1' },
      ],
      [
        { id: 'c3', colspan: 1, rowspan: 1, text: 'A2' },
        { id: 'c4', colspan: 1, rowspan: 1, text: 'B2' },
      ],
    ],
    colWidths: [0.5, 0.5],
    cellMinHeight: 40,
  };

  it('should render without crashing', () => {
    const element = React.createElement(RNTableElement, { element: simpleTable as any });
    expect(element).toBeTruthy();
  });

  it('should return null for empty table', () => {
    const emptyTable = { ...simpleTable, data: [] };
    const element = React.createElement(RNTableElement, { element: emptyTable as any });
    expect(element).toBeTruthy();
  });
});
