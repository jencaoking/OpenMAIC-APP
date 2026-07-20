import { create } from 'zustand';
import type { SceneOutline } from '../api/generationApi';

export type GenerationStep =
  | 'idle'
  | 'outline'
  | 'review'
  | 'generating-content'
  | 'generating-actions'
  | 'generating-tts'
  | 'complete'
  | 'error';

interface GenerationState {
  // 输入
  requirement: string;
  pdfText: string;

  // 生成状态
  step: GenerationStep;
  progress: number; // 0-1
  error: string | null;

  // 大纲
  outlines: SceneOutline[];
  languageDirective: string;
  courseTitle: string;

  // 当前生成的场景索引
  currentGeneratingIndex: number;
  totalToGenerate: number;

  // Actions
  setRequirement: (text: string) => void;
  setPdfText: (text: string) => void;
  setStep: (step: GenerationStep) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setOutlines: (outlines: SceneOutline[]) => void;
  addOutline: (outline: SceneOutline) => void;
  setLanguageDirective: (directive: string) => void;
  setCourseTitle: (title: string) => void;
  setCurrentGeneratingIndex: (index: number) => void;
  setTotalToGenerate: (total: number) => void;
  reset: () => void;
}

const initialState = {
  requirement: '',
  pdfText: '',
  step: 'idle' as GenerationStep,
  progress: 0,
  error: null,
  outlines: [],
  languageDirective: '',
  courseTitle: '',
  currentGeneratingIndex: 0,
  totalToGenerate: 0,
};

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initialState,

  setRequirement: (text) => set({ requirement: text }),
  setPdfText: (text) => set({ pdfText: text }),
  setStep: (step) => set({ step }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setOutlines: (outlines) => set({ outlines }),
  addOutline: (outline) => set((s) => ({ outlines: [...s.outlines, outline] })),
  setLanguageDirective: (directive) => set({ languageDirective: directive }),
  setCourseTitle: (title) => set({ courseTitle: title }),
  setCurrentGeneratingIndex: (index) => set({ currentGeneratingIndex: index }),
  setTotalToGenerate: (total) => set({ totalToGenerate: total }),
  reset: () => set(initialState),
}));
