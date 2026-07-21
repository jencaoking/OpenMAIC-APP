import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { InteractiveContent } from '../interactiveTypes';
import { patchHtmlForIframe } from './interactivePatch';

interface RNInteractiveSceneProps {
  element: InteractiveContent;
}

/**
 * Interactive scene renderer for Mobile.
 *
 * Port of Web's InteractiveRenderer + InteractiveIframeHost.
 * Uses react-native-webview to render interactive HTML content.
 *
 * Features:
 * - Renders HTML via source={{ html }} or source={{ uri }}
 * - Storage shim (in-memory localStorage/sessionStorage)
 * - Error capture shim (postMessage to parent)
 * - CSS patches (proper sizing/scrolling)
 * - Sandboxed execution (no access to parent)
 */
export function RNInteractiveScene({ element }: RNInteractiveSceneProps) {
  const { url, html } = element;

  // Patch HTML with shims if inline content provided
  const patchedHtml = useMemo(() => {
    if (!html) return undefined;
    return patchHtmlForIframe(html);
  }, [html]);

  // Handle messages from the WebView (error capture)
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.__maicInteractive && data.kind === 'runtime-error') {
        // Log error for diagnostics (could be sent to analytics)
        console.warn(`[Interactive Scene] ${data.errorKind}: ${data.message}`);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Determine source
  const source = useMemo(() => {
    if (patchedHtml) {
      return { html: patchedHtml };
    }
    if (url) {
      return { uri: url };
    }
    return { html: '<html><body><p>No content</p></body></html>' };
  }, [patchedHtml, url]);

  return (
    <View style={styles.container}>
      <WebView
        source={source}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled={false}
        bounces={false}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        )}
        renderError={() => (
          <View style={styles.error}>
            <Text style={styles.errorText}>Failed to load interactive content</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  error: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
