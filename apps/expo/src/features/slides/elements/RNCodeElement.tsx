import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { PPTCodeElement } from '@openmaic/dsl';
import { getCodeHighlightHtml } from './code-highlight-html';

interface RNCodeElementProps {
  element: PPTCodeElement;
}

/**
 * Code element renderer with Shiki syntax highlighting.
 *
 * Uses a WebView to run Shiki WASM (same as Web side) for 1:1 fidelity.
 * Renders the complete code block UI (header with dots, file name, language badge,
 * line numbers, highlighted code) inside the WebView.
 */
export function RNCodeElement({ element }: RNCodeElementProps) {
  const webViewRef = useRef<WebView>(null);
  const isReady = useRef(false);
  const pendingInit = useRef(true);

  const { language, lines, fileName, showLineNumbers = true, fontSize = 14 } = element;

  // Send message to WebView
  const sendToWebView = useCallback((message: Record<string, unknown>) => {
    if (!webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify(message));
  }, []);

  // Handle messages from WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'ready') {
        isReady.current = true;
        pendingInit.current = false;
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Send initial config when WebView is ready
  useEffect(() => {
    if (!isReady.current) return;
    sendToWebView({
      type: 'init',
      language: language || 'text',
      lines: lines || [],
      showLineNumbers,
      fontSize,
      fileName: fileName || '',
    });
  }, [isReady.current, language, lines, showLineNumbers, fontSize, fileName, sendToWebView]);

  // Sync language changes
  useEffect(() => {
    if (!isReady.current) return;
    sendToWebView({ type: 'language', language: language || 'text' });
  }, [language, sendToWebView]);

  // Sync line changes
  useEffect(() => {
    if (!isReady.current) return;
    sendToWebView({ type: 'lines', lines: lines || [] });
  }, [lines, sendToWebView]);

  const html = getCodeHighlightHtml();

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef as any}
        style={styles.webview}
        source={{ html, baseUrl: '' }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
