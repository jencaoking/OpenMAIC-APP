import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PBLRoleSelection } from '../src/features/slides/pbl/PBLRoleSelection';

describe('PBLRoleSelection', () => {
  const projectInfo = { title: 'Test Project', description: 'A test project' };
  const agents = [
    { name: 'Developer', actor_role: 'Build features', role_division: 'development' as const, is_system_agent: false } as any,
    { name: 'Designer', actor_role: 'Design UI', role_division: 'development' as const, is_system_agent: false } as any,
    { name: 'System', actor_role: 'System agent', role_division: 'management' as const, is_system_agent: true } as any,
  ];

  it('should render project info', () => {
    const { getByText } = render(
      <PBLRoleSelection projectInfo={projectInfo} agents={agents} onSelectRole={() => {}} />
    );
    expect(getByText('Test Project')).toBeTruthy();
    expect(getByText('A test project')).toBeTruthy();
  });

  it('should render selectable agents', () => {
    const { getByText } = render(
      <PBLRoleSelection projectInfo={projectInfo} agents={agents} onSelectRole={() => {}} />
    );
    expect(getByText('Developer')).toBeTruthy();
    expect(getByText('Designer')).toBeTruthy();
    // System agent should not be shown
    expect(() => getByText('System')).toThrow();
  });

  it('should call onSelectRole when agent tapped', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <PBLRoleSelection projectInfo={projectInfo} agents={agents} onSelectRole={onSelect} />
    );
    fireEvent.press(getByText('Developer'));
    expect(onSelect).toHaveBeenCalledWith('Developer');
  });
});
