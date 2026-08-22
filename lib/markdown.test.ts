import { strict as assert } from "node:assert";
import { test } from "node:test";
import { renderMarkdown } from "./markdown.ts";

test("renders block elements", () => {
  assert.equal(renderMarkdown("# H1\n## H2"), "<h1>H1</h1>\n<h2>H2</h2>");
  assert.equal(renderMarkdown("- a\n- b"), "<ul><li>a</li><li>b</li></ul>");
  assert.equal(renderMarkdown("1. a\n2. b"), "<ol><li>a</li><li>b</li></ol>");
  assert.equal(renderMarkdown("> quoted"), "<blockquote>quoted</blockquote>");
  assert.equal(renderMarkdown("```\ncode\n```"), "<pre><code>code</code></pre>");
  assert.equal(renderMarkdown("---"), "<hr>");
  assert.equal(renderMarkdown("a\n\nb"), "<p>a</p>\n<p>b</p>");
});

test("renders inline elements", () => {
  assert.equal(renderMarkdown("**b** and `c`"), "<p><strong>b</strong> and <code>c</code></p>");
  assert.equal(renderMarkdown("*em*"), "<p><em>em</em></p>");
});

// The renderer escapes HTML before parsing, so raw markup can never reach the DOM.
test("neutralises embedded HTML", () => {
  assert.equal(
    renderMarkdown("<script>alert(1)</script>"),
    "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
  );
  assert.ok(!renderMarkdown("<img src=x onerror=alert(1)>").includes("<img"));
});

test("only links safe URL schemes", () => {
  assert.ok(renderMarkdown("[x](https://example.com)").includes('href="https://example.com"'));
  assert.ok(renderMarkdown("[x](/local)").includes('href="/local"'));
  // A javascript: URL is left as plain text rather than becoming a link.
  const dangerous = renderMarkdown("[x](javascript:alert(1))");
  assert.ok(!dangerous.includes("<a "));
  assert.ok(dangerous.includes("javascript:alert(1)"));
});
