import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { MessageBubble } from './components/MessageBubble';
import { AttachmentPanel } from './components/AttachmentPanel';
import { ImagePreviewBar } from './components/ImagePreviewBar';
import { VoiceModeScreen } from './VoiceModeScreen';
import { VisionMessageBuilder } from '../../core/media';
import type { IMessage, ImageAttachment, VoiceEngineConfig } from '../../types';

interface SessionChatScreenProps {
  sessionId: string;
}

/**
 * 默认语音引擎配置。
 * 实际部署时应通过环境变量注入：
 *   - EXPO_PUBLIC_STT_WS_URL
 *   - EXPO_PUBLIC_TTS_URL
 *   - EXPO_PUBLIC_LLM_STREAM_URL
 */
const VOICE_CONFIG: VoiceEngineConfig = {
  sttWsUrl: process.env.EXPO_PUBLIC_STT_WS_URL ?? '',
  ttsUrl: process.env.EXPO_PUBLIC_TTS_URL ?? '',
  llmStreamUrl: process.env.EXPO_PUBLIC_LLM_STREAM_URL ?? '',
  authToken: undefined,
  vadThreshold: 0.18,
  vadConsecutiveFrames: 6,
  ttsChunkSize: 80,
};

export const SessionChatScreen: React.FC<SessionChatScreenProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [pendingAttachments, setPendingAttachments] = useState<ImageAttachment[]>([]);
  const [attachmentPanelVisible, setAttachmentPanelVisible] = useState(false);
  const [voiceModeVisible, setVoiceModeVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const keyboardOffsetRef = useRef(0);
  const visionBuilderRef = useRef<VisionMessageBuilder>(
    new VisionMessageBuilder({ format: 'openmaic' }),
  );

  const maxInputHeight = 44 * 4;

  useEffect(() => {
    const welcomeMessage: IMessage = {
      id: '1',
      content:
        '欢迎来到 OpenMAIC！我是你的 AI 学习助手。请开始提问，我会为你提供详细的解答。\n\n**支持的功能：**\n- 📝 代码高亮展示\n- 📊 表格渲染\n- 📋 一键复制代码\n- 🎯 互动答题\n- 📷 拍照识题（点击 + 按钮）\n- 🎙️ 语音对话（点击右下角麦克风）',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardOffsetRef.current = e.endCoordinates.height;
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      keyboardOffsetRef.current = 0;
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isStreaming]);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    const hasText = trimmed.length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if ((!hasText && !hasAttachments) || isStreaming) return;

    // 构造本地用户消息（立即显示）
    const userMessage = visionBuilderRef.current.buildLocalMessage(trimmed, pendingAttachments);
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setInputHeight(44);
    setPendingAttachments([]);
    setIsStreaming(true);
    setStreamingContent('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 构造后端请求体（即使后端未对接，也走一遍构造逻辑，便于未来接入）
    try {
      visionBuilderRef.current.buildRequest(trimmed, userMessage.attachments ?? [], sessionId);
    } catch {
      // 构造失败不阻断 UI 流程
    }

    // 后端未对接时的本地降级响应（与 Phase 5 保持一致的体验）
    const sampleResponses = [
      '这是一个很好的问题！让我为你详细解答。\n\n**关键点：**\n1. 首先理解问题的核心\n2. 分析可能的解决方案\n3. 选择最优方案\n\n```javascript\nfunction solveProblem(input) {\n  return input * 2;\n}\n```',
      '我来给你展示一个示例表格：\n\n| 功能 | 描述 | 状态 |\n|------|------|------|\n| 代码高亮 | 支持多种语言 | ✅ |\n| 表格渲染 | 自适应宽度 | ✅ |\n| 流式输出 | 实时显示 | ✅ |',
      '以下是一些重要的概念：\n\n- **概念一**：这是第一个概念的解释\n- **概念二**：这是第二个概念的解释\n- **概念三**：这是第三个概念的解释\n\n> 引用文本用于强调重要信息',
    ];

    const response = hasAttachments
      ? '我已经收到你上传的图片，让我仔细分析一下…\n\n**图片识别结果：**\n- 检测到内容：' +
        (userMessage.attachments?.[0]?.source === 'camera' ? '相机拍摄' : '相册图片') +
        '\n- 分辨率：' +
        (userMessage.attachments?.[0]?.width + 'x' + userMessage.attachments?.[0]?.height) +
        '\n- 大小：' +
        (userMessage.attachments?.[0]?.byteSize + ' bytes') +
        '\n\n请在后端接入 Vision 模型后获得真实解析结果。'
      : sampleResponses[Math.floor(Math.random() * sampleResponses.length)];

    let index = 0;
    const chunkSize = 5;

    const interval = setInterval(() => {
      if (index >= response.length) {
        clearInterval(interval);
        setIsStreaming(false);

        const assistantMessage: IMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
        return;
      }

      const endIndex = Math.min(index + chunkSize, response.length);
      setStreamingContent(response.substring(0, endIndex));
      index = endIndex;
    }, 30);
  }, [inputText, isStreaming, pendingAttachments, sessionId]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    const newHeight = Math.min(44 + text.split('\n').length * 20, maxInputHeight);
    setInputHeight(newHeight);
  };

  const handleAttachmentsSelected = (attachments: ImageAttachment[]) => {
    setPendingAttachments((prev) => [...prev, ...attachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const renderMessageItem = ({ item }: { item: IMessage }) => <MessageBubble message={item} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>会话 {sessionId}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {isStreaming && (
        <View style={styles.streamingContainer}>
          <MessageBubble
            message={{
              id: 'streaming',
              content: streamingContent,
              role: 'assistant',
              streaming: true,
            }}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputSection}
      >
        <ImagePreviewBar attachments={pendingAttachments} onRemove={handleRemoveAttachment} />

        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setAttachmentPanelVisible(true)}
            disabled={isStreaming}
            accessibilityLabel="添加附件"
          >
            <Text style={styles.attachBtnIcon}>+</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { height: inputHeight }]}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="输入消息..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            maxLength={2000}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendButton, isStreaming && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={(!inputText.trim() && pendingAttachments.length === 0) || isStreaming}
            accessibilityLabel="发送消息"
          >
            {isStreaming ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendButtonText}>发送</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 悬浮语音按钮 */}
      <TouchableOpacity
        style={styles.voiceFab}
        onPress={() => setVoiceModeVisible(true)}
        accessibilityLabel="进入语音对话模式"
        accessibilityRole="button"
      >
        <Text style={styles.voiceFabIcon}>🎙️</Text>
      </TouchableOpacity>

      <AttachmentPanel
        visible={attachmentPanelVisible}
        onClose={() => setAttachmentPanelVisible(false)}
        onAttachmentsSelected={handleAttachmentsSelected}
        maxSelection={4}
      />

      <VoiceModeScreen
        visible={voiceModeVisible}
        onClose={() => setVoiceModeVisible(false)}
        voiceConfig={VOICE_CONFIG}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  streamingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inputSection: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 8,
  },
  attachBtn: {
    width: 36,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
  },
  attachBtnIcon: {
    fontSize: 22,
    fontWeight: '300',
    color: '#374151',
    lineHeight: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  voiceFab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 96 : 72,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  voiceFabIcon: {
    fontSize: 24,
  },
});
