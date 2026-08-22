import { strict as assert } from "node:assert";
import { test } from "node:test";
import { CalcError, evaluate } from "./calc.ts";

/** Assert that evaluating `input` fails with a specific error key. */
function failsWith(input: string, key: string, degrees = false) {
  assert.throws(
    () => evaluate(input, degrees),
    (err: unknown) => err instanceof CalcError && err.key === key,
    `expected ${input} to fail with ${key}`,
  );
}

test("respects operator precedence", () => {
  assert.equal(evaluate("1+2*3"), 7);
  assert.equal(evaluate("(1+2)*3"), 9);
  assert.equal(evaluate("10 % 3"), 1);
});

test("exponentiation is right-associative", () => {
  // 2^(3^2) = 512, not (2^3)^2 = 64.
  assert.equal(evaluate("2^3^2"), 512);
});

test("handles unary minus", () => {
  assert.equal(evaluate("-3 + 5"), 2);
});

test("supports functions, constants and factorial", () => {
  assert.equal(evaluate("sqrt(16)"), 4);
  assert.equal(evaluate("log(100)"), 2);
  assert.equal(evaluate("5!"), 120);
  assert.equal(evaluate("pi"), Math.PI);
});

test("degree mode changes trigonometry", () => {
  assert.ok(Math.abs(evaluate("sin(30)", true) - 0.5) < 1e-12);
  assert.ok(Math.abs(evaluate("sin(30)") - Math.sin(30)) < 1e-12);
});

test("reports errors as identifiers, not sentences", () => {
  failsWith("   ", "empty");
  failsWith("2 @ 3", "badChar");
  failsWith("(1+2", "parens");
  failsWith("foo(2)", "unknownName");
  failsWith("1/0", "notFinite");
});
