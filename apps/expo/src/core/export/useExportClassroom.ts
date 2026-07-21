/**
 * Export Classroom Hook for Mobile.
 *
 * React hook for triggering classroom export.
 */

import { useState, useCallback } from 'react';
import { exportAndShareClassroom, createClassroomZip, shareClassroomZip } from './exportUtils';

interface UseExportClassroomReturn {
  exporting: boolean;
  exportAndShare: (params: {
    stageId: string;
    stageName: string;
    scenes: Array<{ id: string; type: string; title?: string; data: unknown }>;
    mediaFiles?: Array<{ id: string; type: string; uri: string; mimeType: string }>;
  }) => Promise<void>;
  exportToFile: (params: {
    stageId: string;
    stageName: string;
    scenes: Array<{ id: string; type: string; title?: string; data: unknown }>;
    mediaFiles?: Array<{ id: string; type: string; uri: string; mimeType: string }>;
  }) => Promise<string>;
  shareFile: (fileUri: string) => Promise<boolean>;
}

/**
 * Hook for classroom export.
 *
 * Usage:
 * ```tsx
 * const { exporting, exportAndShare } = useExportClassroom();
 *
 * // Export and share
 * await exportAndShare({
 *   stageId: '123',
 *   stageName: 'My Classroom',
 *   scenes: [...],
 *   mediaFiles: [...],
 * });
 * ```
 */
export function useExportClassroom(): UseExportClassroomReturn {
  const [exporting, setExporting] = useState(false);

  const exportAndShare = useCallback(async (params: {
    stageId: string;
    stageName: string;
    scenes: Array<{ id: string; type: string; title?: string; data: unknown }>;
    mediaFiles?: Array<{ id: string; type: string; uri: string; mimeType: string }>;
  }) => {
    setExporting(true);
    try {
      await exportAndShareClassroom(params);
    } finally {
      setExporting(false);
    }
  }, []);

  const exportToFile = useCallback(async (params: {
    stageId: string;
    stageName: string;
    scenes: Array<{ id: string; type: string; title?: string; data: unknown }>;
    mediaFiles?: Array<{ id: string; type: string; uri: string; mimeType: string }>;
  }) => {
    setExporting(true);
    try {
      return await createClassroomZip(params);
    } finally {
      setExporting(false);
    }
  }, []);

  const shareFile = useCallback(async (fileUri: string) => {
    return await shareClassroomZip(fileUri);
  }, []);

  return {
    exporting,
    exportAndShare,
    exportToFile,
    shareFile,
  };
}
