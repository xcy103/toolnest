import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  convertPxRemInput,
  convertPxRemValue,
  formatPxRemNumber,
  parseRootSize,
  PX_REM_LIMITS,
  PxRemError,
} from "./px-rem.ts";

test("converts values in both directions with a configurable root", () => {
  assert.equal(convertPxRemValue(24, "pxToRem", 16), 1.5);
  assert.equal(convertPxRemValue(1.5, "remToPx", 20), 30);
  assert.equal(parseRootSize(" 18.5 "), 18.5);
});

test("formats decimals without floating-point noise or trailing zeroes", () => {
  assert.equal(formatPxRemNumber(0.1 + 0.2), "0.3");
  assert.equal(formatPxRemNumber(5 / 3), "1.6666666667");
  assert.equal(formatPxRemNumber(-0), "0");
});

test("converts one strict numeric value and appends the output unit", () => {
  assert.deepEqual(convertPxRemInput("16", "pxToRem", "16", false), {
    output: "1rem",
    count: 1,
  });
  assert.deepEqual(convertPxRemInput("-0.75", "remToPx", "16", false), {
    output: "-12px",
    count: 1,
  });
});

test("batch mode preserves blank lines and reports the converted count", () => {
  assert.deepEqual(convertPxRemInput("8\n\n16\n24\n", "pxToRem", "16", true), {
    output: "0.5rem\n\n1rem\n1.5rem\n",
    count: 3,
  });
});

test("reports the invalid batch line and rejects CSS syntax", () => {
  assert.throws(() => convertPxRemInput("16\n2rem\n32", "pxToRem", "16", true), (error) => {
    assert.ok(error instanceof PxRemError);
    assert.equal(error.key, "value");
    assert.equal(error.line, 2);
    return true;
  });
  assert.throws(() => convertPxRemInput("calc(16 + 2)", "pxToRem", "16", false));
});

test("validates the root size and value range", () => {
  for (const root of ["", "0", "-16", "1e2", String(PX_REM_LIMITS.root + 1)]) {
    assert.throws(() => parseRootSize(root), (error) => {
      assert.ok(error instanceof PxRemError);
      assert.equal(error.key, "root");
      return true;
    });
  }
  assert.throws(
    () => convertPxRemInput(String(PX_REM_LIMITS.value + 1), "pxToRem", "16", false),
    (error) => error instanceof PxRemError && error.key === "value",
  );
});

test("enforces batch count and character limits", () => {
  const tooMany = Array.from({ length: PX_REM_LIMITS.items + 1 }, () => "1").join("\n");
  assert.throws(
    () => convertPxRemInput(tooMany, "pxToRem", "16", true),
    (error) => error instanceof PxRemError && error.key === "tooMany",
  );
  assert.throws(
    () => convertPxRemInput("1".repeat(PX_REM_LIMITS.characters + 1), "pxToRem", "16", false),
    (error) => error instanceof PxRemError && error.key === "tooLarge",
  );
});
