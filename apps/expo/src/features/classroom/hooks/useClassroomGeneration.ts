import { useCallback, useRef } from 'react';
import { useGenerationStore } from '../store/generationStore';
import { useClassroomStore } from '../store/classroomStore';
import {
  generateSceneOutlines,
  generateSceneContent,
  generateSceneActions,
  type SceneOutline,
} from '../api/generationApi';

/**
 * 课堂生成编排 Hook。
 * 管理从用户输入到可播放课堂的完整生成流程。
 */
export function useClassroomGeneration() {
  const generationStore = useGenerationStore();
  const classroomStore = useClassroomStore();
  const isGeneratingRef = useRef(false);

  /**
   * 开始生成课堂
   */
  const startGeneration = useCallback(async (requirement: string) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    generationStore.setRequirement(requirement);
    generationStore.setStep('outline');
    generationStore.setProgress(0);
    generationStore.setError(null);

    try {
      // Phase 1: 生成大纲
      const outlines: SceneOutline[] = [];
      let courseTitle = '';

      await generateSceneOutlines(
        { requirement },
        // onOutline
        (outline) => {
          outlines.push(outline);
          generationStore.addOutline(outline);
        },
        // onDone
        (result) => {
          courseTitle = result.courseTitle;
          generationStore.setCourseTitle(result.courseTitle);
          generationStore.setLanguageDirective(result.languageDirective);
        },
        // onError
        (error) => {
          throw error;
        },
      );

      if (outlines.length === 0) {
        throw new Error('未生成任何大纲');
      }

      // Phase 2: 设置场景
      const scenes = outlines.map((outline, index) => ({
        id: outline.id,
        title: outline.title,
        index,
        type: outline.type as 'slide' | 'quiz' | 'interactive' | 'pbl',
      }));

      classroomStore.setScenes(scenes);

      // Phase 3: 为每个场景生成内容和动作
      generationStore.setStep('generating-content');
      generationStore.setTotalToGenerate(outlines.length);

      for (let i = 0; i < outlines.length; i++) {
        generationStore.setCurrentGeneratingIndex(i);
        generationStore.setProgress((i + 1) / outlines.length);

        try {
          // 生成内容
          const contentResult = await generateSceneContent(outlines[i]);

          // 生成动作
          const actionsResult = await generateSceneActions(outlines[i], contentResult);

          // TODO: 保存到本地存储
          console.log(`Scene ${i + 1} generated:`, {
            content: contentResult,
            actions: actionsResult,
          });
        } catch (error) {
          console.error(`Failed to generate scene ${i + 1}:`, error);
          // 继续生成其他场景
        }
      }

      // Phase 4: 完成
      generationStore.setStep('complete');
      generationStore.setProgress(1);

      // 跳转到第一个场景
      classroomStore.setCurrentSceneIndex(0);
    } catch (error) {
      generationStore.setError(error instanceof Error ? error.message : String(error));
      generationStore.setStep('error');
    } finally {
      isGeneratingRef.current = false;
    }
  }, []);

  return {
    startGeneration,
    isGenerating: isGeneratingRef.current,
  };
}
