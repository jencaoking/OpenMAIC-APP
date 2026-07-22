import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EditElementsUIProps {
  args: Record<string, unknown>;
  result?: { content: string; details?: Record<string, unknown> };
  isLoading?: boolean;
}

/**
 * Edit Elements tool UI card.
 *
 * Port of Web's AgentPanel/edit-elements-tool-ui.tsx.
 */
export function EditElementsUI({ args, result, isLoading }: EditElementsUIProps) {
  const patches = args.patches as Array<{ op: string; path: string }> | undefined;
  const reason = args.reason as string | undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>✏️</Text>
        <Text style={styles.title}>Edit Elements</Text>
        {isLoading && <Text style={styles.status}>Editing...</Text>}
      </View>

      {reason && <Text style={styles.reason}>{reason}</Text>}

      {patches && (
        <Text style={styles.patchCount}>
          {patches.length} operation{patches.length !== 1 ? 's' : ''}
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
  reason: {
    fontSize: 13,
    color: '#374151',
    marginTop: 6,
  },
  patchCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
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
