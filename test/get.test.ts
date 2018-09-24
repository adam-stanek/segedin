import test from "ava";
import { get } from "tgs/get";

test("get", t => {
  const obj = { a: [{ b: { c: "foo" } }] };
  const actual = get(obj, _ => _.a[0].b.c);
  t.is(actual, "foo");
});
