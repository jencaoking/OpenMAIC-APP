import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { PPTChartElement } from '@openmaic/dsl';

interface RNChartElementProps {
  element: PPTChartElement;
}

/**
 * 图表元素渲染器。
 * 使用 WebView + ECharts 渲染图表。
 */
export function RNChartElement({ element }: RNChartElementProps) {
  const { chartType, data, themeColors } = element;
  const { labels, series } = data;

  const option = JSON.stringify({
    tooltip: { trigger: 'axis' },
    xAxis: chartType !== 'pie' ? { type: 'category' as const, data: labels } : undefined,
    yAxis: chartType !== 'pie' ? { type: 'value' as const } : undefined,
    series: [
      {
        type:
          chartType === 'bar'
            ? ('bar' as const)
            : chartType === 'line'
              ? ('line' as const)
              : ('pie' as const),
        data:
          chartType === 'pie'
            ? labels?.map((l: string, i: number) => ({
                name: l,
                value: series?.[0]?.[i] ?? 0,
              }))
            : series?.[0],
        ...(themeColors ? { color: themeColors } : {}),
      },
    ],
    grid: chartType !== 'pie' ? { left: 40, right: 20, top: 40, bottom: 30 } : undefined,
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
      <style>
        body { margin: 0; padding: 0; background: transparent; }
        #chart { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="chart"></div>
      <script>
        const chart = echarts.init(document.getElementById('chart'));
        chart.setOption(${option});
        window.addEventListener('resize', () => chart.resize());
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
