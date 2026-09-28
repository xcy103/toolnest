import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseUrl, URL_PARSER_LIMITS, UrlParserError } from "./url-parser.ts";

function fails(input: string, key: string, base = "") {
  assert.throws(() => parseUrl(input, base), (error: unknown) => error instanceof UrlParserError && error.key === key);
}

test("URL parser splits and normalizes an absolute URL", () => {
  const result = parseUrl(" HTTPS://Example.COM:443/a/../docs?q=hello%20world#top ");
  assert.equal(result.href, "https://example.com/docs?q=hello%20world#top");
  assert.equal(result.protocol, "https:");
  assert.equal(result.origin, "https://example.com");
  assert.equal(result.hostname, "example.com");
  assert.equal(result.port, "");
  assert.equal(result.pathname, "/docs");
  assert.equal(result.search, "?q=hello%20world");
  assert.equal(result.hash, "#top");
});

test("URL parser preserves ordered repeated keys and empty values", () => {
  const result = parseUrl("https://example.com/?tag=a&tag=b&empty=&flag&=value&__proto__=safe");
  assert.deepEqual(result.parameters, [["tag", "a"], ["tag", "b"], ["empty", ""], ["flag", ""], ["", "value"], ["__proto__", "safe"]]);
});

test("URL parser decodes form query encoding once without rewriting the source", () => {
  const result = parseUrl("https://example.com/?q=hello+world&literal=%2B&word=%E4%BD%A0%E5%A5%BD&once=%252F");
  assert.deepEqual(result.parameters, [["q", "hello world"], ["literal", "+"], ["word", "你好"], ["once", "%2F"]]);
  assert.ok(result.search.includes("hello+world"));
});

test("URL parser resolves directory, file, network and query references against a base", () => {
  assert.equal(parseUrl("../docs?q=1", "https://example.com/app/page").href, "https://example.com/docs?q=1");
  assert.equal(parseUrl("child", "https://example.com/app/").pathname, "/app/child");
  assert.equal(parseUrl("child", "https://example.com/app").pathname, "/child");
  assert.equal(parseUrl("//other.example/path", "https://example.com").href, "https://other.example/path");
  assert.equal(parseUrl("?x=2", "https://example.com/a?x=1#top").href, "https://example.com/a?x=2");
  assert.equal(parseUrl("child", "file:///tmp/").href, "file:///tmp/child");
});

test("URL parser handles IPv6, credentials and international hosts", () => {
  const result = parseUrl("https://user:pa%24s@[::1]:8443/a");
  assert.equal(result.hostname, "[::1]");
  assert.equal(result.port, "8443");
  assert.equal(result.username, "user");
  assert.equal(result.password, "pa%24s");
  const international = parseUrl("https://例子.测试/你好");
  assert.equal(international.hostname, "xn--fsqu00a.xn--0zwm56d");
  assert.equal(international.pathname, "/%E4%BD%A0%E5%A5%BD");
});

test("URL parser inspects opaque schemes without navigating to them", () => {
  const result = parseUrl("mailto:person@example.com?subject=Hello");
  assert.equal(result.origin, "null");
  assert.equal(result.pathname, "person@example.com");
  assert.deepEqual(result.parameters, [["subject", "Hello"]]);
  assert.equal(parseUrl("javascript:alert(1)").protocol, "javascript:");
});

test("URL parser rejects missing/invalid URLs and unusable bases", () => {
  fails(" ", "empty");
  fails("/relative", "invalid");
  fails("example.com", "invalid");
  fails("https://[broken", "invalid");
  fails("https://example.com", "base", "not-a-url");
  fails("child", "base", "mailto:person@example.com");
});

test("URL parser enforces input and parameter limits", () => {
  fails("x".repeat(URL_PARSER_LIMITS.characters + 1), "tooLong");
  fails("https://example.com", "tooLong", "x".repeat(URL_PARSER_LIMITS.characters + 1));
  const query = Array.from({ length: URL_PARSER_LIMITS.parameters }, (_, index) => `key=${index}`).join("&");
  assert.equal(parseUrl(`https://example.com/?${query}`).parameters.length, 200);
  fails(`https://example.com/?${query}&extra=1`, "parameters");
});
