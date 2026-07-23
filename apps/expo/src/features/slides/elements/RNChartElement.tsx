import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { PPTChartElement } from '@openmaic/dsl';

interface RNChartElementProps {
  element: PPTChartElement;
}

/**
 * Chart element renderer with scatter and radar support.
 *
 * Port of Web's Chart.tsx + chartOption.ts.
 * Supports: bar, line, pie, scatter, radar, area, ring, column.
 */
export function RNChartElement({ element }: RNChartElementProps) {
  const { chartType, data, themeColors, textColor, lineColor } = element;
  const { labels, series, legends } = data;

  const option = JSON.stringify(
    buildChartOption({
      type: chartType,
      data,
      themeColors: themeColors || [],
      textColor,
      lineColor,
    }),
  );

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
        var chart = echarts.init(document.getElementById('chart'));
        chart.setOption(${option});
        window.addEventListener('resize', function() { chart.resize(); });
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

/**
 * Build echarts option — matches Web's chartOption.ts logic.
 */
function buildChartOption({
  type,
  data,
  themeColors,
  textColor,
  lineColor,
}: {
  type: string;
  data: { labels?: string[]; series?: number[][]; legends?: string[] };
  themeColors: string[];
  textColor?: string;
  lineColor?: string;
}) {
  const { labels = [], series = [], legends = [] } = data;

  const textStyle = textColor ? { color: textColor } : {};
  const axisLine = textColor ? { lineStyle: { color: textColor } } : undefined;
  const axisLabel = textColor ? { color: textColor } : undefined;
  const splitLine = lineColor ? { lineStyle: { color: lineColor } } : {};

  const legend = series.length > 1 ? { top: 'bottom', textStyle } : undefined;

  // Bar chart
  if (type === 'bar') {
    return {
      color: themeColors,
      textStyle,
      legend,
      xAxis: { type: 'category', data: labels, axisLine, axisLabel },
      yAxis: { type: 'value', axisLine, axisLabel, splitLine },
      series: series.map((item, i) => ({
        data: item,
        name: legends[i],
        type: 'bar',
        label: { show: true },
        itemStyle: { borderRadius: [2, 2, 0, 0] },
      })),
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    };
  }

  // Column chart (horizontal bar)
  if (type === 'column') {
    return {
      color: themeColors,
      textStyle,
      legend,
      yAxis: { type: 'category', data: labels, axisLine, axisLabel },
      xAxis: { type: 'value', axisLine, axisLabel, splitLine },
      series: series.map((item, i) => ({
        data: item,
        name: legends[i],
        type: 'bar',
        label: { show: true },
        itemStyle: { borderRadius: [0, 2, 2, 0] },
      })),
    };
  }

  // Line chart
  if (type === 'line') {
    return {
      color: themeColors,
      textStyle,
      legend,
      xAxis: { type: 'category', data: labels, axisLine, axisLabel },
      yAxis: { type: 'value', axisLine, axisLabel, splitLine },
      series: series.map((item, i) => ({
        data: item,
        name: legends[i],
        type: 'line',
        label: { show: true },
      })),
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    };
  }

  // Pie chart
  if (type === 'pie') {
    const series0 = series[0];
    if (!series0) return null;
    return {
      color: themeColors,
      textStyle,
      legend: { top: 'bottom', textStyle },
      series: [
        {
          data: labels.map((l, i) => ({ value: series0[i] ?? 0, name: l })),
          type: 'pie',
          radius: '70%',
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' },
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
          },
        },
      ],
    };
  }

  // Ring chart
  if (type === 'ring') {
    const series0 = series[0];
    if (!series0) return null;
    return {
      color: themeColors,
      textStyle,
      legend: { top: 'bottom', textStyle },
      series: [
        {
          data: labels.map((l, i) => ({ value: series0[i] ?? 0, name: l })),
          type: 'pie',
          radius: ['40%', '70%'],
          padAngle: 1,
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 4 },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        },
      ],
    };
  }

  // Area chart
  if (type === 'area') {
    return {
      color: themeColors,
      textStyle,
      legend,
      xAxis: { type: 'category', boundaryGap: false, data: labels, axisLine, axisLabel },
      yAxis: { type: 'value', axisLine, axisLabel, splitLine },
      series: series.map((item, i) => ({
        data: item,
        name: legends[i],
        type: 'line',
        areaStyle: {},
        label: { show: true },
      })),
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    };
  }

  // Radar chart
  if (type === 'radar') {
    return {
      color: themeColors,
      textStyle,
      legend,
      radar: {
        indicator: labels.map((item) => ({ name: item })),
        splitLine,
        axisLine: lineColor ? { lineStyle: { color: lineColor } } : undefined,
      },
      series: [
        {
          data: series.map((item, i) => ({ value: item, name: legends[i] })),
          type: 'radar',
        },
      ],
    };
  }

  // Scatter chart
  if (type === 'scatter') {
    const series0 = series[0];
    if (!series0) return null;
    const formattedData = [];
    for (let i = 0; i < series0.length; i++) {
      const x = series0[i];
      const y = series[1]?.[i] ?? x;
      formattedData.push([x, y]);
    }

    return {
      color: themeColors,
      textStyle,
      xAxis: { axisLine, axisLabel, splitLine },
      yAxis: { axisLine, axisLabel, splitLine },
      series: [
        {
          symbolSize: 12,
          data: formattedData,
          type: 'scatter',
        },
      ],
    };
  }

  return null;
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
