interface Accessor {
  chain: Array<string | symbol>;
  properties: {
    [k: string]: {
      accessor: Accessor;
      proxy: any;
    };
  };
}

const ACCESSOR_PROP_NAME = Symbol("accessor");

const ProxyHandlers: ProxyHandler<Accessor> = {
  get(accessorObj: Accessor, propName: string | symbol) {
    if (propName === ACCESSOR_PROP_NAME) {
      return accessorObj;
    }

    if (!accessorObj.properties[propName as string]) {
      const childAccessor = {
        chain: [...accessorObj.chain, propName],
        properties: {}
      };

      accessorObj.properties[propName as string] = {
        accessor: childAccessor,
        proxy: new Proxy(childAccessor, ProxyHandlers)
      };
    }

    return accessorObj.properties[propName as string].proxy;
  }
};

export function retrieveAccessorChain<R extends object, T>(
  callback: (_: Readonly<R>) => T
): Array<string | symbol> {
  const result = callback(new Proxy(
    {
      chain: [],
      properties: {}
    },
    ProxyHandlers
  ) as any) as any;

  return result[ACCESSOR_PROP_NAME].chain;
}
