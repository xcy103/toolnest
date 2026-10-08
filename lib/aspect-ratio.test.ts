import { strict as assert } from "node:assert";
import { test } from "node:test";
import { reduceAspectRatio, parseAspectInteger, solveAspectDimension, formatAspectValue } from "./aspect-ratio.ts";

test("reduces landscape, portrait, square and coprime dimensions", () => {
  assert.deepEqual(reduceAspectRatio(1920, 1080), [16, 9]);
  assert.deepEqual(reduceAspectRatio(1080, 1920), [9, 16]);
  assert.deepEqual(reduceAspectRatio(200, 200), [1, 1]);
  assert.deepEqual(reduceAspectRatio(17, 13), [17, 13]);
});
test("solves either missing dimension using the width:height convention", () => {
  assert.equal(solveAspectDimension(1920, 16, 9, "width", "nearest").value, 1080);
  assert.equal(solveAspectDimension(1080, 16, 9, "height", "nearest").value, 1920);
});
test("rounds fractional results explicitly, including half values and zero", () => {
  assert.equal(solveAspectDimension(100, 16, 9, "width", "floor").rounded, 56);
  assert.equal(solveAspectDimension(100, 16, 9, "width", "ceil").rounded, 57);
  assert.equal(solveAspectDimension(1, 2, 1, "width", "nearest").rounded, 1);
  assert.equal(solveAspectDimension(1, 16, 1, "width", "floor").rounded, 0);
  assert.equal(formatAspectValue(100 / 3), "33.333333");
});
test("rejects malformed, zero, decimal, nonfinite and oversized inputs/results", () => {
  for (const raw of ["", "0", "-1", "1.5", "1e3", "1000001", "Infinity"]) assert.throws(() => parseAspectInteger(raw));
  assert.equal(parseAspectInteger(" 1000000 "), 1000000);
  assert.throws(() => reduceAspectRatio(NaN, 1));
  assert.throws(() => solveAspectDimension(1000000, 1, 1000000, "width", "ceil"), /result/);
});
