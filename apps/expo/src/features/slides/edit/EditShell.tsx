import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CommandBar } from './CommandBar';
import { SlideNavRail } from './SlideNavRail';
import { FloatingToolbar } from './FloatingToolbar';
import { useEditStore } from './editStore';

interface SceneThumb {
  id: string;
  index: number;
  title?: string;
  type: string;
}

interface EditShellProps {
  /** Current scene title */
  sceneTitle: string;
  /** Scene thumbnails for navigation */
  scenes: SceneThumb[];
  /** Current scene ID */
  currentSceneId: string;
  /** Canvas content */
  children: React.ReactNode;
  /** Right rail content (AgentPanel) */
  rightRail?: React.ReactNode;

  // Callbacks
  onSelectScene: (sceneId: string) => void;
  onAddScene?: () => void;
  onDeleteScene?: (sceneId: string) => void;
  onDuplicateScene?: (sceneId: string) => void;
  onBack?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Element actions
  onDuplicateElement?: () => void;
  onDeleteElement?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
}

/**
 * EditShell - Pro mode chrome.
 *
 * Port of Web's EditShell component.
 * Simplified layout: CommandBar + SlideNavRail + Canvas + FloatingToolbar.
 */
export function EditShell({
  sceneTitle,
  scenes,
  currentSceneId,
  children,
  rightRail,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
  onBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDuplicateElement,
  onDeleteElement,
  onBringForward,
  onSendBackward,
}: EditShellProps) {
  const { selectedElementId, selectElement } = useEditStore();

  return (
    <View style={styles.container}>
      {/* CommandBar */}
      <CommandBar
        title={sceneTitle}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onBack={onBack}
      />

      {/* Main content area */}
      <View style={styles.body}>
        {/* Left: SlideNavRail */}
        <SlideNavRail
          scenes={scenes}
          currentSceneId={currentSceneId}
          onSelectScene={onSelectScene}
          onAddScene={onAddScene}
          onDeleteScene={onDeleteScene}
          onDuplicateScene={onDuplicateScene}
        />

        {/* Center: Canvas */}
        <View style={styles.canvasArea}>
          {children}

          {/* FloatingToolbar */}
          <FloatingToolbar
            selectedElementId={selectedElementId}
            onDuplicate={onDuplicateElement}
            onDelete={onDeleteElement}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            onClose={() => selectElement(null)}
          />
        </View>

        {/* Right: Agent Panel (optional) */}
        {rightRail && <View style={styles.rightRail}>{rightRail}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  canvasArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  rightRail: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
});
