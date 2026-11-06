import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  bmiCategory,
  bmiImperial,
  bmiMetric,
  formatCalculatorResult,
  percentageChange,
  percentageOf,
  percentageRatio,
} from "./everyday-calculators.ts";

test("calculates a percentage of a value", () => {
  assert.equal(percentageOf(15, 200), 30);
  assert.equal(percentageOf(-10, 50), -5);
});

test("calculates what percentage one value is of another", () => {
  assert.equal(percentageRatio(25, 200), 12.5);
  assert.ok(Number.isNaN(percentageRatio(1, 0)));
});

test("calculates percentage change in both directions", () => {
  assert.equal(percentageChange(80, 100), 25);
  assert.equal(percentageChange(100, 80), -20);
  assert.ok(Number.isNaN(percentageChange(0, 20)));
});

test("percentage change avoids intermediate overflow for large opposite signs", () => {
  for (const value of [1e308, Number.MAX_VALUE]) {
    assert.equal(percentageChange(-value, value), 200);
    assert.equal(percentageChange(value, -value), -200);
  }
  assert.equal(percentageChange(-1e308, 1.5e308), 250);
  assert.equal(percentageChange(1e308, -1.5e308), -250);
});

test("percentage change retains small deltas, negative baselines and invalid results", () => {
  assert.equal(percentageChange(1e16, 1e16 + 2), 2e-14);
  assert.equal(percentageChange(-80, -100), -25);
  assert.equal(percentageChange(-100, -80), 20);
  assert.ok(Number.isNaN(percentageChange(0, 1e308)));
  assert.equal(formatCalculatorResult(percentageChange(1e-308, 1e308)), "");
  assert.equal(formatCalculatorResult(percentageChange(Number.NaN, 100)), "");
  assert.equal(formatCalculatorResult(percentageChange(-1e308, 1e308)), "200");
});

test("calculates metric and imperial BMI", () => {
  assert.ok(Math.abs(bmiMetric(70, 175) - 22.8571) < 0.0001);
  // The customary imperial formula uses the rounded conversion factor 703.
  assert.ok(Math.abs(bmiImperial(154.324, 68.8976) - 22.8548) < 0.001);
  assert.ok(Number.isNaN(bmiMetric(70, 0)));
});

test("classifies BMI at the standard adult thresholds", () => {
  assert.equal(bmiCategory(18.4), "underweight");
  assert.equal(bmiCategory(18.5), "healthy");
  assert.equal(bmiCategory(25), "overweight");
  assert.equal(bmiCategory(30), "obesity");
  assert.equal(bmiCategory(Number.NaN), null);
});

test("formats finite results without floating-point noise", () => {
  assert.equal(formatCalculatorResult(0.1 + 0.2), "0.3");
  assert.equal(formatCalculatorResult(22.85714, 1), "22.9");
  assert.equal(formatCalculatorResult(Number.NaN), "");
});
