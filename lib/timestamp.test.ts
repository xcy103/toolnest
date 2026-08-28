import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  parseUnixTimestamp,
  unixMilliseconds,
  unixSeconds,
} from "./timestamp.ts";

test("parses Unix seconds into milliseconds", () => {
  assert.deepEqual(parseUnixTimestamp("0", "seconds"), { ok: true, ms: 0 });
  assert.deepEqual(parseUnixTimestamp("1", "seconds"), { ok: true, ms: 1000 });
  assert.deepEqual(parseUnixTimestamp("-1", "seconds"), { ok: true, ms: -1000 });
});

test("parses Unix milliseconds directly", () => {
  assert.deepEqual(parseUnixTimestamp("1000", "milliseconds"), {
    ok: true,
    ms: 1000,
  });
});

test("rejects empty, decimal and non-numeric timestamps", () => {
  assert.deepEqual(parseUnixTimestamp("", "seconds"), { ok: false, key: "empty" });
  assert.deepEqual(parseUnixTimestamp("1.5", "seconds"), {
    ok: false,
    key: "integer",
  });
  assert.deepEqual(parseUnixTimestamp("abc", "milliseconds"), {
    ok: false,
    key: "integer",
  });
});

test("rejects timestamps outside JavaScript Date range", () => {
  assert.deepEqual(parseUnixTimestamp("8640000000000001", "milliseconds"), {
    ok: false,
    key: "range",
  });
  assert.deepEqual(parseUnixTimestamp("9007199254740992", "seconds"), {
    ok: false,
    key: "range",
  });
});

test("formats milliseconds back to Unix seconds and milliseconds", () => {
  assert.equal(unixSeconds(0), 0);
  assert.equal(unixSeconds(999), 0);
  assert.equal(unixSeconds(-1), -1);
  assert.equal(unixMilliseconds(1234.9), 1234);
});
