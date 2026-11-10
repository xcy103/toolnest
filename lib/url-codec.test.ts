import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decodeUrl, encodeUrl } from "./url-codec.ts";

test("URL conversion preserves whitespace and Unicode in both scopes", () => {
  for (const scope of ["component", "uri"] as const) {
    assert.equal(encodeUrl(" \n", scope), "%20%0A");
    assert.equal(decodeUrl(" %20hello%20 \n", scope), "  hello  \n");
    for (const text of ["", " \t\n", "你好 🌍", "\uFEFFhello", " a/b?x=1&y=2#end "]) {
      assert.equal(decodeUrl(encodeUrl(text, scope), scope), text);
    }
  }
});

test("URL scopes keep their delimiter rules and reject malformed escapes", () => {
  assert.equal(encodeUrl("a/b?x=1", "component"), "a%2Fb%3Fx%3D1");
  assert.equal(encodeUrl("a/b?x=1", "uri"), "a/b?x=1");
  assert.equal(decodeUrl("%2F%3F%26", "uri"), "%2F%3F%26");
  assert.equal(decodeUrl("+%2B", "component"), "++");
  for (const scope of ["component", "uri"] as const) {
    for (const input of ["%", "%GG", "%FF"]) assert.throws(() => decodeUrl(input, scope));
    assert.throws(() => encodeUrl("\uD800", scope));
  }
});
