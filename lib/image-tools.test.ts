import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildIco, compressedFilename, cropFilename, fitWithinWidth, validCrop, validDimensions, linkedSize, outputFilename } from "./image-tools.ts";

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

test("ICO files index each embedded PNG at the correct offset", () => {
  const first = new Uint8Array([137, 80, 78, 71]);
  const second = new Uint8Array([1, 2, 3]);
  const ico = buildIco([{ size: 16, bytes: first }, { size: 256, bytes: second }]);
  const view = new DataView(ico.buffer);
  assert.equal(view.getUint16(0, true), 0);
  assert.equal(view.getUint16(2, true), 1);
  assert.equal(view.getUint16(4, true), 2);
  assert.equal(ico[6], 16);
  assert.equal(ico[22], 0);
  assert.equal(view.getUint32(14, true), first.length);
  assert.equal(view.getUint32(18, true), 38);
  assert.equal(view.getUint32(30, true), second.length);
  assert.equal(view.getUint32(34, true), 42);
  assert.deepEqual(ico.slice(38, 42), first);
  assert.deepEqual(ico.slice(42), second);
});

test("ICO files reject invalid, empty and duplicate image entries", () => {
  assert.throws(() => buildIco([]));
  assert.throws(() => buildIco([{ size: 0, bytes: new Uint8Array([1]) }]));
  assert.throws(() => buildIco([{ size: 16, bytes: new Uint8Array() }]));
  assert.throws(() => buildIco([{ size: 16, bytes: new Uint8Array([1]) }, { size: 16, bytes: new Uint8Array([2]) }]));
});

test("compressor dimensions preserve aspect ratio without enlarging", () => {
  assert.deepEqual(fitWithinWidth(1600, 1000, 800), { width: 800, height: 500 });
  assert.deepEqual(fitWithinWidth(600, 900, 1920), { width: 600, height: 900 });
  assert.deepEqual(fitWithinWidth(8192, 1, 1), { width: 1, height: 1 });
  assert.throws(() => fitWithinWidth(1600, 1000, 0));
  assert.throws(() => fitWithinWidth(8192, 8192, 100));
  assert.equal(compressedFilename("holiday.photo.png", "image/jpeg"), "holiday.photo-compressed.jpg");
});
