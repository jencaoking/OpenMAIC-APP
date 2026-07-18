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
import { MessageBubble, type Message } from './components/MessageBubble';

interface SessionChatScreenProps {
  sessionId: string;
}

export const SessionChatScreen: React.FC<SessionChatScreenProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const flatListRef = useRef<FlatList>(null);
  const keyboardOffsetRef = useRef(0);

  const maxInputHeight = 44 * 4;

  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: '欢迎来到 OpenMAIC！我是你的 AI 学习助手。请开始提问，我会为你提供详细的解答。\n\n**支持的功能：**\n- 📝 代码高亮展示\n- 📊 表格渲染\n- 📋 一键复制代码\n- 🎯 互动答题',
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
    if (!inputText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setInputHeight(44);
    setIsStreaming(true);
    setStreamingContent('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const sampleResponses = [
      '这是一个很好的问题！让我为你详细解答。\n\n**关键点：**\n1. 首先理解问题的核心\n2. 分析可能的解决方案\n3. 选择最优方案\n\n```javascript\nfunction solveProblem(input) {\n  return input * 2;\n}\n```',
      '我来给你展示一个示例表格：\n\n| 功能 | 描述 | 状态 |\n|------|------|------|\n| 代码高亮 | 支持多种语言 | ✅ |\n| 表格渲染 | 自适应宽度 | ✅ |\n| 流式输出 | 实时显示 | ✅ |',
      '以下是一些重要的概念：\n\n- **概念一**：这是第一个概念的解释\n- **概念二**：这是第二个概念的解释\n- **概念三**：这是第三个概念的解释\n\n> 引用文本用于强调重要信息',
    ];

    const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];

    let index = 0;
    const chunkSize = 5;

    const interval = setInterval(() => {
      if (index >= response.length) {
        clearInterval(interval);
        setIsStreaming(false);

        const assistantMessage: Message = {
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

    return () => clearInterval(interval);
  }, [inputText, isStreaming]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    const newHeight = Math.min(44 + text.split('\n').length * 20, maxInputHeight);
    setInputHeight(newHeight);
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

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
              content: streamingContent + '▌',
              role: 'assistant',
            }}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
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
            disabled={!inputText.trim() || isStreaming}
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
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
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
});
