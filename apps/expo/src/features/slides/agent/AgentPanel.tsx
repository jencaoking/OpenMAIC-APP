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
  ActivityIndicator,
} from 'react-native';
import type { AgentMessage, AgentToolName } from './agentTypes';
import { useAgentStore } from './agentStore';
import { EditElementsUI } from './toolUIs/EditElementsUI';
import { RegenerateUI } from './toolUIs/RegenerateUI';
import { ReadContentUI } from './toolUIs/ReadContentUI';

interface AgentPanelProps {
  sceneId: string;
  sceneContext: Record<string, unknown>;
  visible: boolean;
  onClose: () => void;
}

/**
 * Agent Panel - "Edit with AI" sidebar.
 *
 * Port of Web's AgentPanel component.
 * Custom RN implementation (can't use @assistant-ui/react).
 */
export function AgentPanel({ sceneId, sceneContext, visible, onClose }: AgentPanelProps) {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, status, error, sendMessage, clearMessages } = useAgentStore();

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleSubmit = () => {
    if (!input.trim() || status === 'thinking' || status === 'executing') return;
    sendMessage(input.trim(), sceneContext);
    setInput('');
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit with AI</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={clearMessages} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Edit with AI</Text>
            <Text style={styles.emptySubtitle}>
              Ask me to edit slides, regenerate content, or fix interactive HTML.
            </Text>
          </View>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {status === 'thinking' && (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color="#7c3aed" />
            <Text style={styles.thinkingText}>Thinking...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask AI to edit..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={4000}
          editable={status === 'idle'}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || status !== 'idle') && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!input.trim() || status !== 'idle'}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      {isUser ? (
        <Text style={styles.userText}>{message.content}</Text>
      ) : (
        <View>
          {message.content ? (
            <Text style={styles.assistantText}>{message.content}</Text>
          ) : null}

          {/* Tool calls */}
          {message.toolCalls?.map((tc) => (
            <ToolCard key={tc.id} toolName={tc.name} args={tc.arguments} />
          ))}

          {/* Tool results */}
          {message.toolResults?.map((tr) => (
            <ToolResultCard key={tr.toolCallId} result={tr} />
          ))}
        </View>
      )}
    </View>
  );
}

function ToolCard({ toolName, args }: { toolName: string; args: Record<string, unknown> }) {
  switch (toolName) {
    case 'edit_elements':
      return <EditElementsUI args={args} isLoading />;
    case 'regenerate_scene':
    case 'regenerate_scene_actions':
      return <RegenerateUI args={args} isLoading />;
    case 'read_scene_content':
      return <ReadContentUI args={args} isLoading />;
    default:
      return (
        <View style={styles.toolCard}>
          <Text style={styles.toolName}>{toolName}</Text>
        </View>
      );
  }
}

function ToolResultCard({ result }: { result: { content: string; details?: Record<string, unknown> } }) {
  return (
    <View style={styles.toolResult}>
      <Text style={styles.toolResultText} numberOfLines={3}>
        {result.content || 'Done'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 13,
    color: '#7c3aed',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  messageBubble: {
    maxWidth: '90%',
    padding: 10,
    borderRadius: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
    maxWidth: '100%',
  },
  userText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
  assistantText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  thinkingText: {
    fontSize: 13,
    color: '#7c3aed',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  toolCard: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toolName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  toolResult: {
    marginTop: 4,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  toolResultText: {
    fontSize: 12,
    color: '#166534',
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
