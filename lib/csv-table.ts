import { ConvertError, parseCsv, type Delimiter } from "./csv.ts";

export const CSV_TABLE_LIMITS = {
  bytes: 2 * 1024 * 1024,
  rows: 5_000,
  columns: 100,
} as const;

export type CsvTable = {
  columns: string[];
  rows: string[][];
};

export type CsvTableErrorKey =
  | "csvTooLarge"
  | "csvTooManyRows"
  | "csvTooManyColumns";

export class CsvTableError extends Error {
  readonly key: CsvTableErrorKey;
  readonly values: Record<string, number>;

  constructor(key: CsvTableErrorKey, values: Record<string, number>) {
    super(key);
    this.name = "CsvTableError";
    this.key = key;
    this.values = values;
  }
}

export function parseCsvTable(
  text: string,
  options: { delimiter: Delimiter; header: boolean },
): CsvTable {
  const bytes = new TextEncoder().encode(text).byteLength;
  if (bytes > CSV_TABLE_LIMITS.bytes) {
    throw new CsvTableError("csvTooLarge", { max: CSV_TABLE_LIMITS.bytes / 1024 / 1024 });
  }

  const parsed = parseCsv(text, options.delimiter);
  if (parsed.length === 0) return { columns: [], rows: [] };

  const width = parsed[0].length;
  if (width > CSV_TABLE_LIMITS.columns) {
    throw new CsvTableError("csvTooManyColumns", { max: CSV_TABLE_LIMITS.columns });
  }

  const rows = options.header ? parsed.slice(1) : parsed;
  if (rows.length > CSV_TABLE_LIMITS.rows) {
    throw new CsvTableError("csvTooManyRows", { max: CSV_TABLE_LIMITS.rows });
  }

  rows.forEach((row, index) => {
    if (row.length !== width) {
      throw new ConvertError("csvRagged", {
        line: index + (options.header ? 2 : 1),
        expected: width,
        got: row.length,
      });
    }
  });

  const columns = options.header
    ? parsed[0].map((name, index) => name.trim() || `Column ${index + 1}`)
    : parsed[0].map((_, index) => `Column ${index + 1}`);

  return { columns, rows };
}

export function filterCsvRows(rows: string[][], query: string): string[][] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    row.some((cell) => cell.toLocaleLowerCase().includes(needle)),
  );
}

const numberPattern = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

export function sortCsvRows(
  rows: string[][],
  column: number,
  direction: "asc" | "desc",
): string[][] {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const a = left.row[column] ?? "";
      const b = right.row[column] ?? "";
      if (!a && b) return 1;
      if (a && !b) return -1;
      if (!a && !b) return left.index - right.index;

      const aTrimmed = a.trim();
      const bTrimmed = b.trim();
      const comparison = numberPattern.test(aTrimmed) && numberPattern.test(bTrimmed)
        ? Number(aTrimmed) - Number(bTrimmed)
        : collator.compare(a, b);
      return (direction === "asc" ? comparison : -comparison) || left.index - right.index;
    })
    .map(({ row }) => row);
}
