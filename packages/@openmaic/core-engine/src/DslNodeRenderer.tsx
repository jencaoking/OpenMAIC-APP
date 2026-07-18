import React, { useMemo } from 'react';
import type { IDslNode, ComponentMap, DslContext, DslAction, ActionHandler } from './types';
import { resolveBindingsInNode } from './binding';

interface DslNodeRendererProps<TContext extends DslContext = DslContext> {
  readonly node: IDslNode;
  readonly componentMap: ComponentMap;
  readonly context: TContext;
  readonly onAction?: ActionHandler<TContext>;
}

function DslNodeRendererInternal<TContext extends DslContext = DslContext>({
  node,
  componentMap,
  context,
  onAction,
}: DslNodeRendererProps<TContext>) {
  const resolvedNode = useMemo(() => {
    return resolveBindingsInNode(node, context);
  }, [node, context]);

  const { type, props, children, id, actions } = resolvedNode;

  const Component = componentMap[type];
  if (!Component) {
    console.warn(`[core-engine] No component registered for type: ${type}`);
    return null;
  }

  const eventHandlers = useMemo(() => {
    if (!actions || !onAction) {
      return {};
    }
    const handlers: Record<string, () => void> = {};
    for (const [eventName, action] of Object.entries(actions)) {
      handlers[eventName] = () => {
        onAction(action, context);
      };
    }
    return handlers;
  }, [actions, onAction, context]);

  const mergedProps = useMemo(() => {
    const merged: Record<string, unknown> = {
      ...props,
      ...eventHandlers,
    };
    if (id) {
      merged.id = id;
    }
    return merged;
  }, [props, eventHandlers, id]);

  const renderedChildren = useMemo(() => {
    if (!children) return [];
    return children.map((child, index) => {
      if (typeof child === 'string') {
        return child;
      }
      return (
        <DslNodeRenderer<TContext>
          key={child.id ?? index}
          node={child}
          componentMap={componentMap}
          context={context}
          onAction={onAction}
        />
      );
    });
  }, [children, componentMap, context, onAction]);

  return React.createElement(Component, mergedProps, ...renderedChildren);
}

function arePropsEqual<TContext extends DslContext = DslContext>(
  prevProps: DslNodeRendererProps<TContext>,
  nextProps: DslNodeRendererProps<TContext>
): boolean {
  if (prevProps.node !== nextProps.node) {
    return false;
  }
  if (prevProps.componentMap !== nextProps.componentMap) {
    return false;
  }
  if (prevProps.context !== nextProps.context) {
    return false;
  }
  if (prevProps.onAction !== nextProps.onAction) {
    return false;
  }
  return true;
}

export const DslNodeRenderer = React.memo(DslNodeRendererInternal, arePropsEqual) as <TContext extends DslContext = DslContext>(
  props: DslNodeRendererProps<TContext>
) => React.ReactElement;