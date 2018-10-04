import { retrieveAccessorChain } from './accessor'

export function get<R extends object, T>(
  root: R,
  accessor: ((_: R) => T),
  defaultValue?: T,
): T {
  const chain = retrieveAccessorChain<R, T>(accessor)
  let obj: any = root
  let i = -1
  while (obj && ++i < chain.length) {
    obj = obj[chain[i]]
  }

  return obj === undefined ? defaultValue : obj
}
