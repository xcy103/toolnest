import { strict as assert } from "node:assert";
import { test } from "node:test";
import { flattenJson, flattenJsonText, JSON_FLAT_LIMITS, JsonFlatError, unflattenJson, unflattenJsonText, type JsonValue } from "./json-flat.ts";

function fails(fn: () => unknown, key: string) {
  assert.throws(fn, (error: unknown) => error instanceof JsonFlatError && error.key === key);
}

test("flattens with JSON Pointer escaping and explicit container markers", () => {
  const value = { "a/b": { "~key": [1, { "": true }] }, emptyObject: {}, emptyArray: [] };
  assert.deepEqual({ ...flattenJson(value) }, {
    "": {}, "/a~1b": {}, "/a~1b/~0key": [], "/a~1b/~0key/0": 1,
    "/a~1b/~0key/1": {}, "/a~1b/~0key/1/": true, "/emptyObject": {}, "/emptyArray": [],
  });
});

test("round trips nested objects, arrays, empty containers and root primitives", () => {
  const values: JsonValue[] = [
    { users: [{ id: 1, tags: ["a", "b"] }, null], settings: {}, list: [] },
    { "": { "0": "object key" }, "a/b~c": false },
    [0, "", false, null, [], {}], null, true, 42, "root",
  ];
  for (const value of values) assert.deepEqual(unflattenJson(flattenJson(value)), value);
});

test("text helpers format both directions", () => {
  assert.equal(flattenJsonText('{"a":[1]}'), '{\n  "": {},\n  "/a": [],\n  "/a/0": 1\n}');
  assert.equal(unflattenJsonText('{"":{},"/a":[],"/a/0":1}'), '{\n  "a": [\n    1\n  ]\n}');
});

test("rejects invalid JSON and non-map or missing-root flat input", () => {
  fails(() => flattenJsonText("{"), "syntax");
  fails(() => unflattenJsonText("[]"), "flatRoot");
  fails(() => unflattenJson({ "/a": 1 }), "rootMissing");
});

test("rejects malformed pointers, nonempty markers and missing parents", () => {
  fails(() => unflattenJson({ "": {}, "/bad~2key": 1 }), "pointer");
  fails(() => unflattenJson({ "": {}, "/a": { nested: true } }), "marker");
  fails(() => unflattenJson({ "": {}, "/a/b": 1 }), "parent");
  fails(() => unflattenJson({ "": 1, "/a": 2 }), "conflict");
});

test("validates array indices and rejects sparse arrays", () => {
  fails(() => unflattenJson({ "": [], "/01": "x" }), "arrayIndex");
  fails(() => unflattenJson({ "": [], "/-": "x" }), "arrayIndex");
  fails(() => unflattenJson({ "": [], "/4294967294": "x" }), "arrayIndex");
  fails(() => unflattenJson({ "": [], "/1": "x" }), "arrayGap");
  assert.deepEqual(unflattenJson({ "": [], "/1": "b", "/0": "a" }), ["a", "b"]);
});

test("handles __proto__ as data without changing object prototypes", () => {
  const input = JSON.parse('{"":{},"/__proto__":{},"/__proto__/safe":true}') as JsonValue;
  const result = unflattenJson(input) as Record<string, JsonValue>;
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.deepEqual(result["__proto__"], { safe: true });
  assert.equal(({} as Record<string, unknown>)["safe"], undefined);
});

test("enforces character, depth and entry limits", () => {
  fails(() => flattenJsonText(`"${"x".repeat(JSON_FLAT_LIMITS.characters)}"`), "tooLarge");
  let deep: JsonValue = 1;
  for (let index = 0; index <= JSON_FLAT_LIMITS.depth; index += 1) deep = { a: deep };
  fails(() => flattenJson(deep), "tooDeep");
  const many: Record<string, JsonValue> = {};
  for (let index = 0; index < JSON_FLAT_LIMITS.entries; index += 1) many[String(index)] = index;
  fails(() => flattenJson(many), "tooMany");
});
