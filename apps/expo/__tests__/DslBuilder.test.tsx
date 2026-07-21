import React from 'react';
import { render } from '@testing-library/react-native';
import { DslBuilder } from '../src/features/slides/builder/DslBuilder';
import { useBuilderStore } from '../src/features/slides/builder/builderStore';

describe('DslBuilder', () => {
  beforeEach(() => {
    useBuilderStore.getState().clear();
  });

  it('should render when open', () => {
    const { getByText } = render(
      <DslBuilder isOpen onClose={() => {}} />
    );
    expect(getByText('DSL Builder')).toBeTruthy();
  });

  it('should not render when closed', () => {
    const { toJSON } = render(
      <DslBuilder isOpen={false} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  it('should render material panel', () => {
    const { getByText } = render(
      <DslBuilder isOpen onClose={() => {}} />
    );
    expect(getByText('Components')).toBeTruthy();
  });
});
