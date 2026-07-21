/**
 * Interactive Scene Types for Mobile.
 *
 * Port of Web's lib/types/stage.ts InteractiveContent.
 */

/**
 * Widget types for interactive scenes
 */
export type WidgetType = 'calculator' | 'timer' | 'quiz' | 'chart' | 'custom';

/**
 * Widget configuration
 */
export interface WidgetConfig {
  [key: string]: unknown;
}

/**
 * Interactive content - Interactive web page (iframe/WebView).
 *
 * Contains either a URL or inline HTML to render in a sandboxed WebView.
 */
export interface InteractiveContent {
  type: 'interactive';
  /** URL of the interactive page */
  url: string;
  /** Optional embedded HTML content */
  html?: string;
  /** Widget type for Ultra Mode */
  widgetType?: WidgetType;
  /** Widget configuration */
  widgetConfig?: WidgetConfig;
}
