import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { PPTCodeElement } from '@openmaic/dsl';

interface RNCodeElementProps {
  element: PPTCodeElement;
}

/**
 * 代码块元素渲染器。
 * PPTCodeElement 使用 lines (CodeLine[]) 和 language 字段。
 */
export function RNCodeElement({ element }: RNCodeElementProps) {
  const { language, lines, showLineNumbers } = element;

  const bgColor = '#1e1e1e';
  const textColor = '#d4d4d4';

  // 将 CodeLine[] 转换为文本
  const codeText = lines.map((line) => line.content).join('\n');

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
            {showLineNumbers
              ? codeText
                  .split('\n')
                  .map((line: string, i: number) => `${i + 1}  ${line}`)
                  .join('\n')
              : codeText}
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
