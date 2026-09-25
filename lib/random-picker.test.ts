import { strict as assert } from "node:assert";
import { test } from "node:test";
import { drawPickerEntries, parsePickerEntries } from "./random-picker.ts";

test("parses trimmed nonblank lines and optionally removes exact duplicates", () => {
  const text = " Ada \r\n\r\nAda\nada\rLin ";
  assert.deepEqual(parsePickerEntries(text, true), {
    inputCount: 4,
    pool: ["Ada", "ada", "Lin"],
  });
  assert.deepEqual(parsePickerEntries(text, false).pool, ["Ada", "Ada", "ada", "Lin"]);
});

test("draws without replacement and leaves the candidate pool unchanged", () => {
  const pool = ["Ada", "Grace", "Lin"];
  const draws = drawPickerEntries(pool, 3, true, (max) => max - 1);
  assert.deepEqual(draws, ["Lin", "Ada", "Grace"]);
  assert.deepEqual(pool, ["Ada", "Grace", "Lin"]);
});

test("draws with replacement when requested", () => {
  assert.deepEqual(drawPickerEntries(["Ada", "Grace"], 3, false, () => 1), [
    "Grace", "Grace", "Grace",
  ]);
});

test("rejects impossible draws", () => {
  assert.throws(() => drawPickerEntries([], 1, true, () => 0), RangeError);
  assert.throws(() => drawPickerEntries(["Ada"], 2, true, () => 0), RangeError);
  assert.throws(() => drawPickerEntries(["Ada"], 0, false, () => 0), RangeError);
  assert.throws(() => drawPickerEntries(["Ada"], 101, false, () => 0), RangeError);
});
