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

  let hasChanged = false;
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      const resolvedValue = resolveTemplate(value, context);
      if (resolvedValue !== value) {
        hasChanged = true;
      }
      resolved[key] = resolvedValue;
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        const resolvedArray = value.map((item) => {
          if (typeof item === 'string') {
            const resolvedItem = resolveTemplate(item, context);
            if (resolvedItem !== item) {
              hasChanged = true;
            }
            return resolvedItem;
          }
          return item;
        });
        if (!hasChanged && resolvedArray.length !== value.length) {
          hasChanged = true;
        }
        resolved[key] = hasChanged ? resolvedArray : value;
      } else {
        const resolvedNested = resolveBindingsInProps(value as Record<string, unknown>, context);
        if (resolvedNested !== value) {
          hasChanged = true;
        }
        resolved[key] = resolvedNested;
      }
    } else {
      resolved[key] = value;
    }
  }

  return hasChanged ? resolved : props;
}

export function resolveBindingsInNode(node: IDslNode, context: DslContext): IDslNode {
  const resolvedProps = resolveBindingsInProps(node.props, context);

  let resolvedChildren: (IDslNode | string)[] | undefined;
  let childrenChanged = false;

  if (node.children) {
    resolvedChildren = node.children.map((child) => {
      if (typeof child === 'string') {
        const resolvedChild = resolveTemplate(child, context);
        if (resolvedChild !== child) {
          childrenChanged = true;
        }
        return resolvedChild;
      }
      const resolvedChildNode = resolveBindingsInNode(child, context);
      if (resolvedChildNode !== child) {
        childrenChanged = true;
      }
      return resolvedChildNode;
    });
  }

  if (resolvedProps === node.props && !childrenChanged) {
    return node;
  }

  return {
    ...node,
    props: resolvedProps,
    children: childrenChanged ? resolvedChildren : node.children,
  };
}

export function resolveBindingsInSchema(schema: IDslNode | IDslNode[], context: DslContext): IDslNode | IDslNode[] {
  if (Array.isArray(schema)) {
    let arrayChanged = false;
    const resolvedArray = schema.map((node) => {
      const resolvedNode = resolveBindingsInNode(node, context);
      if (resolvedNode !== node) {
        arrayChanged = true;
      }
      return resolvedNode;
    });
    return arrayChanged ? resolvedArray : schema;
  }
  return resolveBindingsInNode(schema, context);
}