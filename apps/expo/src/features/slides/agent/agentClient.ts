/**
 * Agent Client for Mobile.
 *
 * Calls the same API endpoint as Web: /api/agent/edit
 * Handles SSE streaming for agent responses.
 */

import type { AgentEvent, AgentConfig, AgentMessage } from './agentTypes';

/**
 * Send a message to the agent and receive streaming events.
 */
export async function* streamAgentResponse(
  config: AgentConfig,
  messages: Array<{ role: string; content: string }>,
  sceneContext: Record<string, unknown>,
  serverBaseUrl: string = '',
): AsyncGenerator<AgentEvent, void, unknown> {
  const url = `${serverBaseUrl}/api/agent/edit`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      sceneContext,
      config: {
        providerId: config.providerId,
        modelId: config.modelId,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Agent API error (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process SSE events
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const event = JSON.parse(data) as AgentEvent;
          yield event;
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}

/**
 * Send a non-streaming message to the agent.
 */
export async function sendAgentMessage(
  config: AgentConfig,
  messages: Array<{ role: string; content: string }>,
  sceneContext: Record<string, unknown>,
  serverBaseUrl: string = '',
): Promise<{ text: string; toolCalls: unknown[] }> {
  const url = `${serverBaseUrl}/api/agent/edit`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      sceneContext,
      config: {
        providerId: config.providerId,
        modelId: config.modelId,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Agent API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    text: data.text || '',
    toolCalls: data.toolCalls || [],
  };
}
