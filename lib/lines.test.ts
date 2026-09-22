import { strict as assert } from "node:assert";
import { test } from "node:test";
import { compareLists, removeDuplicateLines, sortLines } from "./lines.ts";

test("list comparison preserves each side's first spelling and order", () => {
  assert.deepEqual(compareLists(
    " Apple \nbanana\napple\npear\n", "apple\nCherry\ncherry\nbanana",
    { caseSensitive: false, trimWhitespace: true },
  ), {
    intersection: [" Apple ", "banana"],
    leftOnly: ["pear"],
    rightOnly: ["Cherry"],
    combined: [" Apple ", "banana", "pear", "Cherry"],
  });
});

test("list comparison honors case and whitespace settings", () => {
  const left = " Apple \nAPPLE";
  const right = "apple\nApple";
  assert.deepEqual(compareLists(left, right, { caseSensitive: true, trimWhitespace: false }), {
    intersection: [], leftOnly: [" Apple ", "APPLE"], rightOnly: ["apple", "Apple"],
    combined: [" Apple ", "APPLE", "apple", "Apple"],
  });
  assert.deepEqual(compareLists(left, right, { caseSensitive: true, trimWhitespace: true }).intersection, [" Apple "]);
  assert.deepEqual(compareLists(left, right, { caseSensitive: false, trimWhitespace: true }).intersection, [" Apple "]);
});

test("list comparison ignores blank lines and supports either side empty", () => {
  assert.deepEqual(compareLists("\n  \nA\r\nB\r", "", { caseSensitive: false, trimWhitespace: true }), {
    intersection: [], leftOnly: ["A", "B"], rightOnly: [], combined: ["A", "B"],
  });
  assert.deepEqual(compareLists("", "", { caseSensitive: false, trimWhitespace: true }), {
    intersection: [], leftOnly: [], rightOnly: [], combined: [],
  });
});

test("removeDuplicateLines keeps the first occurrence", () => {
  const result = removeDuplicateLines("apple\nbanana\napple", {
    caseSensitive: true,
    trimWhitespace: false,
    keepEmpty: true,
  });
  assert.deepEqual(result, { output: "apple\nbanana", removed: 1, kept: 2 });
});

test("duplicate matching can ignore case and surrounding whitespace", () => {
  const result = removeDuplicateLines(" Apple \napple\nAPPLE", {
    caseSensitive: false,
    trimWhitespace: true,
    keepEmpty: true,
  });
  assert.deepEqual(result, { output: " Apple ", removed: 2, kept: 1 });
});

test("empty lines can be dropped", () => {
  const result = removeDuplicateLines("a\n\nb\n", {
    caseSensitive: true,
    trimWhitespace: false,
    keepEmpty: false,
  });
  assert.deepEqual(result, { output: "a\nb", removed: 2, kept: 2 });
});

test("empty input is treated as zero lines", () => {
  const duplicateOptions = {
    caseSensitive: true,
    trimWhitespace: false,
    keepEmpty: false,
  };
  const sortOptions = {
    direction: "asc" as const,
    caseSensitive: true,
    numeric: false,
    trimWhitespace: false,
    removeDuplicates: false,
  };
  assert.deepEqual(removeDuplicateLines("", duplicateOptions), {
    output: "",
    removed: 0,
    kept: 0,
  });
  assert.deepEqual(sortLines("", sortOptions), { output: "", count: 0 });
});

test("sortLines sorts ascending or descending", () => {
  const options = {
    direction: "asc" as const,
    caseSensitive: false,
    numeric: false,
    trimWhitespace: false,
    removeDuplicates: false,
  };
  assert.equal(sortLines("Banana\napple\ncherry", options).output, "apple\nBanana\ncherry");
  assert.equal(
    sortLines("Banana\napple\ncherry", { ...options, direction: "desc" }).output,
    "cherry\nBanana\napple",
  );
});

test("numeric sort compares numbers as numbers", () => {
  assert.equal(
    sortLines("10\n2\n1", {
      direction: "asc",
      caseSensitive: true,
      numeric: true,
      trimWhitespace: true,
      removeDuplicates: false,
    }).output,
    "1\n2\n10",
  );
});

test("sortLines can remove duplicates before sorting", () => {
  assert.equal(
    sortLines("b\na\nB", {
      direction: "asc",
      caseSensitive: false,
      numeric: false,
      trimWhitespace: false,
      removeDuplicates: true,
    }).output,
    "a\nb",
  );
});
