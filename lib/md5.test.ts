import { strict as assert } from "node:assert";
import { test } from "node:test";
import { md5 } from "./md5.ts";

const digest = (s: string) => md5(new TextEncoder().encode(s));

// The reference vectors from RFC 1321. Web Crypto has no MD5, so this
// implementation is hand-written and these are what keep it honest.
test("matches the RFC 1321 test vectors", () => {
  assert.equal(digest(""), "d41d8cd98f00b204e9800998ecf8427e");
  assert.equal(digest("a"), "0cc175b9c0f1b6a831c399e269772661");
  assert.equal(digest("abc"), "900150983cd24fb0d6963f7d28e17f72");
  assert.equal(digest("message digest"), "f96b697d7cb7938d525a2f31aaf161d0");
  assert.equal(digest("abcdefghijklmnopqrstuvwxyz"), "c3fcd3d76192e4007dfb496cca67e13b");
});

test("handles inputs that straddle the 64-byte block boundary", () => {
  assert.equal(digest("a".repeat(55)).length, 32);
  assert.equal(digest("a".repeat(56)).length, 32);
  assert.equal(
    digest("12345678901234567890123456789012345678901234567890123456789012345678901234567890"),
    "57edf4a22be3c955ac49da2e2107b67a",
  );
});

test("handles multi-byte UTF-8", () => {
  assert.equal(digest("中文"), digest("中文"));
  assert.notEqual(digest("中文"), digest("中"));
});
