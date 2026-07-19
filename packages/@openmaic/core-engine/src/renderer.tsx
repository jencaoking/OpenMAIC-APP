import React from 'react';
import type { IDslNode, ComponentMap, DslRenderOptions, DslSchema, DslContext } from './types';
import { DslNodeRenderer } from './DslNodeRenderer';

export function renderDsl<TContext extends DslContext = DslContext>(
  schema: DslSchema,
  options: DslRenderOptions<TContext>,
): React.ReactElement | React.ReactElement[] | null {
  const { componentMap, context = {} as TContext, onAction } = options;

  if (Array.isArray(schema)) {
    const elements = schema.map((node, index) => {
      return (
        <DslNodeRenderer<TContext>
          key={node.id ?? index}
          node={node}
          componentMap={componentMap}
          context={context}
          onAction={onAction}
        />
      );
    });

    if (elements.length === 0) {
      return null;
    }
    if (elements.length === 1) {
      return elements[0];
    }
    return elements;
  }

  return (
    <DslNodeRenderer<TContext>
      node={schema}
      componentMap={componentMap}
      context={context}
      onAction={onAction}
    />
  );
}

export function createDslRenderer<TContext extends DslContext = DslContext>(
  componentMap: ComponentMap,
) {
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
