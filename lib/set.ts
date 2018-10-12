import { isEqual as objDeepEqual } from 'lodash'
import { retrieveAccessorChain } from './accessor'

const createSetForAccessorChain = <T, R>(
  root: R,
  accessors: Array<string | symbol>,
) => (value: T | ((_: T, root: R) => T)): R => {
  const currentNode: any = root

  if (accessors.length === 0) {
    // currentNode is the target
    const newNode: any =
      value instanceof Function ? value(currentNode, root) : value

    // Return currentNode if structural equality
    return objDeepEqual(currentNode, newNode) ? currentNode : newNode
  } else {
    // currentNode is a parent of the target
    const [key, ...nextAccessors] = accessors
    const newValue = createSetForAccessorChain(
      currentNode && currentNode[key],
      nextAccessors,
    )(value)

    if (currentNode) {
      // Return currentNode if new value is identical
      if (currentNode[key] === newValue) {
        return currentNode
      } else if (Array.isArray(currentNode)) {
        const copy = currentNode.slice()
        copy[key] = newValue
        return copy as any
      } else {
        return Object.assign(
          Object.create(Object.getPrototypeOf(currentNode)),
          currentNode,
          {
            [key]: newValue,
          },
        )
      }
    } else {
      if (typeof key === 'number') {
        const a = []
        a[key] = newValue
        return a as any
      } else {
        return {
          [key]: newValue,
        } as any
      }
    }
  }
}

export function set<R extends object, T>(
  root: R,
  accessor: ((_: R) => T),
): (newValue: T | ((_: T, root: R) => T)) => R {
  return createSetForAccessorChain(
    root,
    Array.isArray(accessor) ? accessor : retrieveAccessorChain<R, T>(accessor),
  )
}
