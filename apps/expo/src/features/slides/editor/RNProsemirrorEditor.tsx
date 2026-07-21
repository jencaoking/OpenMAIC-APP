import React, { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { getProsemirrorHtml } from './prosemirror-html';
import { useTextEditorStore } from './textEditorStore';

export interface RNProsemirrorEditorProps {
  elementId: string;
  value: string;
  editable?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  defaultColor?: string;
  defaultFontName?: string;
  onUpdate?: (payload: { value: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface RNProsemirrorEditorRef {
  focus: () => void;
  execCommand: (command: string, value?: string) => void;
}

/**
 * WebView-based ProseMirror editor for React Native.
 * Runs the exact same ProseMirror code as Web in an embedded browser context.
 * Communicates with RN via postMessage.
 */
export const RNProsemirrorEditor = forwardRef<RNProsemirrorEditorRef, RNProsemirrorEditorProps>(
  (
    {
      elementId,
      value,
      editable = false,
      autoFocus = false,
      placeholder,
      defaultColor,
      defaultFontName,
      onUpdate,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const webViewRef = useRef<WebView>(null);
    const isReady = useRef(false);
    const pendingInit = useRef(true);
    const setValue = useTextEditorStore((s) => s.setRichtextAttrs);
    const editingElementId = useTextEditorStore((s) => s.editingElementId);

    // Send message to WebView
    const sendToWebView = useCallback((message: Record<string, unknown>) => {
      if (!webViewRef.current) return;
      webViewRef.current.postMessage(JSON.stringify(message));
    }, []);

    // Handle messages from WebView
    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (!data || !data.type) return;

          switch (data.type) {
            case 'ready':
              isReady.current = true;
              // Send initial content after ready
              if (pendingInit.current) {
                pendingInit.current = false;
                sendToWebView({
                  type: 'init',
                  content: value || '',
                  editable,
                  placeholder: placeholder || '',
                });
                if (autoFocus) sendToWebView({ type: 'focus' });
              }
              break;

            case 'change':
              onUpdate?.({ value: data.html });
              break;

            case 'attrs':
              if (data.attrs) {
                setValue(data.attrs);
              }
              break;

            case 'focus':
              onFocus?.();
              break;

            case 'blur':
              onBlur?.();
              break;
          }
        } catch {
          // Ignore parse errors
        }
      },
      [value, editable, autoFocus, placeholder, onUpdate, onFocus, onBlur, setValue, sendToWebView],
    );

    // Sync content updates from RN to WebView (when value changes externally)
    useEffect(() => {
      if (!isReady.current) return;
      sendToWebView({ type: 'update', content: value || '' });
    }, [value, sendToWebView]);

    // Sync editable state
    useEffect(() => {
      if (!isReady.current) return;
      sendToWebView({ type: 'editable', editable });
    }, [editable, sendToWebView]);

    // Focus when this element becomes the editing target
    useEffect(() => {
      if (!editable) return;
      if (editingElementId !== elementId) return;
      if (!isReady.current) return;
      sendToWebView({ type: 'focus' });
    }, [editable, editingElementId, elementId, sendToWebView]);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      focus: () => sendToWebView({ type: 'focus' }),
      execCommand: (command: string, value?: string) => {
        sendToWebView({ type: 'command', payload: { command, value } });
      },
    }));

    // Reset pendingInit when value or editable changes significantly
    useEffect(() => {
      pendingInit.current = true;
    }, []);

    const html = getProsemirrorHtml();

    return (
      <WebView
        ref={webViewRef}
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html, baseUrl: '' }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        pointerEvents={editable ? 'auto' : 'none'}
        // Prevent WebView from stealing focus on Android
        androidHardwareAccelerationDisabled={Platform.OS === 'android'}
      />
    );
  },
);

RNProsemirrorEditor.displayName = 'RNProsemirrorEditor';

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
