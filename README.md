# Segedin

Type-safe getters/setters for nested object structures


```.ts
import { set, get } from 'segedin'

// Setting deeply nested property
const obj = { a: { b: { c: 42 } } }
const updatedObj = set(obj, _ => _.a.b.c)(42)

// Getting nested property
const obj2 = { a: [{ b: { c: 'foo' } }] }
const value = get(obj2, _ => _.a[0].b.c) // 'foo'
const value2 = get(obj2, _ => _.a[1].b.c) // undefined
const value3 = get(obj2, _ => _.a[1].b.c, 'default') // 'default'
```
