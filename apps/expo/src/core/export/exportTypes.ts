/**
 * Export Types for Mobile.
 *
 * Port of Web's lib/export/classroom-zip-types.ts.
 */

export const CLASSROOM_ZIP_FORMAT_VERSION = '1.0.0';
export const CLASSROOM_ZIP_EXTENSION = '.maic';

export interface ManifestStage {
  id: string;
  name: string;
  description?: string;
  scenes: ManifestScene[];
  agents?: ManifestAgent[];
}

export interface ManifestScene {
  id: string;
  type: string;
  title?: string;
}

export interface ManifestAgent {
  id: string;
  name: string;
  role: string;
}

export interface MediaIndexEntry {
  id: string;
  type: 'image' | 'audio' | 'video';
  fileName: string;
  mimeType: string;
  size: number;
}

export interface ClassroomManifest {
  formatVersion: string;
  exportedAt: number;
  stage: ManifestStage;
  mediaIndex: MediaIndexEntry[];
}
