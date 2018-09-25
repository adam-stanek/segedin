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
    const newValue = createSetForAccessorChain(currentNode[key], nextAccessors)(
      value,
    )

    // Return currentNode if identity equality
    return currentNode[key] === newValue
      ? currentNode
      : Array.isArray(currentNode)
        ? [
            ...currentNode.slice(0, Number(key)),
            newValue,
            ...currentNode.slice(Number(key) + 1),
          ]
        : Object.assign(
            Object.create(Object.getPrototypeOf(currentNode)),
            currentNode,
            {
              [key]: newValue,
            },
          )
  }
}

export function set<R extends object, T>(
  root: Readonly<R>,
  accessor: ((_: Readonly<R>) => T),
): (newValue: T | ((_: T, root: R) => T)) => R {
  return createSetForAccessorChain(
    root,
    Array.isArray(accessor) ? accessor : retrieveAccessorChain<R, T>(accessor),
  )
}
