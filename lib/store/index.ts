// Core stores
import { useCanvasStore } from './canvas';
import { useSnapshotStore } from './snapshot';
import { useKeyboardStore } from './keyboard';
import { useStageStore } from './stage';
import { useSettingsStore } from './settings';
import { useBuilderStore } from './builder';

export {
  // New architecture
  useCanvasStore,
  useStageStore,
  useSnapshotStore,
  useKeyboardStore,
  useSettingsStore,
  useBuilderStore,
};

// Scene Context API (for extensible scene types)
export { SceneProvider, useSceneData, useSceneSelector } from '@/lib/contexts/scene-context';
