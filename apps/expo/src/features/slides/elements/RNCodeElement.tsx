import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { PPTCodeElement } from '@openmaic/dsl';

interface RNCodeElementProps {
  element: PPTCodeElement;
}

/**
 * 代码块元素渲染器。
 * 移植自 Web 端 BaseCodeElement。
 *
 * 使用深色背景 + 等宽字体渲染代码。
 */
export function RNCodeElement({ element }: RNCodeElementProps) {
  const { content, language, theme } = element;

  const bgColor = theme === 'dark' ? '#1e1e1e' : '#f5f5f5';
  const textColor = theme === 'dark' ? '#d4d4d4' : '#333333';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 语言标签 */}
      {language && (
        <View style={styles.header}>
          <Text style={styles.language}>{language}</Text>
        </View>
      )}

      {/* 代码内容 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView style={styles.codeScroll}>
          <Text style={[styles.code, { color: textColor }]} selectable>
            {content || ''}
          </Text>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  language: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  codeScroll: {
    flex: 1,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
  },
});
