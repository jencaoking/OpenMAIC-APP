import React, { useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { renderDsl, createDslRenderer, type IDslNode, type ComponentMap, type DslAction, type DslContext } from '@openmaic/core-engine';

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

const DslButton: React.FC<{ style?: Record<string, unknown>; children?: string; disabled?: boolean; [key: string]: unknown }> = ({
  style,
  children,
  disabled,
  ...rest
}) => (
  <Pressable style={[styles.dslButton, style as any, disabled && styles.dslButtonDisabled]} disabled={disabled} {...rest}>
    <Text style={styles.dslButtonText}>{children}</Text>
  </Pressable>
);

const rnComponentMap: ComponentMap = {
  View: DslView,
  Text: DslText,
  Button: DslButton,
  Image: () => null,
  TextInput: () => null,
  ScrollView: DslView as any,
};

function generateStressTestDsl(nodeCount: number): IDslNode[] {
  const nodes: IDslNode[] = [];
  
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      type: 'View',
      id: `node-${i}`,
      props: {
        style: {
          backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb',
          padding: 8,
          borderRadius: 4,
          marginBottom: 4,
        },
      },
      children: [
        {
          type: 'Text',
          id: `text-${i}`,
          props: {
            style: {
              fontSize: 14,
              color: '#374151',
            },
          },
          children: [`节点 ${i + 1}: 固定内容 - ${Math.random().toString(36).substr(2, 9)}`],
        },
        {
          type: 'Text',
          id: `text-bound-${i}`,
          props: {
            style: {
              fontSize: 12,
              color: '#6b7280',
              marginTop: 4,
            },
          },
          children: [`动态值: ${i % 100 === 0 ? '${dynamic.counter}' : '静态'}`],
        },
      ],
    });
  }

  return [
    {
      type: 'View',
      id: 'root',
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
          id: 'header',
          props: {
            style: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              backgroundColor: '#ffffff',
              padding: 16,
              borderRadius: 12,
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
              id: 'title',
              props: {
                style: {
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#1f2937',
                },
              },
              children: ['DSL 压力测试'],
            },
            {
              type: 'Text',
              id: 'node-count',
              props: {
                style: {
                  fontSize: 16,
                  color: '#3b82f6',
                  fontWeight: '600',
                },
              },
              children: [`${nodeCount} 节点`],
            },
          ],
        },
        {
          type: 'View',
          id: 'stats',
          props: {
            style: {
              backgroundColor: '#ffffff',
              padding: 16,
              borderRadius: 12,
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
              id: 'render-time',
              props: {
                style: {
                  fontSize: 14,
                  color: '#6b7280',
                  marginBottom: 4,
                },
              },
              children: ['渲染耗时: ${stats.renderTime}ms'],
            },
            {
              type: 'Text',
              id: 'update-count',
              props: {
                style: {
                  fontSize: 14,
                  color: '#6b7280',
                },
              },
              children: ['更新次数: ${stats.updateCount}'],
            },
          ],
        },
        {
          type: 'View',
          id: 'controls',
          props: {
            style: {
              flexDirection: 'row',
              gap: 8,
              marginBottom: 16,
            },
          },
          children: [
            {
              type: 'Button',
              id: 'btn-increment',
              props: {
                style: {
                  flex: 1,
                  backgroundColor: '#3b82f6',
                },
                children: '触发更新',
              },
              actions: {
                onPress: { type: 'UPDATE_STATE', payload: { key: 'counter', value: 'increment' } },
              },
            },
            {
              type: 'Button',
              id: 'btn-reset',
              props: {
                style: {
                  flex: 1,
                  backgroundColor: '#ef4444',
                },
                children: '重置',
              },
              actions: {
                onPress: { type: 'UPDATE_STATE', payload: { key: 'counter', value: 'reset' } },
              },
            },
          ],
        },
        {
          type: 'View',
          id: 'scroll-container',
          props: {
            style: {
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          },
          children: nodes,
        },
      ],
    },
  ];
}

interface DslStressTestScreenProps {
  onBack: () => void;
}

const DslStressTestScreen: React.FC<DslStressTestScreenProps> = ({ onBack }) => {
  const [counter, setCounter] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const nodeCount = 1000;

  const dslSchema = useRef(generateStressTestDsl(nodeCount)).current;

  const handleAction = useCallback((action: DslAction) => {
    switch (action.type) {
      case 'UPDATE_STATE':
        if (action.payload.key === 'counter') {
          if (action.payload.value === 'increment') {
            setCounter((prev) => prev + 1);
            setUpdateCount((prev) => prev + 1);
          } else {
            setCounter(0);
            setUpdateCount(0);
          }
        }
        break;
    }
  }, []);

  const dslContext = useMemo(() => ({
    dynamic: {
      counter: `Counter: ${counter}`,
    },
    stats: {
      renderTime: renderTime,
      updateCount: updateCount,
    },
  }), [counter, renderTime, updateCount]);

  const renderer = useMemo(() => createDslRenderer(rnComponentMap), []);
  
  const renderedContent = renderer.render(dslSchema, {
    context: dslContext,
    onAction: handleAction,
  });

  useLayoutEffect(() => {
    setRenderTime(Math.round(performance.now()));
  }, [counter]);

  return (
    <ScrollView style={{ flex: 1 }}>
      {renderedContent}
      <View style={{ padding: 16 }}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>返回</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dslButton: {
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
  backButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DslStressTestScreen;