import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decodeBase64, encodeBase64 } from "./base64.ts";

test("Base64 encodes whitespace-only text without discarding it", () => {
  for (const [text, encoded] of [[" ", "IA=="], ["\n", "Cg=="], ["\t", "CQ=="], [" \n", "IAo="]]) {
    assert.equal(encodeBase64(text), encoded);
    assert.equal(decodeBase64(encoded), text);
  }
  assert.equal(encodeBase64(""), "");
  assert.equal(decodeBase64(""), "");
});

test("UTF-8 Base64 round trips preserve Unicode and leading BOM characters", () => {
  assert.equal(decodeBase64("77u/aGVsbG8="), "\uFEFFhello");
  for (const text of ["你好 🌍", "\uFEFF", "\uFEFF\uFEFFhello", " a\r\nb\t", "\u0000"]) {
    assert.equal(decodeBase64(encodeBase64(text)), text);
  }
});

test("Base64 decoding tolerates pasted whitespace but rejects malformed data", () => {
  assert.equal(decodeBase64(" aG Vs\nbG8=\r\n"), "hello");
  for (const input of ["%%%", "a", "/w==", "wyg="]) {
    assert.throws(() => decodeBase64(input));
  }
});
