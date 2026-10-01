export const JSON_FLAT_LIMITS = { characters: 2_000_000, depth: 100, entries: 5_000 };

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonFlatErrorKey = "syntax" | "tooLarge" | "tooDeep" | "tooMany" | "flatRoot" | "rootMissing" | "pointer" | "marker" | "parent" | "arrayIndex" | "arrayGap" | "conflict";

export class JsonFlatError extends Error {
  key: JsonFlatErrorKey;

  constructor(key: JsonFlatErrorKey) {
    super(key);
    this.key = key;
  }
}

function escapeToken(token: string): string {
  return token.replaceAll("~", "~0").replaceAll("/", "~1");
}

function parsePointer(pointer: string): string[] {
  if (pointer === "") return [];
  if (!pointer.startsWith("/")) throw new JsonFlatError("pointer");
  return pointer.slice(1).split("/").map((token) => {
    if (/~(?:[^01]|$)/.test(token)) throw new JsonFlatError("pointer");
    return token.replaceAll("~1", "/").replaceAll("~0", "~");
  });
}

function pointerFor(tokens: string[]): string {
  return tokens.length ? `/${tokens.map(escapeToken).join("/")}` : "";
}

function parseInput(text: string): JsonValue {
  if (text.length > JSON_FLAT_LIMITS.characters) throw new JsonFlatError("tooLarge");
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    throw new JsonFlatError("syntax");
  }
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function containerFor(value: JsonValue): JsonValue[] | { [key: string]: JsonValue } | null {
  if (Array.isArray(value)) {
    if (value.length) throw new JsonFlatError("marker");
    return [];
  }
  if (isObject(value)) {
    if (Object.keys(value).length) throw new JsonFlatError("marker");
    return {};
  }
  return null;
}

export function flattenJson(value: JsonValue): Record<string, JsonValue> {
  const output: Record<string, JsonValue> = Object.create(null);
  let entries = 0;
  const visit = (current: JsonValue, tokens: string[], depth: number) => {
    if (depth > JSON_FLAT_LIMITS.depth) throw new JsonFlatError("tooDeep");
    if (entries === JSON_FLAT_LIMITS.entries) throw new JsonFlatError("tooMany");
    entries += 1;
    const pointer = pointerFor(tokens);
    if (Array.isArray(current)) {
      output[pointer] = [];
      current.forEach((child, index) => visit(child, [...tokens, String(index)], depth + 1));
    } else if (isObject(current)) {
      output[pointer] = {};
      for (const [key, child] of Object.entries(current)) visit(child, [...tokens, key], depth + 1);
    } else {
      output[pointer] = current;
    }
  };
  visit(value, [], 0);
  return output;
}

export function unflattenJson(flat: JsonValue): JsonValue {
  if (!isObject(flat)) throw new JsonFlatError("flatRoot");
  const entries = Object.entries(flat);
  if (!Object.hasOwn(flat, "")) throw new JsonFlatError("rootMissing");
  if (entries.length > JSON_FLAT_LIMITS.entries) throw new JsonFlatError("tooMany");

  const parsed = entries.map(([pointer, value], order) => {
    const tokens = parsePointer(pointer);
    if (tokens.length > JSON_FLAT_LIMITS.depth) throw new JsonFlatError("tooDeep");
    if (pointerFor(tokens) !== pointer) throw new JsonFlatError("pointer");
    return { pointer, value, tokens, order };
  }).sort((left, right) => left.tokens.length - right.tokens.length || left.order - right.order);

  const rootEntry = parsed[0];
  if (rootEntry.pointer !== "") throw new JsonFlatError("rootMissing");
  const rootContainer = containerFor(rootEntry.value);
  const root: JsonValue = rootContainer ?? rootEntry.value;
  if (!rootContainer && parsed.length > 1) throw new JsonFlatError("conflict");

  const containers = new Map<string, JsonValue[] | { [key: string]: JsonValue }>();
  if (rootContainer) containers.set("", rootContainer);
  const arrayIndices = new Map<JsonValue[], Set<number>>();

  for (const entry of parsed.slice(1)) {
    const parentPointer = pointerFor(entry.tokens.slice(0, -1));
    const parent = containers.get(parentPointer);
    if (!parent) throw new JsonFlatError("parent");
    const token = entry.tokens.at(-1)!;
    const childContainer = containerFor(entry.value);
    const child: JsonValue = childContainer ?? entry.value;

    if (Array.isArray(parent)) {
      if (!/^(0|[1-9]\d*)$/.test(token) || Number(token) >= JSON_FLAT_LIMITS.entries) throw new JsonFlatError("arrayIndex");
      const index = Number(token);
      const used = arrayIndices.get(parent) ?? new Set<number>();
      if (used.has(index)) throw new JsonFlatError("conflict");
      used.add(index);
      arrayIndices.set(parent, used);
      parent[index] = child;
    } else {
      if (Object.hasOwn(parent, token)) throw new JsonFlatError("conflict");
      Object.defineProperty(parent, token, { value: child, enumerable: true, configurable: true, writable: true });
    }
    if (childContainer) containers.set(entry.pointer, childContainer);
  }

  for (const [array, indices] of arrayIndices) {
    if (indices.size !== array.length || Array.from({ length: array.length }, (_, index) => index).some((index) => !indices.has(index))) {
      throw new JsonFlatError("arrayGap");
    }
  }
  return root;
}

export function flattenJsonText(text: string): string {
  return JSON.stringify(flattenJson(parseInput(text)), null, 2);
}

export function unflattenJsonText(text: string): string {
  return JSON.stringify(unflattenJson(parseInput(text)), null, 2);
}
