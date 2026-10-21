import { strict as assert } from "node:assert";
import { test } from "node:test";
import { CalcError, evaluate } from "./calc.ts";

test("factorial retains finite boundary and basic values", () => {
  assert.equal(evaluate("0!"), 1);
  assert.equal(evaluate("1!"), 1);
  assert.equal(evaluate("170!"), 7.257415615307994e306);
});

test("oversized factorials reject without work proportional to the input", () => {
  for (const expression of ["171!", "1000000000000!", "170!!", "(10^100)!"]) {
    failsWith(expression, "notFinite");
  }
});

test("factorial domain errors remain distinct from overflow", () => {
  failsWith("(-1)!", "factorial");
  failsWith("1.5!", "factorial");
  assert.equal(evaluate("5!+2"), 122);
});

test("postfix factorial acts as a value for following operators and implicit multiplication", () => {
  assert.equal(evaluate("5!+2"), 122);
  assert.equal(evaluate("5!-2"), 118);
  assert.equal(evaluate("3!(2+1)"), 18);
  assert.equal(evaluate("3!pi"), 6 * Math.PI);
  assert.equal(evaluate("3!^2"), 36);
  assert.equal(evaluate("3!!"), 720);
});

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
