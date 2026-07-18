import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import { renderDsl, createDslRenderer, type IDslNode, type ComponentMap } from '@openmaic/core-engine';

const DslView: React.FC<{ style?: Record<string, unknown>; children?: React.ReactNode; [key: string]: unknown }> = ({ style, children, ...rest }) => (
  <View style={style as any} {...rest}>
    {children}
  </View>
);

const DslText: React.FC<{ style?: Record<string, unknown>; children?: React.ReactNode; [key: string]: unknown }> = ({ style, children, ...rest }) => (
  <Text style={style as any} {...rest}>
    {children}
  </Text>
);

const DslButton: React.FC<{ style?: Record<string, unknown>; children?: string; onPress?: () => void; disabled?: boolean; [key: string]: unknown }> = ({
  style,
  children,
  onPress,
  disabled,
  ...rest
}) => (
  <Pressable style={[styles.dslButton, style as any, disabled && styles.dslButtonDisabled]} onPress={onPress} disabled={disabled} {...rest}>
    <Text style={styles.dslButtonText}>{children}</Text>
  </Pressable>
);

const DslImage: React.FC<{ style?: Record<string, unknown>; source?: { uri: string } | number; resizeMode?: string; [key: string]: unknown }> = ({
  style,
  source,
  resizeMode,
  ...rest
}) => (
  <Image style={style as any} source={source as any} resizeMode={resizeMode as any} {...rest} />
);

const DslTextInput: React.FC<{
  style?: Record<string, unknown>;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: string;
  secureTextEntry?: boolean;
  [key: string]: unknown;
}> = ({ style, placeholder, value, onChangeText, keyboardType, secureTextEntry, ...rest }) => (
  <TextInput
    style={style as any}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType as any}
    secureTextEntry={secureTextEntry}
    {...rest}
  />
);

const DslScrollView: React.FC<{
  style?: Record<string, unknown>;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({ style, horizontal, showsVerticalScrollIndicator, showsHorizontalScrollIndicator, children, ...rest }) => (
  <ScrollView
    style={style as any}
    horizontal={horizontal}
    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    {...rest}
  >
    {children}
  </ScrollView>
);

const rnComponentMap: ComponentMap = {
  View: DslView,
  Text: DslText,
  Button: DslButton,
  Image: DslImage,
  TextInput: DslTextInput,
  ScrollView: DslScrollView,
};

interface DslRenderScreenProps {
  onBack: () => void;
}

const DslRenderScreen: React.FC<DslRenderScreenProps> = ({ onBack }) => {
  const [inputValue, setInputValue] = useState('');
  const [eventLog, setEventLog] = useState<string[]>([]);

  const handleEvent = (eventName: string, payload: unknown) => {
    const log = `${new Date().toLocaleTimeString()}: ${eventName} - ${JSON.stringify(payload)}`;
    setEventLog((prev) => [log, ...prev].slice(0, 10));
  };

  const handleButtonPress = () => {
    Alert.alert('成功', '按钮点击事件通过 DSL 引擎捕获！');
  };

  const childrenWithValue = inputValue
    ? [
        {
          type: 'Text' as const,
          props: {
            style: {
              fontSize: 14,
              color: '#3b82f6',
              marginTop: 8,
            },
          },
          children: [`当前值: ${inputValue}`],
        },
      ]
    : [];

  const dslWithInteractions: IDslNode[] = [
    {
      type: 'View',
      props: {
        style: {
          flex: 1,
          padding: 16,
          backgroundColor: '#f5f5f5',
        },
      },
      children: [
        {
          type: 'View',
          props: {
            style: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            },
          },
          children: [
            {
              type: 'Text',
              props: {
                style: {
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#1f2937',
                },
              },
              children: ['DSL 渲染器'],
            },
            {
              type: 'Button',
              props: {
                children: '返回',
                onPress: onBack,
              },
            },
          ],
        },
        {
          type: 'ScrollView',
          props: {
            style: {
              flex: 1,
            },
            showsVerticalScrollIndicator: true,
          },
          children: [
            {
              type: 'View',
              props: {
                style: {
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              },
              children: [
                {
                  type: 'Text',
                  props: {
                    style: {
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8,
                    },
                  },
                  children: ['交互式输入框'],
                },
                {
                  type: 'TextInput',
                  props: {
                    style: {
                      height: 48,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      fontSize: 14,
                      backgroundColor: '#ffffff',
                    },
                    placeholder: '输入一些内容...',
                    value: inputValue,
                    onChangeText: setInputValue,
                  },
                },
                ...childrenWithValue,
              ],
            },
            {
              type: 'View',
              props: {
                style: {
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              },
              children: [
                {
                  type: 'Text',
                  props: {
                    style: {
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 12,
                    },
                  },
                  children: ['带事件回调的按钮'],
                },
                {
                  type: 'Button',
                  props: {
                    style: {
                      width: '100%',
                    },
                    children: '点击触发事件',
                    onPress: handleButtonPress,
                  },
                },
              ],
            },
            {
              type: 'View',
              props: {
                style: {
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              },
              children: [
                {
                  type: 'Text',
                  props: {
                    style: {
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 12,
                    },
                  },
                  children: ['事件日志'],
                },
                {
                  type: 'ScrollView',
                  props: {
                    style: {
                      height: 150,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 8,
                      padding: 8,
                    },
                    showsVerticalScrollIndicator: true,
                  },
                  children: eventLog.map((log) => ({
                    type: 'Text' as const,
                    props: {
                      style: {
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 4,
                      },
                    },
                    children: [log],
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const renderer = createDslRenderer(rnComponentMap);
  const renderedContent = renderer.render(dslWithInteractions, { onEvent: handleEvent });

  return <>{renderedContent}</>;
};

const styles = StyleSheet.create({
  dslButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dslButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  dslButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DslRenderScreen;