import { strict as assert } from "node:assert";
import { test } from "node:test";
import { collectContainerPointers, findJsonNode, JSON_PATH_LIMITS, JsonPathError, nodePreview, nodeValueText, parseJsonTree, searchJsonTree } from "./json-path.ts";

function fails(fn: () => unknown, key: string) {
  assert.throws(fn, (error: unknown) => error instanceof JsonPathError && error.key === key);
}

test("builds object and array nodes with escaped JSON Pointers", () => {
  const { root, count } = parseJsonTree('{"a/b":{"~key":[true,null]},"":0}');
  assert.equal(count, 6);
  assert.equal(root.type, "object");
  assert.equal(findJsonNode(root, "/a~1b/~0key/0")?.value, true);
  assert.equal(findJsonNode(root, "/a~1b/~0key/1")?.type, "null");
  assert.equal(findJsonNode(root, "/")?.label, "");
});

test("supports root arrays and primitives", () => {
  const array = parseJsonTree('[{"id":1}]').root;
  assert.equal(array.type, "array");
  assert.equal(array.children[0].label, "[0]");
  assert.equal(array.children[0].pointer, "/0");
  const primitive = parseJsonTree('"hello"').root;
  assert.equal(primitive.type, "string");
  assert.equal(primitive.pointer, "");
  assert.equal(nodeValueText(primitive), '"hello"');
});

test("search matches object keys only and keeps ancestors visible", () => {
  const root = parseJsonTree('{"user":{"displayName":"Ada","roles":[{"name":"admin"}]},"other":"displayName"}').root;
  const result = searchJsonTree(root, "NAME");
  assert.equal(result.matches, 2);
  assert.deepEqual([...result.visible], ["/user/displayName", "/user/roles/0/name", "/user/roles/0", "/user/roles", "/user", ""]);
  assert.equal(searchJsonTree(root, "admin").matches, 0);
  assert.equal(searchJsonTree(root, " ").visible.size, 0);
});

test("collects expandable nodes and formats previews", () => {
  const root = parseJsonTree('{"items":[1,2],"empty":{},"long":"abcdefghij"}').root;
  assert.deepEqual([...collectContainerPointers(root)], ["", "/items"]);
  assert.equal(nodePreview(findJsonNode(root, "/items")!), "[2]");
  assert.equal(nodePreview(findJsonNode(root, "/empty")!), "{0}");
  assert.equal(nodePreview(findJsonNode(root, "/long")!, 8), '"abcdef…');
});

test("rejects invalid JSON and enforces character, depth and node limits", () => {
  fails(() => parseJsonTree("{"), "syntax");
  fails(() => parseJsonTree(`"${"x".repeat(JSON_PATH_LIMITS.characters)}"`), "tooLarge");
  let deep = "0";
  for (let index = 0; index <= JSON_PATH_LIMITS.depth; index += 1) deep = `{"a":${deep}}`;
  fails(() => parseJsonTree(deep), "tooDeep");
  const many = `[${Array.from({ length: JSON_PATH_LIMITS.nodes }, () => "0").join(",")}]`;
  fails(() => parseJsonTree(many), "tooMany");
});
