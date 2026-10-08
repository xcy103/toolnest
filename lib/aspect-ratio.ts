export const ASPECT_INPUT_MAX = 1_000_000;
export const ASPECT_RESULT_MAX = 1_000_000_000;
export type Rounding = "nearest" | "floor" | "ceil";

export function parseAspectInteger(raw: string): number {
  if (!/^\d+$/.test(raw.trim())) throw new RangeError("input");
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > ASPECT_INPUT_MAX) throw new RangeError("input");
  return value;
}

export function reduceAspectRatio(width: number, height: number): [number, number] {
  for (const v of [width, height]) {
    if (!Number.isSafeInteger(v) || v < 1 || v > ASPECT_INPUT_MAX) throw new RangeError("input");
  }
  let a = width;
  let b = height;
  while (b !== 0) [a, b] = [b, a % b];
  return [width / a, height / a];
}

export function solveAspectDimension(
  known: number,
  ratioWidth: number,
  ratioHeight: number,
  knownSide: "width" | "height",
  rounding: Rounding,
): { value: number; rounded: number; fraction: string } {
  reduceAspectRatio(ratioWidth, ratioHeight);
  if (!Number.isSafeInteger(known) || known < 1 || known > ASPECT_INPUT_MAX) throw new RangeError("input");
  const numerator = known * (knownSide === "width" ? ratioHeight : ratioWidth);
  const denominator = knownSide === "width" ? ratioWidth : ratioHeight;
  const value = numerator / denominator;
  if (value > ASPECT_RESULT_MAX) throw new RangeError("result");
  const whole = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  const rounded = rounding === "floor" ? whole : rounding === "ceil" ? whole + Number(remainder > 0) : whole + Number(remainder * 2 >= denominator);
  return { value, rounded, fraction: `${numerator}/${denominator}` };
}

export function formatAspectValue(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}
