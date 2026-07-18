import type { DslContext, IDslNode } from './types';

const TEMPLATE_REGEX = /\$\{([^}]+)\}/g;

export function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return value;
}

export function resolveTemplate(template: string, context: DslContext): string {
  return template.replace(TEMPLATE_REGEX, (_, path) => {
    const value = getValueByPath(context, path.trim());
    return value === undefined || value === null ? '' : String(value);
  });
}

export function resolveBindingsInProps(props: Record<string, unknown> | undefined, context: DslContext): Record<string, unknown> {
  if (!props) {
    return {};
  }

  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      resolved[key] = resolveTemplate(value, context);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        resolved[key] = value.map((item) => {
          if (typeof item === 'string') {
            return resolveTemplate(item, context);
          }
          return item;
        });
      } else {
        resolved[key] = resolveBindingsInProps(value as Record<string, unknown>, context);
      }
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

export function resolveBindingsInNode(node: IDslNode, context: DslContext): IDslNode {
  const resolvedProps = resolveBindingsInProps(node.props, context);

  const resolvedChildren = node.children?.map((child) => {
    if (typeof child === 'string') {
      return resolveTemplate(child, context);
    }
    return resolveBindingsInNode(child, context);
  });

  return {
    ...node,
    props: resolvedProps,
    children: resolvedChildren,
  };
}

export function resolveBindingsInSchema(schema: IDslNode | IDslNode[], context: DslContext): IDslNode | IDslNode[] {
  if (Array.isArray(schema)) {
    return schema.map((node) => resolveBindingsInNode(node, context));
  }
  return resolveBindingsInNode(schema, context);
}