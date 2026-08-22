import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  contrastRatio,
  hslToRgb,
  parseHex,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
} from "./color.ts";

test("parses long and short hex", () => {
  assert.deepEqual(parseHex("#ff0000"), { r: 255, g: 0, b: 0 });
  assert.deepEqual(parseHex("#f0a"), { r: 255, g: 0, b: 170 });
  assert.equal(parseHex("nope"), null);
});

test("hex round-trips", () => {
  const rgb = { r: 18, g: 52, b: 86 };
  assert.equal(rgbToHex(rgb), "#123456");
  assert.deepEqual(parseHex(rgbToHex(rgb)), rgb);
});

test("converts between rgb and hsl", () => {
  assert.deepEqual(rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  assert.deepEqual(hslToRgb({ h: 120, s: 100, l: 50 }), { r: 0, g: 255, b: 0 });
  // Grey has no hue and no saturation.
  assert.deepEqual(rgbToHsl({ r: 128, g: 128, b: 128 }).s, 0);
});

test("hsl round-trip stays within rounding noise", () => {
  const original = { r: 34, g: 139, b: 34 };
  const back = hslToRgb(rgbToHsl(original));
  for (const channel of ["r", "g", "b"] as const) {
    assert.ok(Math.abs(back[channel] - original[channel]) <= 2);
  }
});

test("computes WCAG luminance and contrast", () => {
  assert.equal(relativeLuminance({ r: 255, g: 255, b: 255 }), 1);
  assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  // Black on white is the maximum possible ratio, and order must not matter.
  assert.equal(contrastRatio(black, white), 21);
  assert.equal(contrastRatio(white, black), 21);
  assert.equal(contrastRatio(white, white), 1);
  // #767676 is the classic "just passes AA on white" grey.
  const ratio = contrastRatio({ r: 118, g: 118, b: 118 }, white);
  assert.ok(ratio > 4.5 && ratio < 4.6);
});
