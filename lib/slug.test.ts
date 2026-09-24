import { strict as assert } from "node:assert";
import { test } from "node:test";
import { generateSlug, type SlugOptions } from "./slug.ts";

const defaults: SlugOptions = {
  separator: "-",
  lowercase: true,
  collapseSeparators: true,
};

test("turns punctuation and repeated whitespace into one separator", () => {
  assert.equal(generateSlug("  Hello,   World!!  ", defaults), "hello-world");
  assert.equal(generateSlug("--a__b--", defaults), "a-b");
});

test("removes common Latin accents while preserving Chinese text", () => {
  assert.equal(generateSlug("Café déjà vu 你好 世界", defaults), "cafe-deja-vu-你好-世界");
  assert.equal(encodeURIComponent(generateSlug("中文 标题", defaults)), "%E4%B8%AD%E6%96%87-%E6%A0%87%E9%A2%98");
});

test("respects separator, casing and duplicate-separator settings", () => {
  assert.equal(generateSlug("Café 你好", { ...defaults, separator: "_", lowercase: false }), "Cafe_你好");
  assert.equal(generateSlug("A   B", { ...defaults, collapseSeparators: false }), "a---b");
  assert.equal(generateSlug("___A___", { ...defaults, separator: "_", collapseSeparators: false }), "a");
});

test("returns an empty slug when input has no letters or digits", () => {
  assert.equal(generateSlug("  !?  ", defaults), "");
  assert.equal(generateSlug("", defaults), "");
});
