import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  parseUnixTimestamp,
  unixMilliseconds,
  unixSeconds,
  toLocalDatetimeInputValue,
} from "./timestamp.ts";

test("local datetime values retain milliseconds, including negative timestamps", () => {
  for (const ms of [1234, 1001, -1, -1234]) {
    const formatted = toLocalDatetimeInputValue(ms);
    assert.equal(new Date(formatted).getTime(), ms);
    assert.ok(/\.\d{3}$/.test(formatted));
  }
  assert.ok(!toLocalDatetimeInputValue(1000).includes("."));
});

test("local datetime years are padded for date input controls", () => {
  for (const year of [1, 99, 999, 2026, 10000]) {
    const date = new Date(0);
    date.setFullYear(year, 0, 2);
    date.setHours(3, 4, 5, 6);
    assert.equal(toLocalDatetimeInputValue(date.getTime()),
      `${String(year).padStart(4, "0")}-01-02T03:04:05.006`);
  }
});

test("invalid and nonpositive local years do not produce malformed control values", () => {
  for (const value of [NaN, Infinity, 8640000000000001]) assert.equal(toLocalDatetimeInputValue(value), "");
  const date = new Date(0);
  for (const year of [0, -1]) {
    date.setFullYear(year);
    assert.equal(toLocalDatetimeInputValue(date.getTime()), "");
  }
});

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
