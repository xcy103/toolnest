export type TimestampUnit = "seconds" | "milliseconds";
export type TimestampErrorKey = "empty" | "integer" | "range";

export type TimestampParseResult =
  | { ok: true; ms: number }
  | { ok: false; key: TimestampErrorKey };

const MAX_DATE_MS = 8_640_000_000_000_000;

export function parseUnixTimestamp(
  text: string,
  unit: TimestampUnit,
): TimestampParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, key: "empty" };
  if (!/^-?\d+$/.test(trimmed)) return { ok: false, key: "integer" };

  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) return { ok: false, key: "range" };

  const ms = unit === "seconds" ? value * 1000 : value;
  if (!Number.isSafeInteger(ms) || Math.abs(ms) > MAX_DATE_MS) {
    return { ok: false, key: "range" };
  }

  return { ok: true, ms };
}

export function unixSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

export function unixMilliseconds(ms: number): number {
  return Math.trunc(ms);
}

export function toLocalDatetimeInputValue(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
