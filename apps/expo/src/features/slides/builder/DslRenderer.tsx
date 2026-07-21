import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { IDslNode, DslComponentType } from './builderStore';

interface DslRendererProps {
  node: IDslNode;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * DslRenderer - Renders a DSL node as React Native components.
 *
 * Port of Web's DslCanvas component map.
 */
export function DslRenderer({ node, isSelected, onSelect }: DslRendererProps) {
  const style = (node.props?.style as Record<string, unknown>) || {};
  const children = node.children;

  const renderContent = () => {
    switch (node.type) {
      case 'View':
        return (
          <View style={[style as any, isSelected && styles.selected]}>
            {children?.map((child, i) =>
              typeof child === 'string' ? (
                <Text key={i}>{child}</Text>
              ) : (
                <DslRenderer
                  key={child.id}
                  node={child}
                  isSelected={false}
                  onSelect={() => {}}
                />
              ),
            )}
          </View>
        );

      case 'Text':
        return (
          <Text style={style as any}>
            {children?.map((c) => (typeof c === 'string' ? c : c.id)).join('') || ''}
          </Text>
        );

      case 'Button':
        return (
          <TouchableOpacity
            style={[style as any, isSelected && styles.selected]}
            onPress={onSelect}
          >
            <Text style={{ color: (style as any).color || '#fff' }}>
              {children?.map((c) => (typeof c === 'string' ? c : c.id)).join('') || 'Button'}
            </Text>
          </TouchableOpacity>
        );

      case 'Image':
        return (
          <Image
            style={[style as any, isSelected && styles.selected]}
            source={{ uri: (node.props?.src as string) || 'https://via.placeholder.com/200' }}
          />
        );

      case 'TextInput':
        return (
          <TextInput
            style={[style as any, isSelected && styles.selected]}
            placeholder={(node.props?.placeholder as string) || 'Enter text...'}
            editable={false}
          />
        );

      case 'ScrollView':
        return (
          <ScrollView
            style={[style as any, { maxHeight: 200 }, isSelected && styles.selected]}
          >
            {children?.map((child, i) =>
              typeof child === 'string' ? (
                <Text key={i}>{child}</Text>
              ) : (
                <DslRenderer
                  key={child.id}
                  node={child}
                  isSelected={false}
                  onSelect={() => {}}
                />
              ),
            )}
          </ScrollView>
        );

      default:
        return <View style={styles.placeholder}><Text>Unknown</Text></View>;
    }
  };

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.9}>
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selected: {
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderStyle: 'dashed',
  },
  placeholder: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
});
