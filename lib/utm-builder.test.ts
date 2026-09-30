import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildUtmUrl, UTM_LIMITS, UtmError, type UtmFields } from "./utm-builder.ts";

const fields: UtmFields = { source: "newsletter", medium: "email", campaign: "fall launch", term: "", content: "hero button" };

function fails(input: string, values: UtmFields, key: string) {
  assert.throws(() => buildUtmUrl(input, values), (error: unknown) => error instanceof UtmError && error.key === key);
}

test("builds encoded UTM parameters and keeps the fragment", () => {
  assert.equal(
    buildUtmUrl("https://example.com/landing#details", fields),
    "https://example.com/landing?utm_source=newsletter&utm_medium=email&utm_campaign=fall+launch&utm_content=hero+button#details",
  );
});

test("preserves unrelated repeated and empty query parameters in order", () => {
  const output = buildUtmUrl("https://example.com/?tag=one&empty=&tag=two#top", fields);
  const url = new URL(output);
  assert.deepEqual(Array.from(url.searchParams).slice(0, 3), [["tag", "one"], ["empty", ""], ["tag", "two"]]);
  assert.equal(url.hash, "#top");
});

test("replaces every existing standard UTM key without touching similar or case-sensitive keys", () => {
  const output = buildUtmUrl("https://example.com/?utm_source=old&utm_source=older&utm_term=old&utm_extra=keep&UTM_SOURCE=keep", fields);
  const params = new URL(output).searchParams;
  assert.deepEqual(params.getAll("utm_source"), ["newsletter"]);
  assert.equal(params.has("utm_term"), false);
  assert.equal(params.get("utm_extra"), "keep");
  assert.equal(params.get("UTM_SOURCE"), "keep");
  assert.equal(params.get("utm_content"), "hero button");
});

test("trims field edges but preserves internal whitespace and Unicode", () => {
  const output = buildUtmUrl("https://例子.测试/活动", {
    source: "  微信  ", medium: " social post ", campaign: " 秋季  发布 ", term: " 新 工具 ", content: " 按钮 A ",
  });
  const params = new URL(output).searchParams;
  assert.equal(params.get("utm_source"), "微信");
  assert.equal(params.get("utm_campaign"), "秋季  发布");
  assert.equal(params.get("utm_content"), "按钮 A");
});

test("accepts HTTP and HTTPS while rejecting other schemes and relative input", () => {
  assert.ok(buildUtmUrl("http://example.com", fields).startsWith("http://"));
  fails("mailto:person@example.com", fields, "protocol");
  fails("javascript:alert(1)", fields, "protocol");
  fails("/relative", fields, "invalidUrl");
});

test("requires the destination and the three core campaign fields", () => {
  fails("", fields, "urlRequired");
  for (const key of ["source", "medium", "campaign"] as const) {
    fails("https://example.com", { ...fields, [key]: "   " }, "required");
  }
});

test("enforces field, URL and resulting parameter limits", () => {
  fails("x".repeat(UTM_LIMITS.urlCharacters + 1), fields, "urlTooLong");
  fails("https://example.com", { ...fields, source: "x".repeat(UTM_LIMITS.fieldCharacters + 1) }, "fieldTooLong");
  const query = Array.from({ length: UTM_LIMITS.parameters - 4 }, (_, index) => `k=${index}`).join("&");
  assert.ok(buildUtmUrl(`https://example.com/?${query}`, fields));
  fails(`https://example.com/?${query}&extra=1`, fields, "parameters");
});
