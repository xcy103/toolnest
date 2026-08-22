import { strict as assert } from "node:assert";
import { test } from "node:test";
import { ConvertError, csvToJson, jsonToCsv, parseCsv } from "./csv.ts";

const opts = { delimiter: "," as const, header: true, inferTypes: true };

/** Assert that `fn` fails with a specific error identifier. */
function failsWith(fn: () => unknown, key: string) {
  assert.throws(
    fn,
    (err: unknown) => err instanceof ConvertError && err.key === key,
    `expected failure with ${key}`,
  );
}

test("parses the RFC 4180 quoting rules", () => {
  assert.deepEqual(parseCsv("a,b\n1,2", ","), [["a", "b"], ["1", "2"]]);
  // A quoted field may contain the delimiter…
  assert.deepEqual(parseCsv('a,b\n"x,y",2', ","), [["a", "b"], ["x,y", "2"]]);
  // …a doubled quote, which means one literal quote…
  assert.deepEqual(parseCsv('a\n"he said ""hi"""', ","), [["a"], ['he said "hi"']]);
  // …and even a line break.
  assert.deepEqual(parseCsv('a,b\n"l1\nl2",2', ","), [["a", "b"], ["l1\nl2", "2"]]);
});

test("accepts every line ending, and drops blank lines", () => {
  assert.deepEqual(parseCsv("a,b\r\n1,2\r\n", ","), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv("a,b\r1,2", ","), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv("a,b\n\n1,2\n\n", ","), [["a", "b"], ["1", "2"]]);
});

test("keeps empty fields and supports other delimiters", () => {
  assert.deepEqual(parseCsv("a,b,c\n1,,3", ","), [["a", "b", "c"], ["1", "", "3"]]);
  assert.deepEqual(parseCsv("a;b\n1;2", ";"), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv("a\tb\n1\t2", "\t"), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv("", ","), []);
});

test("an unclosed quote is an error, with the line it opened on", () => {
  failsWith(() => parseCsv('a,b\n"oops,2', ","), "csvUnclosedQuote");
});

test("csv → json uses the header row", () => {
  assert.deepEqual(csvToJson("name,age\nAda,36", { ...opts, inferTypes: false }), [
    { name: "Ada", age: "36" },
  ]);
  assert.deepEqual(csvToJson("a,b", opts), []);
  // Missing header cells still produce usable keys.
  assert.deepEqual(csvToJson("name,\nAda,x", { ...opts, inferTypes: false }), [
    { name: "Ada", column2: "x" },
  ]);
  assert.deepEqual(csvToJson("Ada,36", { ...opts, header: false }), [
    { column1: "Ada", column2: 36 },
  ]);
});

test("type detection stays conservative", () => {
  assert.deepEqual(csvToJson("name,age,ok,nil\nAda,36,true,null", opts), [
    { name: "Ada", age: 36, ok: true, nil: null },
  ]);
  // Leading zeros mean an identifier, not a number — turning 007 into 7 loses data.
  assert.deepEqual(csvToJson("code\n007", opts), [{ code: "007" }]);
});

test("a row with the wrong number of fields is reported, not guessed at", () => {
  failsWith(() => csvToJson("a,b\n1,2,3", opts), "csvRagged");
});

test("json → csv builds columns from the union of keys", () => {
  assert.equal(jsonToCsv('[{"a":1,"b":"x"},{"a":2,"b":"y"}]', ","), "a,b\n1,x\n2,y");
  assert.equal(jsonToCsv('[{"a":1},{"b":2}]', ","), "a,b\n1,\n,2");
  assert.equal(jsonToCsv('{"a":1}', ","), "a\n1");
  assert.equal(jsonToCsv('[{"a":null,"b":1},{"b":2}]', ","), "a,b\n,1\n,2");
  assert.equal(jsonToCsv('[{"a":1,"b":2}]', ";"), "a;b\n1;2");
});

test("json → csv quotes whatever would break a row", () => {
  assert.equal(
    jsonToCsv('[{"a":"x,y","b":"he \\"hi\\"","c":"l1\\nl2"}]', ","),
    'a,b,c\n"x,y","he ""hi""","l1\nl2"',
  );
  // Leading whitespace survives only if the field is quoted.
  assert.equal(jsonToCsv('[{"a":" x"}]', ","), 'a\n" x"');
  // A cell can't hold an object, so nested values keep their JSON form.
  assert.equal(jsonToCsv('[{"a":{"x":1},"b":[1,2]}]', ","), 'a,b\n"{""x"":1}","[1,2]"');
});

test("json → csv rejects input that isn't a table", () => {
  failsWith(() => jsonToCsv("{oops", ","), "jsonSyntax");
  failsWith(() => jsonToCsv("[1,2,3]", ","), "jsonNotTabular");
  failsWith(() => jsonToCsv("[]", ","), "jsonEmpty");
});

test("survives a round trip through the hard cases", () => {
  const original = [
    { name: "Ada, L", note: 'said "hi"', n: 1 },
    { name: "Bob", note: "multi\nline", n: 2 },
  ];
  const csv = jsonToCsv(JSON.stringify(original), ",");
  assert.deepEqual(csvToJson(csv, opts), original);
});
