/**
 * CSV ↔ JSON conversion, following RFC 4180 for quoting: fields may contain the
 * delimiter, double quotes (escaped by doubling) and line breaks as long as the
 * field is quoted.
 *
 * Like `lib/calc.ts`, this module throws error *identifiers* — the UI decides the
 * wording, so the messages stay translatable.
 */

export type Delimiter = "," | ";" | "\t";

export type ConvertErrorKey =
  | "jsonSyntax"
  | "jsonNotTabular"
  | "jsonEmpty"
  | "csvUnclosedQuote"
  | "csvRagged";

export class ConvertError extends Error {
  readonly key: ConvertErrorKey;
  readonly values: Record<string, string | number>;

  constructor(key: ConvertErrorKey, values: Record<string, string | number> = {}) {
    super(key);
    this.name = "ConvertError";
    this.key = key;
    this.values = values;
  }
}

/** A parsed CSV value: whatever type inference produced. */
export type CsvValue = string | number | boolean | null;

/**
 * Split CSV text into rows of raw string fields. Handles quoted fields,
 * doubled quotes, and CRLF / CR / LF line endings. Blank lines are dropped.
 */
export function parseCsv(text: string, delimiter: Delimiter): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  // Where the currently open quote started, for a useful error message.
  let quoteStartRow = 1;
  let line = 1;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    // A blank line parses as a single empty field — not a real record.
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        if (char === "\n") line++;
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "") {
      quoted = true;
      quoteStartRow = line;
      continue;
    }
    if (char === delimiter) {
      endField();
      continue;
    }
    if (char === "\r") {
      // Treat CRLF and a lone CR as one line ending.
      if (text[i + 1] === "\n") i++;
      endRow();
      line++;
      continue;
    }
    if (char === "\n") {
      endRow();
      line++;
      continue;
    }
    field += char;
  }

  if (quoted) throw new ConvertError("csvUnclosedQuote", { line: quoteStartRow });
  // Flush whatever is left; a trailing newline leaves nothing behind.
  if (field !== "" || row.length > 0) endRow();

  return rows;
}

/** Guess the type of a raw CSV field. Anything unrecognised stays a string. */
function inferValue(raw: string): CsvValue {
  const trimmed = raw.trim();
  if (trimmed === "") return raw;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  // Only plain JSON-style numbers; "007" and "1,5" stay strings on purpose.
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return raw;
}

export type CsvToJsonOptions = {
  delimiter: Delimiter;
  /** Is the first row a header row? If not, columns are named column1…columnN. */
  header: boolean;
  /** Convert numbers / booleans / null instead of keeping every field a string. */
  inferTypes: boolean;
};

/** CSV text → an array of row objects. */
export function csvToJson(
  text: string,
  { delimiter, header, inferTypes }: CsvToJsonOptions,
): Record<string, CsvValue>[] {
  const rows = parseCsv(text, delimiter);
  if (rows.length === 0) return [];

  const width = rows[0].length;
  const keys = header
    ? rows[0].map((name, i) => name.trim() || `column${i + 1}`)
    : rows[0].map((_, i) => `column${i + 1}`);
  const body = header ? rows.slice(1) : rows;

  return body.map((cells, index) => {
    if (cells.length !== width) {
      throw new ConvertError("csvRagged", {
        // Row number as the user sees it in the input.
        line: index + (header ? 2 : 1),
        expected: width,
        got: cells.length,
      });
    }
    const record: Record<string, CsvValue> = {};
    keys.forEach((key, i) => {
      record[key] = inferTypes ? inferValue(cells[i]) : cells[i];
    });
    return record;
  });
}

/** Quote a single field if it contains anything that would break the row. */
function escapeField(value: string, delimiter: Delimiter): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r") ||
    value !== value.trim();
  return needsQuotes ? `"${value.replaceAll('"', '""')}"` : value;
}

/** Render one cell value. Nested objects/arrays keep their JSON form. */
function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * JSON text → CSV. The input must be an array of objects (a single object is
 * treated as one row); columns are the union of the keys, in first-seen order.
 * Rows are joined with "\n", which is what people paste back into a sheet.
 */
export function jsonToCsv(text: string, delimiter: Delimiter): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ConvertError("jsonSyntax");
  }

  const isRow = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (rows.length === 0) throw new ConvertError("jsonEmpty");
  if (!rows.every(isRow)) throw new ConvertError("jsonNotTabular");

  const columns: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) columns.push(key);
    }
  }

  const lines = [
    columns.map((c) => escapeField(c, delimiter)).join(delimiter),
    ...rows.map((row) =>
      columns.map((c) => escapeField(cellText(row[c]), delimiter)).join(delimiter),
    ),
  ];
  return lines.join("\n");
}
