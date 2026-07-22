import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { PBLChatMessage, PBLIssue } from './pblTypes';

interface PBLChatProps {
  messages: PBLChatMessage[];
  currentIssue: PBLIssue | null;
  userRole: string;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

/**
 * PBL Chat panel.
 *
 * Port of Web's ChatPanel component.
 * Chat interface with message list and input.
 */
export function PBLChat({
  messages,
  currentIssue,
  userRole,
  isLoading,
  onSendMessage,
}: PBLChatProps) {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isUser={msg.agent_name === userRole} />
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Agent 正在思考...</Text>
          </View>
        )}
      </ScrollView>

      {/* Current Issue Banner */}
      {currentIssue && (
        <View style={styles.issueBanner}>
          <Text style={styles.issueBannerText} numberOfLines={1}>
            当前任务: {currentIssue.title}
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="输入消息..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={2000}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, isUser }: { message: PBLChatMessage; isUser: boolean }) {
  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.agentBubble]}>
      {!isUser && <Text style={styles.agentName}>{message.agent_name}</Text>}
      <Text style={[styles.messageText, isUser ? styles.userText : styles.agentText]}>
        {message.message}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  agentName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  agentText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  issueBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f3ff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  issueBannerText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
