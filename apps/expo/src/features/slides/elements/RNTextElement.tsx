import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PPTTextElement } from '@openmaic/dsl';

interface RNTextElementProps {
  element: PPTTextElement;
}

/**
 * 文本元素渲染器。
 * 移植自 Web 端 BaseTextElement。
 *
 * Web 端使用 dangerouslySetInnerHTML 渲染 HTML 内容。
 * RN 端使用简单的 HTML→Text 转换，支持基本的 HTML 标签。
 */
export function RNTextElement({ element }: RNTextElementProps) {
  const vAlign = element.vAlign ?? 'top';
  const justifyContent =
    vAlign === 'middle' ? 'center' : vAlign === 'bottom' ? 'flex-end' : 'flex-start';

  // 简单的 HTML→Text 转换
  const textContent = stripHtmlTags(element.content || '');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: element.fill,
          justifyContent,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: element.defaultColor || '#333333',
            fontFamily: element.defaultFontName || undefined,
            fontSize: 14,
            lineHeight: element.lineHeight ? element.lineHeight * 14 : 20,
            letterSpacing: element.wordSpace,
          },
        ]}
        numberOfLines={0}
      >
        {textContent}
      </Text>
    </View>
  );
}

/** 简单的 HTML 标签去除 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  text: {
    // 默认样式，会被 element 属性覆盖
  },
});
