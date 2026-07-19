import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  renderDsl,
  createDslRenderer,
  type IDslNode,
  type ComponentMap,
  type DslAction,
  type DslContext,
} from '@openmaic/core-engine';
import { useSessionStore } from '../../core/store/sessionStore';

const DslView: React.FC<{
  style?: Record<string, unknown>;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({ style, children, ...rest }) => (
  <View style={style as any} {...rest}>
    {children}
  </View>
);

const DslText: React.FC<{
  style?: Record<string, unknown>;
  children?: React.ReactNode;
  [key: string]: unknown;
}> = ({ style, children, ...rest }) => (
  <Text style={style as any} {...rest}>
    {children}
  </Text>
);

const DslButton: React.FC<{
  style?: Record<string, unknown>;
  children?: string;
  disabled?: boolean;
  [key: string]: unknown;
}> = ({ style, children, disabled, ...rest }) => (
  <Pressable
    style={[styles.dslButton, style as any, disabled && styles.dslButtonDisabled]}
    disabled={disabled}
    {...rest}
  >
    <Text style={styles.dslButtonText}>{children}</Text>
  </Pressable>
);

const DslImage: React.FC<{
  style?: Record<string, unknown>;
  source?: { uri: string } | number;
  resizeMode?: string;
  [key: string]: unknown;
}> = ({ style, source, resizeMode, ...rest }) => (
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
}> = ({
  style,
  horizontal,
  showsVerticalScrollIndicator,
  showsHorizontalScrollIndicator,
  children,
  ...rest
}) => (
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
  const [dynamicMessage, setDynamicMessage] = useState('暂无消息');

  const { state } = useSessionStore();
  const sessionCount = state.sessions.length;

  const addEventLog = useCallback((message: string) => {
    const log = `${new Date().toLocaleTimeString()}: ${message}`;
    setEventLog((prev) => [log, ...prev].slice(0, 15));
  }, []);

  const handleAction = useCallback(
    (action: DslAction, context: DslContext) => {
      addEventLog(`Action: ${action.type} - ${JSON.stringify(action.payload)}`);

      switch (action.type) {
        case 'NAVIGATE':
          if (action.payload.path === 'back') {
            onBack();
          }
          break;

        case 'UPDATE_STATE':
          if (action.payload.key === 'message') {
            setDynamicMessage(String(action.payload.value));
          }
          break;

        case 'SET_VALUE':
          if (action.payload.target === 'input') {
            setInputValue(action.payload.value);
          }
          break;

        case 'CUSTOM':
          Alert.alert('自定义动作', `执行: ${action.name}`);
          break;

        case 'FETCH_DATA':
          addEventLog(`请求数据: ${action.payload.endpoint}`);
          break;

        default:
          addEventLog(`未知动作: ${(action as DslAction).type}`);
      }
    },
    [addEventLog, onBack],
  );

  const dslContext = useMemo(
    () => ({
      session: {
        count: sessionCount,
        message: dynamicMessage,
      },
      user: {
        name: '测试用户',
      },
      input: {
        value: inputValue,
      },
    }),
    [sessionCount, dynamicMessage, inputValue],
  );

  const dslSchema = useMemo<IDslNode[]>(
    () => [
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
                children: ['DSL 交互引擎'],
              },
              {
                type: 'Button',
                props: {
                  children: '返回',
                },
                actions: {
                  onPress: { type: 'NAVIGATE', payload: { path: 'back' } },
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
                    children: ['上下文数据绑定'],
                  },
                  {
                    type: 'Text',
                    props: {
                      style: {
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 4,
                      },
                    },
                    children: ['会话数量: ${session.count}'],
                  },
                  {
                    type: 'Text',
                    props: {
                      style: {
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 4,
                      },
                    },
                    children: ['用户名: ${user.name}'],
                  },
                  {
                    type: 'Text',
                    props: {
                      style: {
                        fontSize: 14,
                        color: '#3b82f6',
                        marginTop: 8,
                      },
                    },
                    children: ['动态消息: ${session.message}'],
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
                    children: ['输入框双向绑定'],
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
                  {
                    type: 'Text',
                    props: {
                      style: {
                        fontSize: 14,
                        color: '#6b7280',
                        marginTop: 8,
                      },
                    },
                    children: ['当前输入: ${input.value}'],
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
                    children: ['声明式动作按钮'],
                  },
                  {
                    type: 'View',
                    props: {
                      style: {
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                      },
                    },
                    children: [
                      {
                        type: 'Button',
                        props: {
                          style: {
                            flex: 1,
                            minWidth: 120,
                          },
                          children: '更新消息',
                        },
                        actions: {
                          onPress: {
                            type: 'UPDATE_STATE',
                            payload: { key: 'message', value: '消息已更新！' },
                          },
                        },
                      },
                      {
                        type: 'Button',
                        props: {
                          style: {
                            flex: 1,
                            minWidth: 120,
                          },
                          children: '清空输入',
                        },
                        actions: {
                          onPress: { type: 'SET_VALUE', payload: { target: 'input', value: '' } },
                        },
                      },
                      {
                        type: 'Button',
                        props: {
                          style: {
                            flex: 1,
                            minWidth: 120,
                          },
                          children: '自定义动作',
                        },
                        actions: {
                          onPress: {
                            type: 'CUSTOM',
                            name: 'showToast',
                            payload: { message: 'Hello DSL!' },
                          },
                        },
                      },
                      {
                        type: 'Button',
                        props: {
                          style: {
                            flex: 1,
                            minWidth: 120,
                          },
                          children: '获取数据',
                        },
                        actions: {
                          onPress: {
                            type: 'FETCH_DATA',
                            payload: { endpoint: '/api/sessions', method: 'GET' },
                          },
                        },
                      },
                    ],
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
                    children: ['动作日志'],
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
                    children: eventLog.map((log, index) => ({
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
    ],
    [inputValue],
  );

  const renderer = useMemo(() => createDslRenderer(rnComponentMap), []);
  const renderedContent = renderer.render(dslSchema, {
    context: dslContext,
    onAction: handleAction,
  });

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
