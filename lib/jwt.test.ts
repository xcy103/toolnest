import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decodeJwt } from "./jwt.ts";

const segment = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

test("JWT header and payload must be objects including when JSON is valid", () => {
  const object = segment({ alg: "none" });
  for (const value of [null, [], "text", 42, true]) {
    assert.throws(() => decodeJwt(`${object}.${segment(value)}.`));
    assert.throws(() => decodeJwt(`${segment(value)}.${object}.`));
  }
});

test("JWT decoding preserves Unicode objects and reports malformed segments", () => {
  const header = { alg: "none", typ: "JWT" };
  const payload = { name: "你好 🌍", exp: 0, nested: { items: [1, null] } };
  assert.deepEqual(decodeJwt(`${segment(header)}.${segment(payload)}.`), { header, payload });
  assert.deepEqual(decodeJwt(`${segment({})}.${segment({})}`), { header: {}, payload: {} });
  for (const token of ["", "a", "a.b", `${segment(header)}._w.`, `${segment(header)}.ew.`]) {
    assert.throws(() => decodeJwt(token));
  }
});
