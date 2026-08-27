export type LineEnding = "lf" | "crlf";

export type DuplicateOptions = {
  caseSensitive: boolean;
  trimWhitespace: boolean;
  keepEmpty: boolean;
};

export type SortOptions = {
  direction: "asc" | "desc";
  caseSensitive: boolean;
  numeric: boolean;
  trimWhitespace: boolean;
  removeDuplicates: boolean;
};

function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

function joinLines(lines: string[], ending: LineEnding): string {
  return lines.join(ending === "crlf" ? "\r\n" : "\n");
}

function normalizeKey(line: string, caseSensitive: boolean, trimWhitespace: boolean): string {
  const value = trimWhitespace ? line.trim() : line;
  return caseSensitive ? value : value.toLocaleLowerCase();
}

export function removeDuplicateLines(
  text: string,
  options: DuplicateOptions,
  ending: LineEnding = "lf",
): { output: string; removed: number; kept: number } {
  if (text === "") return { output: "", removed: 0, kept: 0 };

  const seen = new Set<string>();
  const output: string[] = [];
  let removed = 0;

  for (const line of splitLines(text)) {
    const key = normalizeKey(line, options.caseSensitive, options.trimWhitespace);
    if (!options.keepEmpty && key === "") {
      removed++;
      continue;
    }
    if (seen.has(key)) {
      removed++;
      continue;
    }
    seen.add(key);
    output.push(line);
  }

  return { output: joinLines(output, ending), removed, kept: output.length };
}

function compareLines(a: string, b: string, options: SortOptions): number {
  const left = options.trimWhitespace ? a.trim() : a;
  const right = options.trimWhitespace ? b.trim() : b;
  if (options.numeric) {
    const na = Number(left);
    const nb = Number(right);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  }
  return left.localeCompare(right, undefined, {
    sensitivity: options.caseSensitive ? "variant" : "accent",
    numeric: options.numeric,
  });
}

export function sortLines(
  text: string,
  options: SortOptions,
  ending: LineEnding = "lf",
): { output: string; count: number } {
  if (text === "") return { output: "", count: 0 };

  const lines = options.removeDuplicates
    ? removeDuplicateLines(text, {
        caseSensitive: options.caseSensitive,
        trimWhitespace: options.trimWhitespace,
        keepEmpty: true,
      }).output.split("\n")
    : splitLines(text);

  const sorted = [...lines].sort((a, b) => compareLines(a, b, options));
  if (options.direction === "desc") sorted.reverse();
  return { output: joinLines(sorted, ending), count: sorted.length };
}
