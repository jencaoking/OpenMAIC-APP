import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ReadContentUIProps {
  args: Record<string, unknown>;
  result?: { content: string; details?: Record<string, unknown> };
  isLoading?: boolean;
}

/**
 * Read Scene Content tool UI card.
 *
 * Port of Web's AgentPanel/read-tool-ui.tsx.
 */
export function ReadContentUI({ args, result, isLoading }: ReadContentUIProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>📖</Text>
        <Text style={styles.title}>Read Scene</Text>
        {isLoading && <Text style={styles.status}>Reading...</Text>}
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText} numberOfLines={5}>
            {result.content}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  status: {
    fontSize: 12,
    color: '#7c3aed',
    marginLeft: 'auto',
  },
  resultContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  resultText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
});
