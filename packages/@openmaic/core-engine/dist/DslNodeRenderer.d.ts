import React from 'react';
import type { IDslNode, ComponentMap, DslContext, ActionHandler } from './types';
interface DslNodeRendererProps<TContext extends DslContext = DslContext> {
    readonly node: IDslNode;
    readonly componentMap: ComponentMap;
    readonly context: TContext;
    readonly onAction?: ActionHandler<TContext>;
}
export declare const DslNodeRenderer: <TContext extends DslContext = DslContext>(props: DslNodeRendererProps<TContext>) => React.ReactElement;
export {};
