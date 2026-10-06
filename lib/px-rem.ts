export const PX_REM_LIMITS = {
  characters: 10_000,
  items: 100,
  root: 1_000,
  value: 1_000_000_000,
} as const;

export type PxRemDirection = "pxToRem" | "remToPx";
export type PxRemErrorKey = "root" | "value" | "tooMany" | "tooLarge";

export class PxRemError extends Error {
  key: PxRemErrorKey;
  line?: number;

  constructor(key: PxRemErrorKey, line?: number) {
    super(key);
    this.name = "PxRemError";
    this.key = key;
    this.line = line;
  }
}

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

function parseNumber(raw: string, key: "root" | "value", line?: number): number {
  const text = raw.trim();
  if (!DECIMAL.test(text)) throw new PxRemError(key, line);
  const value = Number(text);
  if (!Number.isFinite(value)) throw new PxRemError(key, line);
  return value;
}

export function parseRootSize(raw: string): number {
  const root = parseNumber(raw, "root");
  if (root <= 0 || root > PX_REM_LIMITS.root) throw new PxRemError("root");
  return root;
}

export function formatPxRemNumber(value: number): string {
  const rounded = Math.abs(value) < 0.00000000005 ? 0 : value;
  return rounded.toFixed(10).replace(/\.?0+$/, "");
}

export function convertPxRemValue(
  value: number,
  direction: PxRemDirection,
  rootSize: number,
): number {
  return direction === "pxToRem" ? value / rootSize : value * rootSize;
}

export function convertPxRemInput(
  input: string,
  direction: PxRemDirection,
  rootRaw: string,
  multiple: boolean,
): { output: string; count: number } {
  if (input.length > PX_REM_LIMITS.characters) throw new PxRemError("tooLarge");
  const rootSize = parseRootSize(rootRaw);
  const unit = direction === "pxToRem" ? "rem" : "px";

  function convert(raw: string, line?: number): string {
    const value = parseNumber(raw, "value", line);
    if (Math.abs(value) > PX_REM_LIMITS.value) throw new PxRemError("value", line);
    return `${formatPxRemNumber(convertPxRemValue(value, direction, rootSize))}${unit}`;
  }

  if (!multiple) return { output: convert(input), count: 1 };

  const lines = input.split(/\r\n|\r|\n/);
  const count = lines.filter((line) => line.trim() !== "").length;
  if (count > PX_REM_LIMITS.items) throw new PxRemError("tooMany");

  return {
    output: lines
      .map((line, index) => (line.trim() === "" ? "" : convert(line, index + 1)))
      .join("\n"),
    count,
  };
}
