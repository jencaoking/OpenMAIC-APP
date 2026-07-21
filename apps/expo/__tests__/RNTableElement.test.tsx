import React from 'react';
import { render } from '@testing-library/react-native';
import { RNTableElement } from '../src/features/slides/elements/RNTableElement';

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

  it('should render simple table', () => {
    const { getByText } = render(<RNTableElement element={simpleTable as any} />);
    expect(getByText('A1')).toBeTruthy();
    expect(getByText('B1')).toBeTruthy();
  });

  it('should render empty table', () => {
    const emptyTable = { ...simpleTable, data: [] };
    const { toJSON } = render(<RNTableElement element={emptyTable as any} />);
    expect(toJSON()).toBeNull();
  });

  it('should handle colspan', () => {
    const tableWithColspan = {
      ...simpleTable,
      data: [
        [{ id: 'c1', colspan: 2, rowspan: 1, text: 'Merged' }],
      ],
    };
    const { getByText } = render(<RNTableElement element={tableWithColspan as any} />);
    expect(getByText('Merged')).toBeTruthy();
  });
});
