/**
 * @file ImagePreviewBar.tsx
 * @description 输入框上方的待发送图片缩略图横滑列表。
 *
 * - 显示已选中的 ImageAttachment 缩略图
 * - 每张图右上角带删除按钮
 * - 点击缩略图可全屏预览（点击遮罩关闭）
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import type { ImageAttachment } from '../../../types';

export interface ImagePreviewBarProps {
  attachments: ImageAttachment[];
  onRemove: (id: string) => void;
}

const THUMBNAIL_SIZE = 72;

/**
 * 待发送图片预览条。
 */
export const ImagePreviewBar: React.FC<ImagePreviewBarProps> = ({ attachments, onRemove }) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={styles.thumbWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPreviewUri(attachment.localUri)}
              accessibilityLabel={`预览图片 ${attachment.id}`}
            >
              <Image
                source={{ uri: attachment.localUri }}
                style={styles.thumb}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(attachment.id)}
              accessibilityLabel="移除图片"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.sizeLabel}>{formatSize(attachment.byteSize)}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={previewUri !== null} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseArea}
            activeOpacity={1}
            onPress={() => setPreviewUri(null)}
          >
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

/**
 * 格式化字节为可读字符串。
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  scroll: {
    gap: 8,
  },
  thumbWrap: {
    position: 'relative',
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumb: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  sizeLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    color: '#ffffff',
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  previewCloseArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
});
