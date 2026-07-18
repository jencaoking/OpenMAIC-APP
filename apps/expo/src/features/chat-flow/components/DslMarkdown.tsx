import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Markdown, { type MarkdownRule } from '@ronradtke/react-native-markdown-display';
import * as Haptics from 'expo-haptics';

interface DslMarkdownProps {
  content: string;
}

const CODE_COLORS: Record<string, string> = {
  keyword: '#569CD6',
  string: '#CE9178',
  comment: '#6A9955',
  function: '#DCDCAA',
  number: '#B5CEA8',
  operator: '#D4D4D4',
  variable: '#9CDCFE',
  type: '#4EC9B0',
};

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

function TableCell({ children, isHeader }: { children: React.ReactNode; isHeader: boolean }) {
  return (
    <View style={[styles.tableCell, isHeader && styles.tableHeaderCell]}>
      <Text style={[styles.tableCellText, isHeader && styles.tableHeaderText]}>
        {children}
      </Text>
    </View>
  );
}

function TableRow({ children, isHeader }: { children: React.ReactNode; isHeader: boolean }) {
  return (
    <View style={[styles.tableRow, isHeader && styles.tableHeaderRow]}>
      {children}
    </View>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal style={styles.tableContainer}>
      <View style={styles.table}>{children}</View>
    </ScrollView>
  );
}

const customRules: MarkdownRule[] = [
  {
    match: /^```(\w*)\n([\s\S]*?)```$/,
    render: (_, language, content) => {
      return <CodeBlock key={Math.random().toString()} content={content.trim()} />;
    },
  },
  {
    match: /^`([^`]+)`$/,
    render: (_, text) => {
      return <Text key={Math.random().toString()} style={styles.inlineCode}>{text}</Text>;
    },
  },
];

const markdownStyle = {
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#1f2937',
  },
  em: {
    fontStyle: 'italic',
    color: '#374151',
  },
  u: {
    textDecorationLine: 'underline',
  },
  s: {
    textDecorationLine: 'line-through',
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
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
    fontStyle: 'italic',
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
    fontWeight: 'bold',
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
  return (
    <Markdown
      rules={customRules}
      style={markdownStyle}
      renderers={{
        code: ({ content }: { content: string }) => <CodeBlock content={content} />,
        inlineCode: ({ content }: { content: string }) => <Text style={styles.inlineCode}>{content}</Text>,
        table: ({ children }: { children: React.ReactNode }) => <Table>{children}</Table>,
        tableRow: ({ children, isHeader }: { children: React.ReactNode; isHeader?: boolean }) => (
          <TableRow isHeader={isHeader || false}>{children}</TableRow>
        ),
        tableCell: ({ children, isHeader }: { children: React.ReactNode; isHeader?: boolean }) => (
          <TableCell isHeader={isHeader || false}>{children}</TableCell>
        ),
      }}
    >
      {content}
    </Markdown>
  );
};

const styles = StyleSheet.create({
  codeContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2d2d2d',
  },
  codeLabel: {
    fontSize: 12,
    color: '#858585',
  },
  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#007acc',
    borderRadius: 4,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#ffffff',
  },
  codeScroll: {
    maxHeight: 300,
  },
  codeText: {
    fontSize: 13,
    color: '#d4d4d4',
    fontFamily: 'Menlo, Monaco, monospace',
    padding: 12,
    lineHeight: 1.5,
  },
  inlineCode: {
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, monospace',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    color: '#374151',
  },
  tableContainer: {
    marginVertical: 8,
    maxWidth: '100%',
  },
  table: {
    minWidth: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    backgroundColor: '#f3f4f6',
  },
  tableCellText: {
    fontSize: 14,
    color: '#374151',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
