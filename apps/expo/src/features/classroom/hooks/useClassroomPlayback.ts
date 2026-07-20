import { useEffect, useRef, useCallback } from 'react';
import { useClassroomStore, type EngineMode } from '../store/classroomStore';
import { PlaybackEngine, type PlaybackState } from '../store/playbackEngine';
import { ActionEngine, type Action } from '../store/actionEngine';
import { StreamBuffer } from '../store/streamBuffer';

/**
 * 课堂播放编排 Hook。
 * 连接 PlaybackEngine、ActionEngine、StreamBuffer 与 classroomStore。
 */
export function useClassroomPlayback() {
  const {
    scenes,
    currentSceneIndex,
    engineMode,
    setEngineMode,
    goToNextScene,
    goToPrevScene,
    setLectureSpeech,
    setSpeakingAgentId,
    setSpeechProgress,
    setPlaybackCompleted,
  } = useClassroomStore();

  const playbackEngineRef = useRef<PlaybackEngine | null>(null);
  const actionEngineRef = useRef<ActionEngine | null>(null);
  const streamBufferRef = useRef<StreamBuffer | null>(null);

  // 初始化引擎
  useEffect(() => {
    const playbackEngine = new PlaybackEngine({
      onSceneChange: (index) => {
        goToScene(index);
      },
      onStateChange: (state) => {
        const modeMap: Record<PlaybackState, EngineMode> = {
          idle: 'idle',
          playing: 'playing',
          paused: 'paused',
          completed: 'idle',
        };
        setEngineMode(modeMap[state]);
      },
      onSpeechUpdate: (text) => {
        setLectureSpeech(text);
      },
      onProgressUpdate: (progress) => {
        setSpeechProgress(progress);
      },
      onPlaybackComplete: () => {
        setPlaybackCompleted(true);
        setEngineMode('idle');
      },
    });

    const actionEngine = new ActionEngine({
      onActionStart: (action) => {
        if (action.type === 'speech') {
          setSpeakingAgentId('teacher');
          streamBufferRef.current?.startStream();
        }
      },
      onActionEnd: (action) => {
        if (action.type === 'speech') {
          streamBufferRef.current?.endStream();
        }
      },
      onSpeechUpdate: (text) => {
        streamBufferRef.current?.appendText(text);
      },
      onHighlight: (elementId) => {
        // TODO: 高亮元素
      },
    });

    const streamBuffer = new StreamBuffer({
      onTextUpdate: (text) => {
        setLectureSpeech(text);
      },
      onStreamComplete: () => {
        setSpeakingAgentId(null);
      },
    });

    playbackEngineRef.current = playbackEngine;
    actionEngineRef.current = actionEngine;
    streamBufferRef.current = streamBuffer;

    return () => {
      playbackEngine.destroy();
      actionEngine.destroy();
      streamBuffer.destroy();
    };
  }, []);

  // 同步场景数量
  useEffect(() => {
    playbackEngineRef.current?.setTotalScenes(scenes.length);
  }, [scenes.length]);

  // 响应引擎模式变化
  useEffect(() => {
    const engine = playbackEngineRef.current;
    if (!engine) return;

    switch (engineMode) {
      case 'playing':
        if (engine.getState() === 'paused') {
          engine.resume();
        } else if (engine.getState() === 'idle' || engine.getState() === 'completed') {
          engine.play();
        }
        break;
      case 'paused':
        engine.pause();
        break;
      case 'idle':
        engine.stop();
        break;
    }
  }, [engineMode]);

  const goToScene = useCallback((index: number) => {
    const engine = playbackEngineRef.current;
    if (!engine) return;

    engine.goToScene(index);

    // 生成该场景的动作序列
    const actions = generateSceneActions(index);
    actionEngineRef.current?.setActions(actions);
    if (engineMode === 'playing') {
      actionEngineRef.current?.start();
    }
  }, [engineMode]);

  const togglePlayPause = useCallback(() => {
    if (engineMode === 'playing') {
      setEngineMode('paused');
    } else {
      setEngineMode('playing');
    }
  }, [engineMode, setEngineMode]);

  const nextScene = useCallback(() => {
    goToNextScene();
  }, [goToNextScene]);

  const prevScene = useCallback(() => {
    goToPrevScene();
  }, [goToPrevScene]);

  return {
    togglePlayPause,
    nextScene,
    prevScene,
    goToScene,
  };
}

/**
 * 为指定场景生成动作序列。
 * 这是演示用的简化版本。
 */
function generateSceneActions(sceneIndex: number): Action[] {
  // 演示：每个场景生成一些示例动作
  const demoActions: Action[][] = [
    // 场景 1
    [
      { id: 'a1', type: 'speech', params: { text: '欢迎来到量子力学课程。' }, duration: 3000 },
      { id: 'a2', type: 'delay', params: {}, delay: 500 },
      { id: 'a3', type: 'speech', params: { text: '量子力学是物理学的基础分支，研究微观粒子的行为规律。' }, duration: 4000 },
    ],
    // 场景 2
    [
      { id: 'a4', type: 'speech', params: { text: '波粒二象性是量子力学的核心概念之一。' }, duration: 3000 },
      { id: 'a5', type: 'delay', params: {}, delay: 500 },
      { id: 'a6', type: 'speech', params: { text: '光和物质同时具有波和粒子的双重性质。' }, duration: 4000 },
    ],
    // 场景 3
    [
      { id: 'a7', type: 'speech', params: { text: '海森堡不确定性原理告诉我们，无法同时精确测量粒子的位置和动量。' }, duration: 5000 },
    ],
    // 场景 4
    [
      { id: 'a8', type: 'speech', params: { text: '量子叠加态是指系统可以同时处于多个状态。' }, duration: 4000 },
      { id: 'a9', type: 'discussion', params: { prompt: '大家对叠加态有什么疑问？' } },
    ],
    // 场景 5
    [
      { id: 'a10', type: 'speech', params: { text: '薛定谔的猫是最著名的思想实验。' }, duration: 3000 },
      { id: 'a11', type: 'delay', params: {}, delay: 500 },
      { id: 'a12', type: 'speech', params: { text: '一只猫在盒子里，同时处于活着和死了的叠加态。' }, duration: 4000 },
    ],
  ];

  return demoActions[sceneIndex % demoActions.length] || [];
}
