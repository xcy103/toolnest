import { strict as assert } from "node:assert";
import { test } from "node:test";
import { ConvertError } from "./csv.ts";
import {
  CsvTableError,
  filterCsvRows,
  parseCsvTable,
  sortCsvRows,
} from "./csv-table.ts";

test("builds a table with or without a header", () => {
  assert.deepEqual(parseCsvTable("name,age\nAda,36", { delimiter: ",", header: true }), {
    columns: ["name", "age"],
    rows: [["Ada", "36"]],
  });
  assert.deepEqual(parseCsvTable("Ada;36", { delimiter: ";", header: false }), {
    columns: ["Column 1", "Column 2"],
    rows: [["Ada", "36"]],
  });
});

test("keeps RFC 4180 quoted cells and fills blank header names", () => {
  assert.deepEqual(parseCsvTable('name,\n"Lovelace, Ada",math', { delimiter: ",", header: true }), {
    columns: ["name", "Column 2"],
    rows: [["Lovelace, Ada", "math"]],
  });
});

test("rejects ragged rows and oversized tables", () => {
  assert.throws(
    () => parseCsvTable("a,b\n1", { delimiter: ",", header: true }),
    (error: unknown) => error instanceof ConvertError && error.key === "csvRagged",
  );
  const wide = Array.from({ length: 101 }, (_, index) => `c${index}`).join(",");
  assert.throws(
    () => parseCsvTable(wide, { delimiter: ",", header: true }),
    (error: unknown) => error instanceof CsvTableError && error.key === "csvTooManyColumns",
  );
  const tall = ["value", ...Array.from({ length: 5_001 }, () => "x")].join("\n");
  assert.throws(
    () => parseCsvTable(tall, { delimiter: ",", header: true }),
    (error: unknown) => error instanceof CsvTableError && error.key === "csvTooManyRows",
  );
  assert.throws(
    () => parseCsvTable("x".repeat(2 * 1024 * 1024 + 1), { delimiter: ",", header: true }),
    (error: unknown) => error instanceof CsvTableError && error.key === "csvTooLarge",
  );
});

test("filters across every cell without changing the source", () => {
  const rows = [["Ada", "London"], ["Grace", "New York"]];
  assert.deepEqual(filterCsvRows(rows, "YORK"), [["Grace", "New York"]]);
  assert.equal(filterCsvRows(rows, ""), rows);
});

test("sorts numbers numerically, keeps blanks last and remains stable", () => {
  const rows = [["ten", "10"], ["blank", ""], ["two", "2"], ["also two", "2"]];
  assert.deepEqual(sortCsvRows(rows, 1, "asc"), [rows[2], rows[3], rows[0], rows[1]]);
  assert.deepEqual(sortCsvRows(rows, 1, "desc"), [rows[0], rows[2], rows[3], rows[1]]);
});
