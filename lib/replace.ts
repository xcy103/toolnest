/**
 * Find & replace over plain text, in either literal or regular-expression mode.
 *
 * As in `lib/csv.ts` and `lib/calc.ts`, failures are thrown as identifiers and
 * the UI decides the wording. Fields are declared explicitly rather than using
 * constructor parameter properties, so the module runs under Node's
 * strip-only TypeScript for tests.
 */

export type ReplaceErrorKey = "invalidPattern";

export class ReplaceError extends Error {
  readonly key: ReplaceErrorKey;
  readonly values: Record<string, string | number>;

  constructor(key: ReplaceErrorKey, values: Record<string, string | number> = {}) {
    super(key);
    this.name = "ReplaceError";
    this.key = key;
    this.values = values;
  }
}

export type ReplaceOptions = {
  /** Treat the search string as a regular expression instead of literal text. */
  regex: boolean;
  caseSensitive: boolean;
  /** Only match when the search text stands alone as a word. */
  wholeWord: boolean;
};

export type Match = { index: number; length: number };

/** Escape every regex metacharacter, so literal mode really is literal. */
export function escapeLiteral(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build the search expression. Throws `invalidPattern` on a bad regex. */
export function buildPattern(search: string, options: ReplaceOptions): RegExp {
  const source = options.regex ? search : escapeLiteral(search);
  // A non-capturing group keeps alternation from swallowing the word boundaries.
  const body = options.wholeWord ? `\\b(?:${source})\\b` : source;
  const flags = options.caseSensitive ? "g" : "gi";
  try {
    return new RegExp(body, flags);
  } catch (err) {
    throw new ReplaceError("invalidPattern", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Every match of `re` in `text`. Zero-length matches (`a*`, `^`) advance
 * `lastIndex` by hand, otherwise the loop never ends.
 */
export function findMatches(text: string, re: RegExp): Match[] {
  const matches: Match[] = [];
  const search = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = search.exec(text)) !== null) {
    matches.push({ index: m.index, length: m[0].length });
    if (m[0] === "") search.lastIndex++;
  }
  return matches;
}

export type ReplaceResult = {
  output: string;
  /** How many matches were replaced. */
  count: number;
};

/**
 * Replace every match. In regex mode the replacement keeps its `$1` / `$&`
 * powers; in literal mode a `$` is just a dollar sign, so it gets escaped.
 * Newlines and tabs come from the replacement field itself — no escape
 * sequences are interpreted, which keeps "\n" meaning a backslash and an n.
 */
export function replaceAll(
  text: string,
  search: string,
  replacement: string,
  options: ReplaceOptions,
): ReplaceResult {
  if (search === "") return { output: text, count: 0 };

  const re = buildPattern(search, options);
  const count = findMatches(text, re).length;
  const safeReplacement = options.regex
    ? replacement
    : replacement.replaceAll("$", "$$$$");

  return { output: text.replace(re, safeReplacement), count };
}
