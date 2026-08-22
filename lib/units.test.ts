import { strict as assert } from "node:assert";
import { test } from "node:test";
import { CATEGORIES, convert, formatResult, unitSymbols } from "./units.ts";

const length = CATEGORIES.find((c) => c.key === "length")!;
const temperature = CATEGORIES.find((c) => c.temperature)!;

test("converts linear units through their base unit", () => {
  assert.equal(convert(length, 1, "km", "m"), 1000);
  assert.equal(convert(length, 1, "mi", "km"), 1.609344);
  // Going through the base unit costs a little precision — 12 in → ft comes out
  // as 0.9999999999999998 — which is exactly what formatResult exists to hide.
  assert.equal(formatResult(convert(length, 12, "in", "ft")), "1");
});

test("unknown units give NaN rather than a wrong number", () => {
  assert.ok(Number.isNaN(convert(length, 1, "??", "m")));
});

test("temperature is affine, not a simple factor", () => {
  assert.equal(convert(temperature, 100, "°C", "°F"), 212);
  assert.equal(convert(temperature, 0, "°C", "K"), 273.15);
  // The one temperature where the two scales meet.
  assert.equal(convert(temperature, -40, "°C", "°F"), -40);
});

test("every category exposes its symbols", () => {
  for (const category of CATEGORIES) {
    const symbols = unitSymbols(category);
    assert.ok(symbols.length >= 2, `${category.key} needs at least two units`);
    assert.equal(new Set(symbols).size, symbols.length, `${category.key} has duplicates`);
  }
});

test("formatting trims floating-point noise", () => {
  assert.equal(formatResult(0.1 + 0.2), "0.3");
  assert.equal(formatResult(0), "0");
  assert.equal(formatResult(Number.NaN), "");
});
