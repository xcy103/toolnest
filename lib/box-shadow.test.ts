import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  boxShadowDeclaration,
  boxShadowValue,
  BOX_SHADOW_LIMITS,
  BoxShadowError,
  type ShadowLayer,
  shadowLayerCss,
} from "./box-shadow.ts";

const base: ShadowLayer = {
  x: 0,
  y: 12,
  blur: 28,
  spread: -8,
  color: "#0f172a",
  opacity: 30,
  inset: false,
};

test("builds a complete shadow layer with rgba opacity", () => {
  assert.equal(shadowLayerCss(base), "0px 12px 28px -8px rgba(15, 23, 42, 0.3)");
});

test("supports inset shadows and normalizes short hex colors", () => {
  assert.equal(
    shadowLayerCss({ ...base, color: "#f00", opacity: 75, inset: true }),
    "inset 0px 12px 28px -8px rgba(255, 0, 0, 0.75)",
  );
});

test("combines layers for preview and formats a copyable declaration", () => {
  const second = { ...base, x: 2, y: 4, blur: 8, spread: 0, opacity: 15 };
  assert.equal(boxShadowValue([base, second]), `${shadowLayerCss(base)}, ${shadowLayerCss(second)}`);
  assert.equal(
    boxShadowDeclaration([base, second]),
    `box-shadow: ${shadowLayerCss(base)},\n  ${shadowLayerCss(second)};`,
  );
});

test("keeps zero opacity and negative zero deterministic", () => {
  assert.equal(
    shadowLayerCss({ ...base, x: -0, opacity: 0 }),
    "0px 12px 28px -8px rgba(15, 23, 42, 0)",
  );
});

test("rejects invalid numeric ranges and colors", () => {
  for (const layer of [
    { ...base, x: BOX_SHADOW_LIMITS.offset + 1 },
    { ...base, blur: -1 },
    { ...base, spread: BOX_SHADOW_LIMITS.spread + 1 },
    { ...base, opacity: 101 },
    { ...base, color: "red" },
  ]) {
    assert.throws(() => shadowLayerCss(layer), BoxShadowError);
  }
});

test("requires between one and three layers", () => {
  assert.throws(() => boxShadowValue([]), (error) => {
    assert.ok(error instanceof BoxShadowError);
    assert.equal(error.key, "layers");
    return true;
  });
  assert.throws(
    () => boxShadowDeclaration(Array.from({ length: BOX_SHADOW_LIMITS.layers + 1 }, () => base)),
    (error) => error instanceof BoxShadowError && error.key === "layers",
  );
});
