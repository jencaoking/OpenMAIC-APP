/**
 * Media Generation Store for Mobile.
 *
 * Port of Web's lib/store/media-generation.ts.
 * Manages media generation tasks state.
 */

import { create } from 'zustand';
import type { MediaTask, MediaTaskStatus, MediaGenerationRequest } from './mediaTypes';
import {
  generateImage,
  generateVideo,
  MediaApiError,
  aspectRatioToDimensions,
} from './mediaClient';

interface MediaGenerationState {
  /** All media tasks keyed by elementId */
  tasks: Record<string, MediaTask>;
  /** Stage ID for the current classroom */
  stageId: string;

  // Actions
  enqueueTasks: (stageId: string, requests: MediaGenerationRequest[]) => void;
  markGenerating: (elementId: string) => void;
  markDone: (elementId: string, url: string, poster?: string) => void;
  markFailed: (elementId: string, error: string, errorCode?: string) => void;
  markPendingForRetry: (elementId: string) => void;
  getTask: (elementId: string) => MediaTask | undefined;
  getTasksByStatus: (status: MediaTaskStatus) => MediaTask[];
  clearTasks: () => void;

  // Generation
  generateMedia: (
    request: MediaGenerationRequest,
    serverBaseUrl?: string,
    imageConfig?: { providerId: string; apiKey: string; baseUrl?: string; model?: string },
    videoConfig?: { providerId: string; apiKey: string; baseUrl?: string; model?: string },
  ) => Promise<void>;
  retryMedia: (elementId: string) => Promise<void>;
}

export const useMediaGenerationStore = create<MediaGenerationState>((set, get) => ({
  tasks: {},
  stageId: '',

  enqueueTasks: (stageId, requests) =>
    set((state) => {
      const newTasks = { ...state.tasks };
      for (const req of requests) {
        if (newTasks[req.elementId]) continue;
        newTasks[req.elementId] = {
          elementId: req.elementId,
          stageId,
          type: req.type,
          prompt: req.prompt,
          status: 'pending',
          params: {
            aspectRatio: req.aspectRatio,
            style: req.style,
          },
          createdAt: Date.now(),
        };
      }
      return { tasks: newTasks, stageId };
    }),

  markGenerating: (elementId) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [elementId]: {
          ...state.tasks[elementId],
          status: 'generating',
        },
      },
    })),

  markDone: (elementId, url, poster) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [elementId]: {
          ...state.tasks[elementId],
          status: 'done',
          url,
          poster,
        },
      },
    })),

  markFailed: (elementId, error, errorCode) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [elementId]: {
          ...state.tasks[elementId],
          status: 'failed',
          error,
          errorCode,
        },
      },
    })),

  markPendingForRetry: (elementId) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [elementId]: {
          ...state.tasks[elementId],
          status: 'pending',
          error: undefined,
          errorCode: undefined,
        },
      },
    })),

  getTask: (elementId) => get().tasks[elementId],

  getTasksByStatus: (status) => Object.values(get().tasks).filter((t) => t.status === status),

  clearTasks: () => set({ tasks: {}, stageId: '' }),

  generateMedia: async (request, serverBaseUrl, imageConfig, videoConfig) => {
    const { markGenerating, markDone, markFailed } = get();

    markGenerating(request.elementId);

    try {
      if (request.type === 'image') {
        if (!imageConfig) throw new Error('Image provider config required');
        const dims = request.aspectRatio
          ? aspectRatioToDimensions(request.aspectRatio)
          : { width: 1024, height: 1024 };

        const result = await generateImage(
          {
            providerId: imageConfig.providerId as any,
            apiKey: imageConfig.apiKey,
            baseUrl: imageConfig.baseUrl,
            model: imageConfig.model,
          },
          {
            prompt: request.prompt,
            width: dims.width,
            height: dims.height,
            aspectRatio: request.aspectRatio,
            style: request.style,
          },
          serverBaseUrl,
        );

        const url = result.url || (result.base64 ? `data:image/png;base64,${result.base64}` : '');
        if (!url) throw new Error('No image URL in response');

        markDone(request.elementId, url);
      } else {
        if (!videoConfig) throw new Error('Video provider config required');

        const result = await generateVideo(
          {
            providerId: videoConfig.providerId as any,
            apiKey: videoConfig.apiKey,
            baseUrl: videoConfig.baseUrl,
            model: videoConfig.model,
          },
          {
            prompt: request.prompt,
            aspectRatio: request.aspectRatio,
          },
          serverBaseUrl,
        );

        markDone(request.elementId, result.url, result.poster);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const errorCode = err instanceof MediaApiError ? err.errorCode : undefined;
      markFailed(request.elementId, message, errorCode);
    }
  },

  retryMedia: async (elementId) => {
    const { tasks, markPendingForRetry, generateMedia } = get();
    const task = tasks[elementId];
    if (!task || task.status !== 'failed') return;

    markPendingForRetry(elementId);

    await generateMedia({
      type: task.type,
      prompt: task.prompt,
      elementId: task.elementId,
      aspectRatio: task.params.aspectRatio as any,
      style: task.params.style,
    });
  },
}));
