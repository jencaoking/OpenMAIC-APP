import React from 'react';
import { PBLRoleSelection } from '../src/features/slides/pbl/PBLRoleSelection';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  StyleSheet: { create: (s: any) => s },
}));

describe('PBLRoleSelection', () => {
  const projectInfo = { title: 'Test Project', description: 'A test project' };
  const agents = [
    { name: 'Developer', actor_role: 'Build features', role_division: 'development' as const, is_system_agent: false } as any,
    { name: 'Designer', actor_role: 'Design UI', role_division: 'development' as const, is_system_agent: false } as any,
    { name: 'System', actor_role: 'System agent', role_division: 'management' as const, is_system_agent: true } as any,
  ];

  it('should render without crashing', () => {
    const element = React.createElement(PBLRoleSelection, {
      projectInfo,
      agents,
      onSelectRole: () => {},
    });
    expect(element).toBeTruthy();
  });
});
