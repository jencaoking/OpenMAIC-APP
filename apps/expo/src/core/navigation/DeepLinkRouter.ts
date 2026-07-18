/**
 * @file DeepLinkRouter.ts
 * @description Deep Link 解析器。
 *
 * 支持的 URL 格式（与后端推送 payload 协议对齐）：
 *   - `openmaic://session/<sessionId>`         → chat 页面
 *   - `openmaic://quiz/<quizId>`                → quiz 页面
 *   - `openmaic://dsl/<stageId>`                → dsl 渲染页面
 *   - `openmaic://home`                          → 列表
 *
 * 同时接受推送 payload 中的 `route` 对象，直接转换为 `DeepLinkTarget`。
 */
import type { DeepLinkTarget, PushNotificationPayload } from '../../types';

/**
 * Deep Link 解析器。
 */
export class DeepLinkRouter {
  /**
   * 解析 URL 字符串为路由目标。
   * @returns 路由目标，解析失败返回 null。
   */
  static parse(url: string): DeepLinkTarget | null {
    if (!url || typeof url !== 'string') return null;

    try {
      const parsed = new URL(url);
      const host = parsed.host;
      const segments = parsed.pathname.split('/').filter(Boolean);

      switch (host) {
        case 'session':
        case 'sessions': {
          const sessionId = segments[0];
          if (!sessionId) return null;
          return { screen: 'chat', params: { sessionId } };
        }
        case 'quiz': {
          const quizId = segments[0];
          if (!quizId) return null;
          return { screen: 'quiz', params: { quizId } };
        }
        case 'dsl': {
          const stageId = segments[0];
          if (!stageId) return null;
          return { screen: 'dsl', params: { stageId } };
        }
        case 'home':
        case 'list':
          return { screen: 'list' };
        default:
          return null;
      }
    } catch {
      // 非 URL 字符串（如纯数字 ID）
      return null;
    }
  }

  /**
   * 从推送通知 payload 中提取路由目标。
   * 优先使用 payload.route 字段；否则尝试解析 summary 中嵌入的 URL。
   */
  static fromPayload(payload: PushNotificationPayload): DeepLinkTarget | null {
    if (payload.route) return payload.route;
    if (payload.summary) {
      const urlMatch = payload.summary.match(/openmaic:\/\/[^\s)]+/);
      if (urlMatch) return this.parse(urlMatch[0]);
    }
    if (payload.entityId) {
      // 根据 kind 推断目标页面
      switch (payload.kind) {
        case 'quiz-graded':
          return { screen: 'quiz', params: { quizId: payload.entityId } };
        case 'session-opened':
        case 'agent-message':
          return { screen: 'chat', params: { sessionId: payload.entityId } };
        default:
          return null;
      }
    }
    return null;
  }

  /**
   * 将路由目标反向编码为 URL 字符串。
   */
  static stringify(target: DeepLinkTarget): string {
    const params = target.params ?? {};
    switch (target.screen) {
      case 'chat':
        return `openmaic://session/${params.sessionId ?? ''}`;
      case 'quiz':
        return `openmaic://quiz/${params.quizId ?? ''}`;
      case 'dsl':
        return `openmaic://dsl/${params.stageId ?? ''}`;
      case 'list':
      default:
        return 'openmaic://home';
    }
  }
}
