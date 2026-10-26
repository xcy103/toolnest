import { strict as assert } from "node:assert";
import { test } from "node:test";
import { jsonToYaml, JsonYamlError, yamlToJson } from "./json-yaml.ts";

test("empty and comment-only YAML documents produce JSON null", () => {
  for (const input of ["", "   \n", "# only a comment\n", "---\n# empty document\n"]) {
    assert.equal(yamlToJson(input), "null");
  }
});

test("nonfinite YAML numbers are rejected rather than silently converted to null", () => {
  for (const input of [".inf", "-.inf", ".nan", "a: [.inf, 1]", "outer:\n  value: .nan"]) {
    assert.throws(() => yamlToJson(input),
      (error) => error instanceof JsonYamlError && error.key === "nonFinite");
  }
});

test("quoted nonfinite-looking strings, finite numbers and explicit null stay valid", () => {
  assert.deepEqual(JSON.parse(yamlToJson('label: ".inf"\nnumber: 1.25\nempty: null\nitems: [2, 3]')), {
    label: ".inf", number: 1.25, empty: null, items: [2, 3],
  });
  assert.throws(() => yamlToJson("---\n# first\n---\n# second"),
    (error) => error instanceof JsonYamlError && error.key === "multipleDocs");
});

test("converts JSON objects to readable YAML", () => {
  assert.equal(
    jsonToYaml('{"name":"ToolNest","tags":["json","yaml"],"free":true}', 2),
    "name: ToolNest\ntags:\n  - json\n  - yaml\nfree: true\n",
  );
});

test("converts YAML mappings and sequences to formatted JSON", () => {
  assert.equal(
    yamlToJson("name: ToolNest\ncount: 32\ntags:\n  - json\n  - yaml\n", 2),
    '{\n  "name": "ToolNest",\n  "count": 32,\n  "tags": [\n    "json",\n    "yaml"\n  ]\n}',
  );
});

test("supports 4-space JSON output", () => {
  assert.equal(yamlToJson("a: 1\n", 4), '{\n    "a": 1\n}');
});

test("reports invalid JSON as a library error key", () => {
  assert.throws(
    () => jsonToYaml("{"),
    (err: unknown) => err instanceof JsonYamlError && err.key === "invalidJson",
  );
});

test("reports invalid YAML as a library error key", () => {
  assert.throws(
    () => yamlToJson("a: [1,"),
    (err: unknown) =>
      err instanceof JsonYamlError &&
      err.key === "invalidYaml" &&
      typeof err.values.message === "string",
  );
});

test("rejects multi-document YAML for a single JSON result", () => {
  assert.throws(
    () => yamlToJson("---\na: 1\n---\nb: 2\n"),
    (err: unknown) => err instanceof JsonYamlError && err.key === "multipleDocs",
  );
});
