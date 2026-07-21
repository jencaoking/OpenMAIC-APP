import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { PPTLatexElement } from '@openmaic/dsl';

interface RNLatexElementProps {
  element: PPTLatexElement;
}

/**
 * LaTeX 元素渲染器。
 * PPTLatexElement 使用 latex 字段（不是 content）。
 */
export function RNLatexElement({ element }: RNLatexElementProps) {
  const { latex, color } = element;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          overflow: hidden;
        }
        .katex { font-size: 24px; color: ${color || '#333333'}; }
      </style>
    </head>
    <body>
      <div id="math"></div>
      <script>
        try {
          katex.render(${JSON.stringify(latex || '')}, document.getElementById('math'), {
            throwOnError: false,
            displayMode: true
          });
        } catch(e) {
          document.getElementById('math').textContent = ${JSON.stringify(latex || '')};
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
