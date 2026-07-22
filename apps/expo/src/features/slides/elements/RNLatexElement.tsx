import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Svg, { Path } from 'react-native-svg';
import type { PPTLatexElement } from '@openmaic/dsl';

interface RNLatexElementProps {
  element: PPTLatexElement;
}

/**
 * LaTeX element renderer with alignment and auto-scaling.
 *
 * Port of Web's BaseLatexElement with KatexContent.
 * Supports:
 * - KaTeX HTML rendering with alignment (left/center/right)
 * - Auto-scaling (measure natural size, scale to fit container)
 * - SVG path fallback rendering
 */
export function RNLatexElement({ element }: RNLatexElementProps) {
  const { latex, color, html, path, viewBox, align, width, height, strokeWidth } = element;

  // SVG path fallback
  if (path && viewBox) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Svg
          width={width}
          height={height}
          viewBox={`0 0 ${viewBox[0]} ${viewBox[1]}`}
          style={styles.svg}
        >
          <Path
            d={path}
            stroke={color || '#333333'}
            strokeWidth={strokeWidth || 2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  }

  // KaTeX HTML rendering with alignment and auto-scaling
  const alignValue = align || 'center';

  const webviewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%; height: 100%; overflow: hidden; background: transparent;
        }
        .container {
          width: 100%; height: 100%;
          display: flex; align-items: center;
          justify-content: ${alignValue === 'left' ? 'flex-start' : alignValue === 'right' ? 'flex-end' : 'center'};
        }
        .katex-wrapper {
          white-space: nowrap;
          transform-origin: ${alignValue === 'left' ? 'left center' : alignValue === 'right' ? 'right center' : 'center center'};
        }
        .katex { font-size: 24px; color: ${color || '#333333'}; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="katex-wrapper" id="math"></div>
      </div>
      <script>
        try {
          var el = document.getElementById('math');
          katex.render(${JSON.stringify(html || latex || '')}, el, {
            throwOnError: false,
            displayMode: true
          });
          // Auto-scale: measure natural size, scale to fit container
          var container = document.querySelector('.container');
          var naturalW = el.scrollWidth;
          var naturalH = el.scrollHeight;
          if (naturalW > 0 && naturalH > 0) {
            var scale = Math.min(container.clientWidth / naturalW, container.clientHeight / naturalH);
            if (scale < 1) {
              el.style.transform = 'scale(' + scale + ')';
            }
          }
        } catch(e) {
          document.getElementById('math').textContent = ${JSON.stringify(html || latex || '')};
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={{ html: webviewHtml }}
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
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  svg: {
    flex: 1,
  },
});
