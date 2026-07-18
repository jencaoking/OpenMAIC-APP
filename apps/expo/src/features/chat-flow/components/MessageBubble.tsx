import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { DslMarkdown } from './DslMarkdown';
import type { IMessage, ImageAttachment } from '../../types';

export type { IMessage as Message } from '../../types';

interface MessageBubbleProps {
  message: IMessage;
}

/**
 * 渲染消息内的图片附件网格。
 * - 1 张：大图铺满
 * - 2-4 张：2 列网格
 * - 5+ 张：3 列网格，最多显示 6 张，超出显示 +N
 */
const AttachmentGrid: React.FC<{ attachments: ImageAttachment[] }> = ({ attachments }) => {
  const windowWidth = Dimensions.get('window').width;
  const bubbleMaxWidth = Math.min(windowWidth * 0.75, 360);
  const count = attachments.length;

  if (count === 1) {
    const img = attachments[0];
    const ratio = img.height > 0 ? img.width / img.height : 1;
    const displayWidth = bubbleMaxWidth;
    const displayHeight = displayWidth / ratio;
    return (
      <Image
        source={{ uri: img.localUri }}
        style={[styles.singleImage, { width: displayWidth, height: displayHeight }]}
        resizeMode="cover"
        accessibilityLabel="用户上传的图片"
      />
    );
  }

  const columns = count <= 4 ? 2 : 3;
  const gap = 4;
  const cellSize = (bubbleMaxWidth - gap * (columns - 1)) / columns;
  const visible = attachments.slice(0, 6);

  return (
    <View style={[styles.gridContainer, { width: bubbleMaxWidth }]}>
      {visible.map((img, idx) => {
        const isLast = idx === 5 && count > 6;
        return (
          <View key={img.id} style={[styles.gridCell, { width: cellSize, height: cellSize }]}>
            <Image
              source={{ uri: img.localUri }}
              style={styles.gridImage}
              resizeMode="cover"
              accessibilityLabel={`图片 ${idx + 1}`}
            />
            {isLast && (
              <View style={styles.gridOverlay}>
                <Text style={styles.gridOverlayText}>+{count - 6}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasText = message.content && message.content.length > 0;

  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {hasAttachments && (
          <View style={styles.attachmentsWrap}>
            <AttachmentGrid attachments={message.attachments!} />
          </View>
        )}
        {hasText &&
          (isUser ? (
            <Text style={styles.userText}>{message.content}</Text>
          ) : (
            <DslMarkdown content={message.content} />
          ))}
        {message.streaming && (
          <Text style={styles.cursor}>▌</Text>
        )}
      </View>
      {message.timestamp && (
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentsWrap: {
    marginBottom: 8,
  },
  singleImage: {
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridCell: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlayText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  cursor: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    marginHorizontal: 4,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#9ca3af',
  },
  assistantTimestamp: {
    color: '#9ca3af',
  },
});
