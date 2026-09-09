import { strict as assert } from "node:assert";
import { test } from "node:test";
import { cropFilename, validCrop, validDimensions, linkedSize, outputFilename } from "./image-tools.ts";

test("image dimensions enforce both side and pixel budgets", () => {
  assert.ok(validDimensions(4096, 4096));
  assert.ok(validDimensions(8192, 1));
  for (const [w, h] of [[0, 10], [-1, 10], [1.5, 2], [8193, 1], [8192, 8192], [NaN, 10], [10, Infinity]]) {
    assert.equal(validDimensions(w, h), false);
  }
});

test("aspect lock scales from the original ratio and keeps at least one pixel", () => {
  assert.equal(linkedSize("300", 1200, 800), "200");
  assert.equal(linkedSize("200", 800, 1200), "300");
  assert.equal(linkedSize("1", 8000, 1), "1");
  for (const value of ["", "0", "-1", "1.5", "1e2"]) assert.equal(linkedSize(value, 1200, 800), "");
});

test("downloads use the actual encoder format and preserve the source basename", () => {
  assert.equal(outputFilename("holiday.photo.png", "image/jpeg", false), "holiday.photo-converted.jpg");
  assert.equal(outputFilename("photo.jpg", "image/webp", true), "photo-resized.webp");
  assert.equal(outputFilename("photo", "image/png", false), "photo-converted.png");
  assert.equal(cropFilename("holiday.photo.png", "image/jpeg"), "holiday.photo-cropped.jpg");
});

test("crop rectangles must use integer pixels and remain inside the source", () => {
  assert.ok(validCrop({ x: 10, y: 20, width: 100, height: 50 }, 200, 100));
  assert.ok(validCrop({ x: 0, y: 0, width: 200, height: 100 }, 200, 100));
  for (const rect of [
    { x: -1, y: 0, width: 10, height: 10 },
    { x: 0, y: -1, width: 10, height: 10 },
    { x: 0, y: 0, width: 0, height: 10 },
    { x: 101, y: 0, width: 100, height: 10 },
    { x: 0.5, y: 0, width: 10, height: 10 },
  ]) assert.equal(validCrop(rect, 200, 100), false);
});
