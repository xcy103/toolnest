export const DURATION_MAX_SECONDS = 999_999 * 3600 + 59 * 60 + 59;

export function parseDuration(raw: string): number {
  const match = /^(\d{1,6}):([0-5]\d):([0-5]\d)$/.exec(raw.trim());
  if (!match) throw new RangeError("duration");
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

export function calculateDuration(a: number, b: number, operation: "add" | "subtract"): number {
  for (const value of [a, b]) {
    if (!Number.isSafeInteger(value) || value < 0 || value > DURATION_MAX_SECONDS) {
      throw new RangeError("duration");
    }
  }
  return operation === "add" ? a + b : a - b;
}

export function formatDuration(total: number): string {
  if (!Number.isSafeInteger(total) || Math.abs(total) > DURATION_MAX_SECONDS * 2) {
    throw new RangeError("duration");
  }
  const value = Math.abs(total);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor(value / 60) % 60;
  const seconds = value % 60;
  return `${total < 0 ? "-" : ""}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDurationUnit(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}
