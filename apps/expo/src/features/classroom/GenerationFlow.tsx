import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LandscapeContainer } from './layout/LandscapeContainer';
import { GenerationInput } from './components/GenerationInput';
import { GenerationPreview } from './components/GenerationPreview';
import { ClassroomScreen } from './ClassroomScreen';
import { useClassroomGeneration } from './hooks/useClassroomGeneration';
import { useGenerationStore } from './store/generationStore';
import type { SceneOutline } from './api/generationApi';

type FlowStep = 'input' | 'preview' | 'classroom';

/**
 * 课堂生成流程。
 * 从用户输入到大纲预览再到课堂播放的完整流程。
 */
export function GenerationFlow() {
  const [flowStep, setFlowStep] = useState<FlowStep>('input');
  const [requirement, setRequirement] = useState('');
  const [outlines, setOutlines] = useState<SceneOutline[]>([]);
  const [courseTitle, setCourseTitle] = useState('');

  const { startGeneration } = useClassroomGeneration();
  const generationStore = useGenerationStore();

  const handleGenerate = (req: string) => {
    setRequirement(req);
    setFlowStep('preview');
  };

  const handlePreviewComplete = (generatedOutlines: SceneOutline[], title: string) => {
    setOutlines(generatedOutlines);
    setCourseTitle(title);
    setFlowStep('classroom');
  };

  const handleBackToInput = () => {
    generationStore.reset();
    setFlowStep('input');
  };

  const handleBackToPreview = () => {
    setFlowStep('preview');
  };

  return (
    <LandscapeContainer>
      {flowStep === 'input' && (
        <GenerationInput
          onGenerate={handleGenerate}
          isGenerating={generationStore.step === 'outline'}
        />
      )}

      {flowStep === 'preview' && (
        <GenerationPreview
          requirement={requirement}
          onComplete={handlePreviewComplete}
          onBack={handleBackToInput}
        />
      )}

      {flowStep === 'classroom' && (
        <ClassroomScreen title={courseTitle} onBack={handleBackToPreview} />
      )}
    </LandscapeContainer>
  );
}
