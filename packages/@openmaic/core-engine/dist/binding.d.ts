import type { DslContext, IDslNode } from './types';
export declare function getValueByPath(obj: Record<string, unknown>, path: string): unknown;
export declare function resolveTemplate(template: string, context: DslContext): string;
export declare function resolveBindingsInProps(props: Record<string, unknown> | undefined, context: DslContext): Record<string, unknown>;
export declare function resolveBindingsInNode(node: IDslNode, context: DslContext): IDslNode;
export declare function resolveBindingsInSchema(schema: IDslNode | IDslNode[], context: DslContext): IDslNode | IDslNode[];
