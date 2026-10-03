import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  escapeJsonString,
  JSON_STRING_LIMIT,
  JsonStringError,
  unescapeJsonString,
} from "./json-string.ts";

test("escapes quotes, backslashes and control characters as a JSON string", () => {
  assert.equal(
    escapeJsonString('Line 1\n\t"C:\\Tools"\b'),
    '"Line 1\\n\\t\\"C:\\\\Tools\\"\\b"',
  );
});

test("keeps regular Unicode readable and round-trips it", () => {
  const text = "中文 😀 café";
  assert.equal(escapeJsonString(text), '"中文 😀 café"');
  assert.equal(unescapeJsonString(escapeJsonString(text)), text);
});

test("unescapes valid JSON escapes and permits surrounding JSON whitespace", () => {
  assert.equal(unescapeJsonString('  "first\\nsecond\\t\\u4e2d\\u6587"\n'), "first\nsecond\t中文");
  assert.equal(unescapeJsonString('""'), "");
});

test("rejects invalid or incomplete JSON string literals", () => {
  for (const input of ['"bad\\q"', '"unterminated', "plain text", "'single quoted'"]) {
    assert.throws(() => unescapeJsonString(input), (error) => {
      assert.ok(error instanceof JsonStringError);
      assert.equal(error.key, "syntax");
      return true;
    });
  }
});

test("rejects valid JSON values that are not strings", () => {
  for (const input of ["null", "42", "true", "[]", "{}"]) {
    assert.throws(() => unescapeJsonString(input), (error) => {
      assert.ok(error instanceof JsonStringError);
      assert.equal(error.key, "notString");
      return true;
    });
  }
});

test("enforces the character limit in both directions", () => {
  const oversized = "a".repeat(JSON_STRING_LIMIT + 1);
  for (const operation of [() => escapeJsonString(oversized), () => unescapeJsonString(oversized)]) {
    assert.throws(operation, (error) => {
      assert.ok(error instanceof JsonStringError);
      assert.equal(error.key, "tooLarge");
      return true;
    });
  }
});
