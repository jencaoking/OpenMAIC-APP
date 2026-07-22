import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import type { PBLContent } from './pblTypes';
import { usePBLStore } from './pblStore';
import { PBLRoleSelection } from './PBLRoleSelection';
import { PBLWorkspace } from './PBLWorkspace';

interface PBLRendererProps {
  content: PBLContent;
  sceneId: string;
}

/**
 * PBL Renderer - Main orchestrator.
 *
 * Port of Web's PBLRenderer component.
 * Manages PBL flow: Role Selection → Workspace.
 */
export function PBLRenderer({ content, sceneId }: PBLRendererProps) {
  const { projectConfig, selectedRole, setProjectConfig, selectRole, resetRole } = usePBLStore();

  // Initialize config from content
  useEffect(() => {
    if (content.projectConfig) {
      setProjectConfig(content.projectConfig);
    }
  }, [content.projectConfig, setProjectConfig]);

  const handleSelectRole = useCallback(
    (roleName: string) => {
      selectRole(roleName);
    },
    [selectRole],
  );

  const handleConfigUpdate = useCallback(
    (updatedConfig: typeof projectConfig extends infer T ? T : never) => {
      if (updatedConfig) {
        setProjectConfig(updatedConfig);
      }
    },
    [setProjectConfig],
  );

  const handleReset = useCallback(() => {
    resetRole();
  }, [resetRole]);

  if (!projectConfig) {
    return <View style={styles.container} />;
  }

  // Show role selection if no role selected
  if (!selectedRole) {
    return (
      <View style={styles.container}>
        <PBLRoleSelection
          projectInfo={projectConfig.projectInfo}
          agents={projectConfig.agents}
          onSelectRole={handleSelectRole}
        />
      </View>
    );
  }

  // Show workspace
  return (
    <View style={styles.container}>
      <PBLWorkspace
        projectConfig={projectConfig}
        userRole={selectedRole}
        onConfigUpdate={handleConfigUpdate}
        onReset={handleReset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
