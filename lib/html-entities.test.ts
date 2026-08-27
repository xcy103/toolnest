import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decodeHtmlEntities, encodeHtmlEntities } from "./html-entities.ts";

test("encodes structural HTML characters", () => {
  assert.equal(
    encodeHtmlEntities(`<a href="x?a=1&b=2">It's ok</a>`),
    "&lt;a href=&quot;x?a=1&amp;b=2&quot;&gt;It&#39;s ok&lt;/a&gt;",
  );
});

test("keeps regular unicode readable when encoding", () => {
  assert.equal(encodeHtmlEntities("中文 😀 café"), "中文 😀 café");
});

test("decodes common named entities", () => {
  assert.equal(
    decodeHtmlEntities("&lt;strong&gt;A&amp;B&quot;&#39;&lt;/strong&gt;"),
    "<strong>A&B\"'</strong>",
  );
});

test("decodes decimal and hexadecimal numeric entities", () => {
  assert.equal(decodeHtmlEntities("&#169; &#x1f600;"), "\u00a9 😀");
});

test("unknown or malformed entities stay unchanged", () => {
  assert.equal(decodeHtmlEntities("&madeup; &#xzz; &amp"), "&madeup; &#xzz; &amp");
});

test("decoding is one layer at a time", () => {
  assert.equal(decodeHtmlEntities("&amp;lt;"), "&lt;");
});
