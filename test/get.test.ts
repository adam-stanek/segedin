import test from 'ava'
import { get as g } from 'segedin/get'

test('get', t => {
  const obj = { a: [{ b: { c: 'foo' } }] }
  const actual = g(obj, _ => _.a[0].b.c)
  t.is(actual, 'foo')
})

test('get with undefined value', t => {
  const obj = { a: [{ b: { c: 'foo' } }] }
  const actual = g(obj, _ => _.a[1].b.c)
  t.is(actual, undefined)
})

test('get with default value', t => {
  const obj = { a: [{ b: { c: 'foo' } }] }
  const actual = g(obj, _ => _.a[1].b.c, 'default')
  t.is(actual, 'default')
})
