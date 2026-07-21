/**
 * Media Generation Hook for Mobile.
 *
 * Provides a React interface for media generation.
 * Port of Web's media-orchestrator.ts usage patterns.
 */

import { useCallback, useMemo } from 'react';
import { useMediaGenerationStore } from './mediaStore';
import type {
  MediaGenerationRequest,
  MediaTask,
  MediaTaskStatus,
} from './mediaTypes';

interface UseMediaGenerationOptions {
  /** Server base URL (e.g. 'https://openmaic.dev') */
  serverBaseUrl?: string;
  /** Image provider configuration */
  imageConfig?: {
    providerId: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
  };
  /** Video provider configuration */
  videoConfig?: {
    providerId: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
  };
}

interface UseMediaGenerationReturn {
  /** Generate media for a single request */
  generateMedia: (request: MediaGenerationRequest) => Promise<void>;
  /** Retry a failed media task */
  retryMedia: (elementId: string) => Promise<void>;
  /** Get the status of a media task */
  getTask: (elementId: string) => MediaTask | undefined;
  /** Get all tasks with a specific status */
  getTasksByStatus: (status: MediaTaskStatus) => MediaTask[];
  /** Check if any task is generating */
  isGenerating: boolean;
  /** Get count of tasks by status */
  taskCounts: {
    pending: number;
    generating: number;
    done: number;
    failed: number;
  };
}

/**
 * Hook for media generation.
 *
 * Usage:
 * ```tsx
 * const { generateMedia, retryMedia, getTask } = useMediaGeneration({
 *   serverBaseUrl: 'https://openmaic.dev',
 *   imageConfig: { providerId: 'seedream', apiKey: '...' },
 * });
 *
 * // Generate an image
 * await generateMedia({
 *   type: 'image',
 *   prompt: 'A sunset over mountains',
 *   elementId: 'gen_img_1',
 *   aspectRatio: '16:9',
 * });
 * ```
 */
export function useMediaGeneration(
  options: UseMediaGenerationOptions = {},
): UseMediaGenerationReturn {
  const {
    generateMedia: storeGenerateMedia,
    retryMedia: storeRetryMedia,
    getTask: storeGetTask,
    getTasksByStatus: storeGetTasksByStatus,
  } = useMediaGenerationStore();

  const generateMedia = useCallback(
    async (request: MediaGenerationRequest) => {
      await storeGenerateMedia(
        request,
        options.serverBaseUrl,
        options.imageConfig,
        options.videoConfig,
      );
    },
    [storeGenerateMedia, options.serverBaseUrl, options.imageConfig, options.videoConfig],
  );

  const retryMedia = useCallback(
    async (elementId: string) => {
      await storeRetryMedia(elementId);
    },
    [storeRetryMedia],
  );

  const getTask = useCallback(
    (elementId: string) => storeGetTask(elementId),
    [storeGetTask],
  );

  const getTasksByStatus = useCallback(
    (status: MediaTaskStatus) => storeGetTasksByStatus(status),
    [storeGetTasksByStatus],
  );

  const allTasks = useMediaGenerationStore((s) => s.tasks);
  const taskCounts = useMemo(() => {
    const counts = { pending: 0, generating: 0, done: 0, failed: 0 };
    for (const task of Object.values(allTasks)) {
      counts[task.status]++;
    }
    return counts;
  }, [allTasks]);

  const isGenerating = taskCounts.generating > 0;

  return {
    generateMedia,
    retryMedia,
    getTask,
    getTasksByStatus,
    isGenerating,
    taskCounts,
  };
}
