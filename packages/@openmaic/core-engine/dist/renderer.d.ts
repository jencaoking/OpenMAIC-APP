import React from 'react';
import type { ComponentMap, DslRenderOptions, DslSchema, DslContext } from './types';
export declare function renderDsl<TContext extends DslContext = DslContext>(schema: DslSchema, options: DslRenderOptions<TContext>): React.ReactElement | React.ReactElement[] | null;
export declare function createDslRenderer<TContext extends DslContext = DslContext>(componentMap: ComponentMap): {
    render: (schema: DslSchema, options?: Omit<DslRenderOptions<TContext>, "componentMap">) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>[] | null;
};
