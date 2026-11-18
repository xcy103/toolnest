import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decodeJwt, jwtClaimDate } from "./jwt.ts";

const segment = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

test("JWT timestamp dates support zero, negative and fractional seconds", () => {
  assert.equal(jwtClaimDate(0)?.toISOString(), "1970-01-01T00:00:00.000Z");
  assert.equal(jwtClaimDate(-1)?.toISOString(), "1969-12-31T23:59:59.000Z");
  assert.equal(jwtClaimDate(1.25)?.toISOString(), "1970-01-01T00:00:01.250Z");
});

test("JWT timestamp dates handle range limits without throwing", () => {
  assert.ok(jwtClaimDate(8_640_000_000_000));
  assert.ok(jwtClaimDate(-8_640_000_000_000));
  for (const seconds of [8_640_000_000_001, -8_640_000_000_001, 1e20, Number.NaN, Infinity]) {
    assert.equal(jwtClaimDate(seconds), null);
  }
});

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
