import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import * as Haptics from 'expo-haptics';

interface DslMarkdownProps {
  content: string;
}

function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('复制失败', '无法复制代码');
    }
  };

  return (
    <View style={styles.codeContainer}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeLabel}>代码</Text>
        <TouchableOpacity 
          style={styles.copyButton} 
          onPress={handleCopy}
          accessibilityLabel={copied ? '已复制' : '复制代码'}
        >
          <Text style={styles.copyButtonText}>{copied ? '✓ 已复制' : '复制'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        style={styles.codeScroll}
        showsHorizontalScrollIndicator={false}
      >
        <Text style={styles.codeText}>{content}</Text>
      </ScrollView>
    </View>
  );
}

const markdownStyle = {
  heading1: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  body: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginVertical: 4,
  },
  strong: {
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  em: {
    fontStyle: 'italic' as const,
    color: '#374151',
  },
  u: {
    textDecorationLine: 'underline' as const,
  },
  s: {
    textDecorationLine: 'line-through' as const,
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline' as const,
  },
  paragraph: {
    marginVertical: 8,
  },
  list: {
    marginVertical: 8,
    paddingLeft: 16,
  },
  listItem: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginVertical: 2,
  },
  blockQuote: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic' as const,
    color: '#6b7280',
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 16,
  },
  table: {
    marginVertical: 12,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableHeaderCell: {
    fontWeight: '700' as const,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableCell: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
};

export const DslMarkdown: React.FC<DslMarkdownProps> = ({ content }) => {
  const renderCodeBlock = (text: string) => {
    const codeMatch = text.match(/^```(\w*)\n([\s\S]*?)```$/);
    if (codeMatch) {
      return <CodeBlock content={codeMatch[2].trim()} />;
    }
    return null;
  };

  const renderInlineCode = (text: string) => {
    const inlineMatch = text.match(/^`([^`]+)`$/);
    if (inlineMatch) {
      return <Text style={styles.inlineCode}>{inlineMatch[1]}</Text>;
    }
    return null;
  };

  return (
    <Markdown style={markdownStyle}>
      {content}
    </Markdown>
  );
};

const styles = StyleSheet.create({
  codeContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2d2d2d',
  },
  codeLabel: {
    fontSize: 12,
    color: '#858585',
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#3d3d3d',
    borderRadius: 4,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#ffffff',
  },
  codeScroll: {
    padding: 12,
  },
  codeText: {
    fontSize: 14,
    color: '#d4d4d4',
    fontFamily: 'Courier New',
    lineHeight: 20,
  },
  inlineCode: {
    fontSize: 14,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#1f2937',
    fontFamily: 'Courier New',
  },
});
