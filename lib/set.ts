import { createSetForAccessorChain } from './createSetForAccessorChain'
import { retrieveAccessorChain } from './accessor'

export function set<R extends object, T>(
  root: R,
  accessor: ((_: R) => T),
): (newValue: T | ((_: T, root: R) => T)) => R {
  return createSetForAccessorChain(
    root,
    Array.isArray(accessor) ? accessor : retrieveAccessorChain<R, T>(accessor),
  )
}
