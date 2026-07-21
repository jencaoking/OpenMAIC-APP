import React from 'react';
import { render } from '@testing-library/react-native';
import { Whiteboard } from '../src/features/slides/whiteboard/Whiteboard';
import { useWhiteboardStore } from '../src/features/slides/whiteboard/whiteboardStore';

describe('Whiteboard', () => {
  beforeEach(() => {
    useWhiteboardStore.getState().clearElements();
    useWhiteboardStore.getState().setOpen(false);
  });

  it('should not render when closed', () => {
    const { toJSON } = render(
      <Whiteboard isOpen={false} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  it('should render when open', () => {
    const { getByText } = render(
      <Whiteboard isOpen onClose={() => {}} />
    );
    expect(getByText('Whiteboard')).toBeTruthy();
  });

  it('should show empty state', () => {
    const { getByText } = render(
      <Whiteboard isOpen onClose={() => {}} />
    );
    expect(getByText('Whiteboard Ready')).toBeTruthy();
  });
});
