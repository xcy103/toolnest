export const JSON_STRING_LIMIT = 2_000_000;

export type JsonStringErrorKey = "syntax" | "notString" | "tooLarge";

export class JsonStringError extends Error {
  key: JsonStringErrorKey;

  constructor(key: JsonStringErrorKey) {
    super(key);
    this.name = "JsonStringError";
    this.key = key;
  }
}

function assertLength(text: string) {
  if (text.length > JSON_STRING_LIMIT) throw new JsonStringError("tooLarge");
}

/** Serialize plain text as one complete JSON string literal. */
export function escapeJsonString(text: string): string {
  assertLength(text);
  return JSON.stringify(text);
}

/** Parse one complete JSON string literal and reject every other JSON value type. */
export function unescapeJsonString(literal: string): string {
  assertLength(literal);

  let value: unknown;
  try {
    value = JSON.parse(literal);
  } catch {
    throw new JsonStringError("syntax");
  }

  if (typeof value !== "string") throw new JsonStringError("notString");
  return value;
}
