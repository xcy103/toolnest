import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  buildPattern,
  escapeLiteral,
  findMatches,
  replaceAll,
  ReplaceError,
  type ReplaceOptions,
} from "./replace.ts";

const literal: ReplaceOptions = { regex: false, caseSensitive: true, wholeWord: false };
const insensitive: ReplaceOptions = { ...literal, caseSensitive: false };
const wholeWord: ReplaceOptions = { ...literal, wholeWord: true };
const regex: ReplaceOptions = { ...literal, regex: true };

test("literal mode treats the search text literally", () => {
  assert.deepEqual(replaceAll("a b a", "a", "x", literal), { output: "x b x", count: 2 });
  assert.deepEqual(replaceAll("abc", "z", "x", literal), { output: "abc", count: 0 });
  assert.deepEqual(replaceAll("abc", "", "x", literal), { output: "abc", count: 0 });
  // A dot is a dot, not "any character".
  assert.deepEqual(replaceAll("a.c abc", ".", "-", literal), { output: "a-c abc", count: 1 });
  assert.deepEqual(replaceAll("cost: $5.00 (net)", "$5.00", "$6.00", literal), {
    output: "cost: $6.00 (net)",
    count: 1,
  });
});

test("literal mode also protects the replacement string", () => {
  // $& and $1 are replacement syntax; outside regex mode they must stay literal.
  assert.deepEqual(replaceAll("price", "price", "$& $1 $$", literal), {
    output: "$& $1 $$",
    count: 1,
  });
});

test("case sensitivity is honoured both ways", () => {
  assert.deepEqual(replaceAll("Cat cat CAT", "cat", "dog", insensitive), {
    output: "dog dog dog",
    count: 3,
  });
  assert.deepEqual(replaceAll("Cat cat", "cat", "dog", literal), {
    output: "Cat dog",
    count: 1,
  });
});

test("whole-word mode skips substrings", () => {
  assert.deepEqual(replaceAll("cat catalog concat cat.", "cat", "dog", wholeWord), {
    output: "dog catalog concat dog.",
    count: 2,
  });
  assert.deepEqual(replaceAll("(cat)", "cat", "dog", wholeWord), {
    output: "(dog)",
    count: 1,
  });
  // The alternation needs its own group, or only "cat" would get the boundaries.
  assert.deepEqual(
    replaceAll("cat dog catalog", "cat|dog", "pet", { ...wholeWord, regex: true }),
    { output: "pet pet catalog", count: 2 },
  );
});

test("regex mode keeps capture-group references", () => {
  assert.deepEqual(replaceAll("2026-08-19", "(\\d{4})-(\\d{2})-(\\d{2})", "$3/$2/$1", regex), {
    output: "19/08/2026",
    count: 1,
  });
  assert.deepEqual(replaceAll("a1 b2", "\\d", "[$&]", regex), {
    output: "a[1] b[2]",
    count: 2,
  });
});

test("zero-length matches terminate instead of looping", () => {
  assert.deepEqual(replaceAll("abc", "x*", "-", regex), { output: "-a-b-c-", count: 4 });
});

test("helpers behave", () => {
  assert.equal(escapeLiteral("a.b*c?"), "a\\.b\\*c\\?");
  assert.deepEqual(findMatches("aXbXc", /X/g), [
    { index: 1, length: 1 },
    { index: 3, length: 1 },
  ]);
});

test("an invalid pattern is reported, not thrown raw", () => {
  assert.throws(
    () => buildPattern("(unclosed", regex),
    (err: unknown) => err instanceof ReplaceError && err.key === "invalidPattern",
  );
});
