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

test("ordered lists retain their first number and continue sequentially", () => {
  assert.equal(renderMarkdown("5. first\n9. next"), '<ol start="5"><li>first</li><li>next</li></ol>');
  assert.equal(renderMarkdown("0. zero\n1. one"), '<ol start="0"><li>zero</li><li>one</li></ol>');
  assert.equal(renderMarkdown("007. seven"), '<ol start="7"><li>seven</li></ol>');
});

test("ordered-list starts reset across blocks and stay within HTML integer bounds", () => {
  assert.equal(renderMarkdown("5. **first**\n\n1. reset\n- bullet\n3. third"),
    '<ol start="5"><li><strong>first</strong></li></ol>\n<ol><li>reset</li></ol>\n<ul><li>bullet</li></ul>\n<ol start="3"><li>third</li></ol>');
  assert.equal(renderMarkdown("2147483647. last"), '<ol start="2147483647"><li>last</li></ol>');
  assert.equal(renderMarkdown("2147483648. fallback"), '<ol><li>fallback</li></ol>');
});

test("inline code keeps emphasis and link syntax literal", () => {
  assert.equal(renderMarkdown("`**bold** *italic* [link](https://example.com)`"),
    "<p><code>**bold** *italic* [link](https://example.com)</code></p>");
});

test("protected code spans coexist with surrounding emphasis and real links", () => {
  assert.equal(renderMarkdown("**`*literal*`** and `**second**` and [real](https://example.com)"),
    '<p><strong><code>*literal*</code></strong> and <code>**second**</code> and <a href="https://example.com" target="_blank" rel="noopener noreferrer">real</a></p>');
});

test("inline code retains escaped HTML and cannot collide with source delimiters", () => {
  assert.equal(renderMarkdown('`<img src="x" onerror="bad()"> & **text**`'),
    "<p><code>&lt;img src=&quot;x&quot; onerror=&quot;bad()&quot;&gt; &amp; **text**</code></p>");
  assert.equal(renderMarkdown("\u00000\u0000 `*literal*`"),
    "<p>\u00000\u0000 <code>*literal*</code></p>");
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
