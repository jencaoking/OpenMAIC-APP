import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface PropertyFormProps {
  properties: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

/**
 * PropertyForm - Dynamic form fields for properties.
 *
 * Port of Web's PropertyForm component.
 */
export function PropertyForm({ properties, onChange }: PropertyFormProps) {
  return (
    <View style={styles.container}>
      {Object.entries(properties).map(([key, value]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{key}</Text>
          <TextInput
            style={styles.input}
            value={String(value)}
            onChangeText={(v) => {
              const numValue = parseFloat(v);
              onChange(key, isNaN(numValue) ? v : numValue);
            }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
});
