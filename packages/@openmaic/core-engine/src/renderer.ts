import React from 'react';
import type { IDslNode, ComponentMap, DslRenderOptions, DslSchema } from './types';

function renderNode(
  node: IDslNode,
  componentMap: ComponentMap,
  onEvent?: (eventName: string, payload: unknown) => void
): React.ReactElement | null {
  const { type, props, children, id } = node;

  const Component = componentMap[type];
  if (!Component) {
    console.warn(`[core-engine] No component registered for type: ${type}`);
    return null;
  }

  const mergedProps: Record<string, unknown> = {
    ...props,
  };

  if (id) {
    mergedProps.id = id;
  }

  if (type === 'Button' && mergedProps.onPress && typeof mergedProps.onPress === 'function') {
    const originalOnPress = mergedProps.onPress as () => void;
    mergedProps.onPress = () => {
      onEvent?.('buttonPress', { id, type });
      originalOnPress();
    };
  }

  if (type === 'TextInput' && mergedProps.onChangeText && typeof mergedProps.onChangeText === 'function') {
    const originalOnChangeText = mergedProps.onChangeText as (text: string) => void;
    mergedProps.onChangeText = (text: string) => {
      onEvent?.('textInputChange', { id, type, value: text });
      originalOnChangeText(text);
    };
  }

  const renderedChildren = children?.map((child, index) => {
    if (typeof child === 'string') {
      return child;
    }
    return renderNode(child, componentMap, onEvent);
  });

  return React.createElement(Component, mergedProps, ...(renderedChildren ?? []));
}

export function renderDsl(
  schema: DslSchema,
  options: DslRenderOptions
): React.ReactElement | React.ReactElement[] | null {
  const { componentMap, onEvent } = options;

  if (Array.isArray(schema)) {
    const elements = schema.map((node, index) => {
      const element = renderNode(node, componentMap, onEvent);
      if (element) {
        return React.cloneElement(element, { key: node.id ?? index });
      }
      return null;
    }).filter((element): element is React.ReactElement => element !== null);

    if (elements.length === 0) {
      return null;
    }
    if (elements.length === 1) {
      return elements[0];
    }
    return elements;
  }

  return renderNode(schema, componentMap, onEvent);
}

export function createDslRenderer(componentMap: ComponentMap) {
  return {
    render: (schema: DslSchema, options?: Omit<DslRenderOptions, 'componentMap'>) => {
      return renderDsl(schema, {
        componentMap,
        onEvent: options?.onEvent,
      });
    },
  };
}