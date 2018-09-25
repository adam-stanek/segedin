import test from 'ava'
import { get as g } from 'tgs/get'

test('get', t => {
  const obj = { a: [{ b: { c: 'foo' } }] }
  const actual = g(obj, _ => _.a[0].b.c)
  t.is(actual, 'foo')
})
