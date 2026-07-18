import React from 'react';
import type { IDslNode, ComponentMap, DslRenderOptions, DslSchema, DslContext, DslAction } from './types';
import { resolveBindingsInSchema } from './binding';

function renderNode<TContext extends DslContext>(
  node: IDslNode,
  componentMap: ComponentMap,
  context: TContext,
  onAction?: (action: DslAction, ctx: TContext) => void
): React.ReactElement | null {
  const { type, props, children, id, actions } = node;

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

  if (actions) {
    for (const [eventName, action] of Object.entries(actions)) {
      mergedProps[eventName] = () => {
        onAction?.(action, context);
      };
    }
  }

  const renderedChildren = children?.map((child, index) => {
    if (typeof child === 'string') {
      return child;
    }
    return renderNode(child, componentMap, context, onAction);
  });

  return React.createElement(Component, mergedProps, ...(renderedChildren ?? []));
}

export function renderDsl<TContext extends DslContext = DslContext>(
  schema: DslSchema,
  options: DslRenderOptions<TContext>
): React.ReactElement | React.ReactElement[] | null {
  const { componentMap, context = {} as TContext, onAction } = options;

  const resolvedSchema = resolveBindingsInSchema(schema, context);

  if (Array.isArray(resolvedSchema)) {
    const elements = resolvedSchema.map((node, index) => {
      const element = renderNode(node, componentMap, context, onAction);
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

  return renderNode(resolvedSchema, componentMap, context, onAction);
}

export function createDslRenderer<TContext extends DslContext = DslContext>(componentMap: ComponentMap) {
  return {
    render: (schema: DslSchema, options?: Omit<DslRenderOptions<TContext>, 'componentMap'>) => {
      return renderDsl(schema, {
        componentMap,
        context: options?.context,
        onAction: options?.onAction,
      });
    },
  };
}