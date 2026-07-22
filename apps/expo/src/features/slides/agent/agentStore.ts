/**
 * Agent Store for Mobile.
 *
 * Manages agent state: messages, tool calls, loading status.
 */

import { create } from 'zustand';
import type {
  AgentMessage,
  AgentToolCall,
  AgentToolResult,
  AgentSessionStatus,
  AgentConfig,
  AgentToolName,
} from './agentTypes';
import { streamAgentResponse } from './agentClient';

interface AgentState {
  /** Current session messages */
  messages: AgentMessage[];
  /** Session status */
  status: AgentSessionStatus;
  /** Error message */
  error: string | null;
  /** Agent config */
  config: AgentConfig | null;
  /** Server base URL */
  serverBaseUrl: string;

  // Actions
  setConfig: (config: AgentConfig) => void;
  setServerBaseUrl: (url: string) => void;
  addMessage: (message: AgentMessage) => void;
  updateLastMessage: (content: string) => void;
  setStatus: (status: AgentSessionStatus) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;

  // Agent interaction
  sendMessage: (text: string, sceneContext: Record<string, unknown>) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  messages: [],
  status: 'idle',
  error: null,
  config: null,
  serverBaseUrl: '',

  setConfig: (config) => set({ config }),
  setServerBaseUrl: (url) => set({ serverBaseUrl: url }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, content };
      }
      return { messages };
    }),

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], status: 'idle', error: null }),

  sendMessage: async (text, sceneContext) => {
    const { config, serverBaseUrl, messages, addMessage, setStatus, setError } = get();

    if (!config) {
      setError('Agent not configured');
      return;
    }

    // Add user message
    const userMessage: AgentMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Start streaming
    setStatus('thinking');
    setError(null);

    try {
      // Prepare message history for API
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Create assistant message placeholder
      const assistantMsg: AgentMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        toolCalls: [],
        toolResults: [],
      };
      addMessage(assistantMsg);

      // Stream response
      let fullContent = '';
      const toolCalls: AgentToolCall[] = [];

      for await (const event of streamAgentResponse(
        config,
        apiMessages,
        sceneContext,
        serverBaseUrl,
      )) {
        switch (event.type) {
          case 'text_delta':
            fullContent += (event.data as { text?: string }).text || '';
            // Update last message content
            set((state) => {
              const msgs = [...state.messages];
              const last = msgs[msgs.length - 1];
              if (last && last.role === 'assistant') {
                msgs[msgs.length - 1] = { ...last, content: fullContent };
              }
              return { messages: msgs };
            });
            break;

          case 'tool_call_start': {
            const td = event.data as {
              id?: string;
              name?: string;
              arguments?: Record<string, unknown>;
            };
            toolCalls.push({
              id: td.id || `tc_${Date.now()}`,
              name: (td.name || '') as AgentToolName,
              arguments: td.arguments || {},
            });
            setStatus('executing');
            break;
          }

          case 'tool_result': {
            const tr = event.data as {
              toolCallId?: string;
              content?: string;
              details?: Record<string, unknown>;
            };
            set((state) => {
              const msgs = [...state.messages];
              const last = msgs[msgs.length - 1];
              if (last && last.role === 'assistant') {
                const results = last.toolResults || [];
                msgs[msgs.length - 1] = {
                  ...last,
                  toolResults: [
                    ...results,
                    {
                      toolCallId: tr.toolCallId || '',
                      content: tr.content || '',
                      details: tr.details,
                    },
                  ],
                };
              }
              return { messages: msgs };
            });
            break;
          }

          case 'error':
            setError((event.data as { message?: string }).message || 'Unknown error');
            break;

          case 'done':
            break;
        }
      }

      // Update final message with tool calls
      set((state) => {
        const msgs = [...state.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, toolCalls, content: fullContent || last.content };
        }
        return { messages: msgs, status: 'idle' };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStatus('error');
    }
  },
}));
