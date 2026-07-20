import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LandscapeContainer } from './layout/LandscapeContainer';
import { ThreeColumnLayout } from './layout/ThreeColumnLayout';
import { ClassroomHeader } from './components/ClassroomHeader';
import { SceneSidebar } from './components/SceneSidebar';
import { CanvasArea } from './components/CanvasArea';
import { Roundtable } from './components/Roundtable';
import { ChatArea } from './components/ChatArea';
import { useClassroomStore } from './store/classroomStore';

interface ClassroomScreenProps {
  classroomId?: string;
  onBack: () => void;
}

// Demo scenes for testing
const DEMO_SCENES = [
  { id: '1', title: '什么是量子力学', index: 0, type: 'slide' as const },
  { id: '2', title: '波粒二象性', index: 1, type: 'slide' as const },
  { id: '3', title: '不确定性原理', index: 2, type: 'slide' as const },
  { id: '4', title: '量子叠加态', index: 3, type: 'quiz' as const },
  { id: '5', title: '薛定谔的猫', index: 4, type: 'slide' as const },
  { id: '6', title: '量子纠缠', index: 5, type: 'slide' as const },
  { id: '7', title: '量子隧穿效应', index: 6, type: 'interactive' as const },
  { id: '8', title: '量子计算基础', index: 7, type: 'slide' as const },
  { id: '9', title: '量子比特', index: 8, type: 'slide' as const },
  { id: '10', title: '量子门操作', index: 9, type: 'slide' as const },
  { id: '11', title: '量子算法', index: 10, type: 'slide' as const },
  { id: '12', title: '课程总结', index: 11, type: 'slide' as const },
];

export function ClassroomScreen({ classroomId, onBack }: ClassroomScreenProps) {
  const { setScenes, setCurrentSceneIndex } = useClassroomStore();

  // Load scenes on mount
  useEffect(() => {
    setScenes(DEMO_SCENES);
    setCurrentSceneIndex(0);
  }, []);

  const currentScene = useClassroomStore((s) => s.scenes[s.currentSceneIndex]);

  const headerSubtitle = useMemo(() => {
    if (!currentScene) return '课堂';
    return `场景 ${currentScene.index + 1}`;
  }, [currentScene]);

  return (
    <LandscapeContainer>
      <View style={styles.container}>
        <ClassroomHeader
          title="量子力学基础"
          subtitle={headerSubtitle}
          onBack={onBack}
        />
        <View style={styles.body}>
          <ThreeColumnLayout
            sidebar={<SceneSidebar />}
            main={
              <View style={styles.mainColumn}>
                <CanvasArea />
                <Roundtable />
              </View>
            }
            chat={<ChatArea />}
          />
        </View>
      </View>
    </LandscapeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  mainColumn: {
    flex: 1,
  },
});
