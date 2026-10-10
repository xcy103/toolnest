import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseDuration, calculateDuration, formatDuration, formatDurationUnit, DURATION_MAX_SECONDS } from "./duration.ts";

test("parses bounded durations including zero and hours beyond a day", () => {
  assert.equal(parseDuration("00:00:00"), 0);
  assert.equal(parseDuration(" 25:01:02 "), 90062);
  assert.equal(parseDuration("1:00:00"), 3600);
  assert.equal(parseDuration("999999:59:59"), DURATION_MAX_SECONDS);
});
test("adds with carry without wrapping at 24 hours", () => {
  assert.equal(formatDuration(calculateDuration(parseDuration("23:59:59"), 2, "add")), "24:00:01");
  assert.equal(formatDuration(calculateDuration(DURATION_MAX_SECONDS, DURATION_MAX_SECONDS, "add")), "1999999:59:58");
});
test("subtracts with borrow and preserves signed results and zero", () => {
  assert.equal(formatDuration(calculateDuration(3600, 1, "subtract")), "00:59:59");
  assert.equal(formatDuration(calculateDuration(1, 3600, "subtract")), "-00:59:59");
  assert.equal(formatDuration(calculateDuration(10, 10, "subtract")), "00:00:00");
});
test("formats unit conversions with bounded decimal precision", () => {
  assert.equal(formatDurationUnit(90 / 60), "1.5");
  assert.equal(formatDurationUnit(1 / 3600), "0.000278");
  assert.equal(formatDurationUnit(-1 / 60), "-0.016667");
  assert.equal(formatDurationUnit(0), "0");
});
test("rejects malformed or out-of-range duration inputs and unsafe numbers", () => {
  for (const raw of ["", "1", "01:02", "01:60:00", "01:00:60", "-01:00:00", "1.5:00:00", "1000000:00:00", "01:1:00", "1e2:00:00"]) assert.throws(() => parseDuration(raw));
  for (const value of [-1, 0.5, NaN, Infinity, DURATION_MAX_SECONDS + 1]) assert.throws(() => calculateDuration(value, 0, "add"));
  assert.throws(() => formatDuration(Number.MAX_SAFE_INTEGER));
});
