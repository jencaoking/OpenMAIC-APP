import { create } from 'zustand';

export type EngineMode = 'idle' | 'playing' | 'paused' | 'live';

interface Scene {
  id: string;
  title: string;
  index: number;
  type: 'slide' | 'quiz' | 'interactive' | 'pbl';
}

interface ClassroomState {
  // Stage/scene
  scenes: Scene[];
  currentSceneIndex: number;

  // Playback
  engineMode: EngineMode;
  playbackCompleted: boolean;

  // Speech
  lectureSpeech: string | null;
  liveSpeech: string | null;
  speakingAgentId: string | null;
  thinkingState: { stage: string; agentId?: string } | null;
  speechProgress: number | null;

  // UI layout
  sidebarCollapsed: boolean;
  chatAreaCollapsed: boolean;
  sidebarWidth: number;
  chatAreaWidth: number;

  // Discussion
  isStreaming: boolean;
  isTopicPending: boolean;
  isDiscussionPaused: boolean;

  // Actions - Scene
  setScenes: (scenes: Scene[]) => void;
  setCurrentSceneIndex: (index: number) => void;
  goToNextScene: () => void;
  goToPrevScene: () => void;

  // Actions - Playback
  setEngineMode: (mode: EngineMode) => void;
  setPlaybackCompleted: (completed: boolean) => void;

  // Actions - Speech
  setLectureSpeech: (text: string | null) => void;
  setLiveSpeech: (text: string | null) => void;
  setSpeakingAgentId: (id: string | null) => void;
  setThinkingState: (state: { stage: string; agentId?: string } | null) => void;
  setSpeechProgress: (progress: number | null) => void;

  // Actions - Layout
  toggleSidebar: () => void;
  toggleChatArea: () => void;
  setSidebarWidth: (width: number) => void;
  setChatAreaWidth: (width: number) => void;

  // Actions - Discussion
  setIsStreaming: (streaming: boolean) => void;
  setIsTopicPending: (pending: boolean) => void;
  setIsDiscussionPaused: (paused: boolean) => void;
}

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  // Scene
  scenes: [],
  currentSceneIndex: 0,

  // Playback
  engineMode: 'idle',
  playbackCompleted: false,

  // Speech
  lectureSpeech: null,
  liveSpeech: null,
  speakingAgentId: null,
  thinkingState: null,
  speechProgress: null,

  // Layout
  sidebarCollapsed: false,
  chatAreaCollapsed: false,
  sidebarWidth: 220,
  chatAreaWidth: 340,

  // Discussion
  isStreaming: false,
  isTopicPending: false,
  isDiscussionPaused: false,

  // Actions - Scene
  setScenes: (scenes) => set({ scenes }),
  setCurrentSceneIndex: (index) => set({ currentSceneIndex: index }),
  goToNextScene: () => {
    const { currentSceneIndex, scenes } = get();
    if (currentSceneIndex < scenes.length - 1) {
      set({ currentSceneIndex: currentSceneIndex + 1 });
    }
  },
  goToPrevScene: () => {
    const { currentSceneIndex } = get();
    if (currentSceneIndex > 0) {
      set({ currentSceneIndex: currentSceneIndex - 1 });
    }
  },

  // Actions - Playback
  setEngineMode: (mode) => set({ engineMode: mode }),
  setPlaybackCompleted: (completed) => set({ playbackCompleted: completed }),

  // Actions - Speech
  setLectureSpeech: (text) => set({ lectureSpeech: text }),
  setLiveSpeech: (text) => set({ liveSpeech: text }),
  setSpeakingAgentId: (id) => set({ speakingAgentId: id }),
  setThinkingState: (state) => set({ thinkingState: state }),
  setSpeechProgress: (progress) => set({ speechProgress: progress }),

  // Actions - Layout
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleChatArea: () => set((s) => ({ chatAreaCollapsed: !s.chatAreaCollapsed })),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(160, Math.min(320, width)) }),
  setChatAreaWidth: (width) => set({ chatAreaWidth: Math.max(280, Math.min(480, width)) }),

  // Actions - Discussion
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setIsTopicPending: (pending) => set({ isTopicPending: pending }),
  setIsDiscussionPaused: (paused) => set({ isDiscussionPaused: paused }),
}));
