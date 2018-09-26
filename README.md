# Segedin

Type-safe getters/setters for nested object structures.

## Example usage

```.ts
import { set, get } from 'segedin'

// Setting deeply nested property
const obj = { a: { b: { c: 40 } } }
const updatedObj = set(obj, _ => _.a.b.c)(42)
const updatedObj2 = set(obj, _ => _.a.b.c)((value) => value + 1)

// Getting nested property
const obj2 = { a: [{ b: { c: 'foo' } }] }
const value = get(obj2, _ => _.a[0].b.c) // 'foo'
const value2 = get(obj2, _ => _.a[1].b.c) // undefined
const value3 = get(obj2, _ => _.a[1].b.c, 'default') // 'default'
```

## About the project

This library aims to provide helpers for two use-cases:

1. Accessing deeply nested data with possibly null properties in the access chain. This problem is commonly referenced as Optional chaining and hopefully it should by covered by one of upcoming ES standards ([Proposal](https://github.com/tc39/proposal-optional-chaining)). The goal of this library is to provide type-safe way of how to do it until it lands.
2. Setting deeply nested properties on plain immutable objects in type-safe manner.

## Why?

I had to adopt older project with complex API models depending heavily on lodash get/set functions for accessing deeply nested data. Once we started migrating project to TS we had to get rid of it to not break type-safety.

There are several existing solutions with similar idea (for example [idx](https://github.com/facebookincubator/idx)) but they haven't satisfied all my requirements:

1. I want to benefit from Typescript (and avoid Babel transpilation).
2. I want to provide legacy solution for IE11 which doesn't provide native Proxy support.
3. I want to create performant solution so that the helpers can be used across the application.

## How does this project differ from others?

This library comes with 2 flavours. There is a plain JS implementation (Proxy based) which can be used without
Typescript (ie. in legacy projects). And there is also bundled Typescript transformer which compiles
the helper calls into effective JS code to optimize any performance hits and possible polyfill requirements for Proxy (IE). Both solutions are functionally equal.

## How to use Typescript transform

To get the best out of this library I recommend to use it together with bundled Typescript transform. The usage depends on the way you use Typescript in your project so I will refer you to documentation of common options:

**Node:**

- [ttypescript](https://github.com/cevek/ttypescript)
- [ts-node](https://github.com/TypeStrong/ts-node#programmatic-only-options)

**Webpack:**

- [ts-loader](https://github.com/TypeStrong/ts-loader#getcustomtransformers-----before-transformerfactory-after-transformerfactory--)
- [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader#getcustomtransformers-string--program-tsprogram--tscustomtransformers--undefined-defaultundefined)

## Performance considerations

This library is meant as a replacement for lodash set / get helpers which come with decent performance hit. Their accessor has to be constructed from string (unless array is used) and that comes with a price of parsing it before walking the object.

This library is implemented using Proxy which has it's own drawbacks. It is computationally cheaper but it requires bigger memory footprint (lambda, Proxy itself, accessor objects).

I would not expect the performance to differ significantly (TODO: needs benchmarks). The only issue may be IE 11 which comes with additional overhead because of required Proxy polyfill.

If it is used together with bundled TS transformation there is no need for Proxy. The get operation are transformed to index access without any helper which offers best possible performance. The set operation still uses helper function but it receives serialized chain so any performance costs for constructing it is eliminated.

## Similar projects

- [idx](https://github.com/facebookincubator/idx)
- [monocle-ts](https://github.com/gcanti/monocle-ts)

## Who uses Segedin

- [Ataccama Software, s.r.o.](https://www.ataccama.com/)
- [V3Net.cz, s.r.o.](http://www.v3net.cz)

## Credits

My thanks to [@bufi](https://github.com/bufi) for awesome project name :)