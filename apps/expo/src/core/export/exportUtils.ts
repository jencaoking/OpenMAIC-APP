/**
 * Export Utilities for Mobile.
 *
 * ZIP creation logic using jszip.
 * Uses expo-file-system for file operations.
 */

import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import { Linking, Platform } from 'react-native';
import type {
  ClassroomManifest,
  MediaIndexEntry,
} from './exportTypes';
import { CLASSROOM_ZIP_FORMAT_VERSION, CLASSROOM_ZIP_EXTENSION } from './exportTypes';

/**
 * Create a classroom ZIP file.
 */
export async function createClassroomZip(params: {
  stageId: string;
  stageName: string;
  scenes: Array<{ id: string; type: string; title?: string; data: unknown }>;
  mediaFiles?: Array<{ id: string; type: string; uri: string; mimeType: string }>;
}): Promise<string> {
  const { stageId, stageName, scenes, mediaFiles = [] } = params;

  const zip = new JSZip();

  // 1. Create manifest
  const manifest: ClassroomManifest = {
    formatVersion: CLASSROOM_ZIP_FORMAT_VERSION,
    exportedAt: Date.now(),
    stage: {
      id: stageId,
      name: stageName,
      scenes: scenes.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
      })),
    },
    mediaIndex: [],
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // 2. Add scene data
  const scenesFolder = zip.folder('scenes');
  if (scenesFolder) {
    scenesFolder.file('data.json', JSON.stringify(scenes, null, 2));
  }

  // 3. Add media files
  const mediaIndex: MediaIndexEntry[] = [];
  const mediaFolder = zip.folder('media');

  for (const media of mediaFiles) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(media.uri);
      if (fileInfo.exists) {
        const base64 = await FileSystem.readAsStringAsync(media.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const extension = media.mimeType.split('/')[1] || 'bin';
        const fileName = `${media.id}.${extension}`;
        mediaFolder?.file(fileName, base64, { base64: true });

        mediaIndex.push({
          id: media.id,
          type: media.type as 'image' | 'audio' | 'video',
          fileName,
          mimeType: media.mimeType,
          size: fileInfo.size || 0,
        });
      }
    } catch (err) {
      console.warn(`Failed to add media ${media.id}:`, err);
    }
  }

  // Update manifest with media index
  manifest.mediaIndex = mediaIndex;
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // 4. Generate ZIP
  const zipBase64 = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // 5. Write to temp file
  const fileName = `${stageName.replace(/[^a-zA-Z0-9]/g, '_')}${CLASSROOM_ZIP_EXTENSION}`;
  const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).default?.cacheDirectory || '';
  const tempUri = `${cacheDir}${fileName}`;

  await FileSystem.writeAsStringAsync(tempUri, zipBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return tempUri;
}

/**
 * Open the exported ZIP file (triggers system share sheet on iOS/Android).
 */
export async function shareClassroomZip(fileUri: string): Promise<boolean> {
  try {
    await Linking.openURL(fileUri);
    return true;
  } catch (err) {
    console.warn('Failed to open file:', err);
    return false;
  }
}

/**
 * Export and share a classroom in one step.
 */
export async function exportAndShareClassroom(params: {
  stageId: string;
  stageName: string;
  scenes: Array<{ id: string; type: string; title?: string; data: unknown }>;
  mediaFiles?: Array<{ id: string; type: string; uri: string; mimeType: string }>;
}): Promise<void> {
  const fileUri = await createClassroomZip(params);
  await shareClassroomZip(fileUri);

  // Clean up temp file
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch {
    // Best effort cleanup
  }
}
