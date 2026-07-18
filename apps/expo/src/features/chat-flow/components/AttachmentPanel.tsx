/**
 * @file AttachmentPanel.tsx
 * @description 输入框左侧"+"号附件面板。
 *
 * 提供"拍照"与"相册"两个入口。
 * 权限策略：仅在用户点击相应按钮时动态请求相机/相册权限，
 * 被拒绝时弹出引导提示，绝不崩溃。
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { ImageCompressor } from '../../core/media';
import type { ImageAttachment } from '../../types';

export interface AttachmentPanelProps {
  visible: boolean;
  onClose: () => void;
  onAttachmentsSelected: (attachments: ImageAttachment[]) => void;
  /** 单次最大选择数量，默认 4。 */
  maxSelection?: number;
}

/**
 * 附件选择面板。
 */
export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
  visible,
  onClose,
  onAttachmentsSelected,
  maxSelection = 4,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCamera = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        showPermissionAlert('相机', '请在系统设置中允许 OpenMAIC 访问相机以拍照识题。');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (result.canceled || result.assets.length === 0) return;

      const attachment = await ImageCompressor.compress(
        result.assets[0].uri,
        'camera',
        { maxDimension: 1080, quality: 0.8 },
      );
      onAttachmentsSelected([attachment]);
      onClose();
    } catch (error) {
      Alert.alert('拍照失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLibrary = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!libraryPermission.granted) {
        showPermissionAlert('相册', '请在系统设置中允许 OpenMAIC 访问相册以选择图片。');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxSelection,
        quality: 1,
      });
      if (result.canceled || result.assets.length === 0) return;

      const uris = result.assets.map((a) => a.uri);
      const attachments = await ImageCompressor.compressBatch(uris, 'library', {
        maxDimension: 1080,
        quality: 0.8,
      });
      if (attachments.length > 0) {
        onAttachmentsSelected(attachments);
        onClose();
      }
    } catch (error) {
      Alert.alert('选图失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.panel}>
              <View style={styles.handle} />
              <Text style={styles.title}>添加附件</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={handleCamera}
                  disabled={isProcessing}
                  accessibilityLabel="拍照"
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.optionEmoji}>📷</Text>
                  </View>
                  <Text style={styles.optionLabel}>拍照</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={handleLibrary}
                  disabled={isProcessing}
                  accessibilityLabel="从相册选择"
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.optionEmoji}>🖼️</Text>
                  </View>
                  <Text style={styles.optionLabel}>相册</Text>
                </TouchableOpacity>
              </View>
              {isProcessing && (
                <Text style={styles.processingHint}>正在压缩图像…</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/**
 * 权限被拒绝时的引导弹窗。
 */
function showPermissionAlert(feature: string, message: string): void {
  Alert.alert(
    `${feature}权限被拒绝`,
    message,
    [
      { text: '稍后', style: 'cancel' },
      { text: '去设置', onPress: () => Linking.openSettings() },
    ],
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
  },
  option: {
    alignItems: 'center',
    minWidth: 72,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  processingHint: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
