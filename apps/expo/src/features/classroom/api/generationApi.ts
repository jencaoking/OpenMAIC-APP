/**
 * 课堂生成 API 客户端。
 * 调用 Web 端的生成接口。
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface GenerationRequest {
  requirement: string;
  pdfText?: string;
  languageDirective?: string;
}

export interface SceneOutline {
  id: string;
  type: 'slide' | 'quiz' | 'interactive' | 'pbl';
  title: string;
  description: string;
  keyPoints: string[];
  order: number;
}

export interface GenerationResult {
  outlines: SceneOutline[];
  languageDirective: string;
  courseTitle: string;
}

/**
 * 调用场景大纲生成接口 (SSE 流式)
 */
export async function generateSceneOutlines(
  request: GenerationRequest,
  onOutline: (outline: SceneOutline) => void,
  onDone: (result: GenerationResult) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/generate/scene-outlines-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement: request.requirement,
        pdfText: request.pdfText || '',
        languageDirective: request.languageDirective || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);
            if (event.type === 'outline') {
              onOutline(event.data);
            } else if (event.type === 'done') {
              onDone({
                outlines: event.data.outlines || [],
                languageDirective: event.data.languageDirective || '',
                courseTitle: event.data.courseTitle || '',
              });
            } else if (event.type === 'error') {
              throw new Error(event.message || 'Generation failed');
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue; // Skip malformed JSON
            throw e;
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 调用场景内容生成接口
 */
export async function generateSceneContent(outline: SceneOutline): Promise<any> {
  const response = await fetch(`${API_BASE}/api/generate/scene-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outline }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 调用场景动作生成接口
 */
export async function generateSceneActions(outline: SceneOutline, content: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/generate/scene-actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outline, content }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 调用 TTS 生成接口
 */
export async function generateTTS(text: string, voice?: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/generate/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.audioUrl || result.base64;
}

/**
 * 调用课堂保存接口
 */
export async function saveClassroom(stage: any, scenes: any[]): Promise<void> {
  const response = await fetch(`${API_BASE}/api/classroom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage, scenes }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

/**
 * 调用课堂加载接口
 */
export async function loadClassroom(stageId: string): Promise<{ stage: any; scenes: any[] }> {
  const response = await fetch(`${API_BASE}/api/classroom?id=${stageId}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
