import { useMemo } from 'react';
import type { IDslNode, DslContext } from './types';
import { resolveBindingsInSchema } from './binding';

export function useDslBindings(
  dslTree: IDslNode | IDslNode[],
  context: DslContext
): IDslNode | IDslNode[] {
  return useMemo(() => {
    return resolveBindingsInSchema(dslTree, context);
  }, [dslTree, context]);
}