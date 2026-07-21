/**
 * Video Export Hook for Mobile.
 *
 * React hook for triggering video export.
 */

import { useState, useCallback } from 'react';
import {
  startVideoExport,
  waitForVideoExport,
  downloadVideo,
} from './videoExportClient';
import type {
  VideoExportConfig,
  VideoExportRequest,
  VideoExportProgress,
  VideoExportResult,
} from './videoExportTypes';

interface UseExportVideoReturn {
  /** Current export progress */
  progress: VideoExportProgress | null;
  /** Whether export is in progress */
  exporting: boolean;
  /** Start video export */
  exportVideo: (
    config: VideoExportConfig,
    request: VideoExportRequest,
  ) => Promise<VideoExportResult>;
  /** Download exported video */
  downloadExportedVideo: (url: string, filename: string) => Promise<string>;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for video export.
 *
 * Usage:
 * ```tsx
 * const { exporting, progress, exportVideo } = useExportVideo();
 *
 * // Export video
 * const result = await exportVideo(
 *   { serverBaseUrl: 'https://openmaic.dev' },
 *   { stageId: '123', stageName: 'My Classroom', scenes: [...] }
 * );
 * ```
 */
export function useExportVideo(): UseExportVideoReturn {
  const [progress, setProgress] = useState<VideoExportProgress | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportVideo = useCallback(
    async (config: VideoExportConfig, request: VideoExportRequest) => {
      setExporting(true);
      setProgress({ status: 'processing', progress: 0 });

      try {
        // Start export
        const { jobId } = await startVideoExport(config, request);
        setProgress({ status: 'processing', progress: 10, message: 'Export started' });

        // Poll until complete
        const result = await waitForVideoExport(config, jobId, (p) => {
          setProgress(p);
        });

        setProgress({ status: 'completed', progress: 100, result });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setProgress({ status: 'failed', progress: 0, error: message });
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [],
  );

  const downloadExportedVideo = useCallback(
    async (url: string, filename: string) => {
      return await downloadVideo(url, filename);
    },
    [],
  );

  const reset = useCallback(() => {
    setProgress(null);
    setExporting(false);
  }, []);

  return {
    progress,
    exporting,
    exportVideo,
    downloadExportedVideo,
    reset,
  };
}
