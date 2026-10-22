import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decodeHtmlEntities, encodeHtmlEntities } from "./html-entities.ts";

test("does not partially decode invalid decimal digit sequences", () => {
  const input = "&#65abc; &#12e3; &#169f; &#0a; &#ABC;";
  assert.equal(decodeHtmlEntities(input), input);
});

test("unknown named entities never read inherited object properties", () => {
  const input = "&constructor; &CONSTRUCTOR; &toString; &hasOwnProperty;";
  assert.equal(decodeHtmlEntities(input), input);
});

test("valid numeric forms still decode beside malformed or out-of-range input", () => {
  assert.equal(decodeHtmlEntities("&#65; &#x41; &#X41; &#128512; &#x1F600; &#65abc; &#1114112;"),
    "A A A \u{1F600} \u{1F600} &#65abc; &#1114112;");
  assert.equal(decodeHtmlEntities("&amp;constructor;"), "&constructor;");
});

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
