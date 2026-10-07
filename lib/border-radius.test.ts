import { strict as assert } from "node:assert";
import { test } from "node:test";
import { borderRadiusValue, updateCorner } from "./border-radius.ts";

test("compresses all four CSS shorthand cases without changing corner order", () => {
  assert.equal(borderRadiusValue([12, 12, 12, 12], "px"), "12px");
  assert.equal(borderRadiusValue([10, 20, 10, 20], "px"), "10px 20px");
  assert.equal(borderRadiusValue([10, 20, 30, 20], "%"), "10% 20% 30%");
  assert.equal(borderRadiusValue([10, 20, 30, 40], "px"), "10px 20px 30px 40px");
});

test("linked updates affect every corner and independent updates preserve others", () => {
  assert.deepEqual(updateCorner([1, 2, 3, 4], 1, 8, false), [1, 8, 3, 4]);
  assert.deepEqual(updateCorner([1, 2, 3, 4], 1, 8, true), [8, 8, 8, 8]);
});

test("accepts zero and limits, rejects invalid and nonfinite radii", () => {
  assert.equal(borderRadiusValue([0, 200, 200, 0], "px"), "0px 200px 200px 0px");
  for (const v of [-1, 101, NaN, Infinity]) {
    assert.throws(() => borderRadiusValue([v, 0, 0, 0], "%"), RangeError);
  }
});
