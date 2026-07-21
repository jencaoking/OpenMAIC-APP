import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RegenerateUIProps {
  args: Record<string, unknown>;
  result?: { content: string; details?: Record<string, unknown> };
  isLoading?: boolean;
}

/**
 * Regenerate Scene tool UI card.
 *
 * Port of Web's AgentPanel/regenerate-scene-tool-ui.tsx.
 */
export function RegenerateUI({ args, result, isLoading }: RegenerateUIProps) {
  const instruction = args.instruction as string | undefined;
  const isActionsOnly = args.type === 'actions';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔄</Text>
        <Text style={styles.title}>
          {isActionsOnly ? 'Regenerate Actions' : 'Regenerate Scene'}
        </Text>
        {isLoading && <Text style={styles.status}>Regenerating...</Text>}
      </View>

      {instruction && (
        <Text style={styles.instruction} numberOfLines={2}>
          {instruction}
        </Text>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText} numberOfLines={3}>
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
  instruction: {
    fontSize: 13,
    color: '#374151',
    marginTop: 6,
  },
  resultContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },
  resultText: {
    fontSize: 12,
    color: '#166534',
  },
});
