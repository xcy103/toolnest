/* eslint-disable @typescript-eslint/no-explicit-any -- Minimal React test renderer accepts heterogeneous JSX props. */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("CSV viewer ignores obsolete file reads after source changes", async () => {
  // Exercise the page's real event handlers with deterministic deferred file reads.
  const source = readFileSync(new URL("../app/[locale]/csv-viewer/page.tsx", import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  type Element = { type: unknown; props: Record<string, any>; children: any[] };
  const states: any[] = [];
  let cursor = 0;
  const react = {
    createElement: (type: unknown, props: Record<string, any>, ...children: any[]): Element => ({ type, props: props || {}, children }),
    useState: (initial: unknown) => {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value: any) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useRef: (initial: unknown) => states[cursor++] ||= { current: initial },
    useMemo: (fn: () => unknown) => fn(),
  };
  const context = {
    React: react,
    exports: {} as { default: () => Element },
    require: (name: string) => {
      if (name === "react") return react;
      if (name === "next-intl") return { useTranslations: () => (key: string) => key };
      if (name === "@/lib/csv") return { ConvertError: class extends Error {} };
      if (name === "@/lib/csv-table") return {
        CSV_TABLE_LIMITS: { bytes: 2097152, rows: 5000, columns: 100 },
        CsvTableError: class extends Error {},
        parseCsvTable: () => ({ columns: [], rows: [] }),
        filterCsvRows: (rows: unknown) => rows,
        sortCsvRows: (rows: unknown) => rows,
      };
      return { default: "Layout", ToolPanel: "Panel" };
    },
  };
  runInNewContext(code, context);
  function find(node: any, predicate: (node: Element) => boolean): Element | undefined {
    if (!node || typeof node !== "object") return;
    if (predicate(node)) return node;
    for (const child of [...(node.children || []).flat(), node.props?.action]) {
      const match = find(child, predicate);
      if (match) return match;
    }
  }
  function element(predicate: (node: Element) => boolean) {
    cursor = 0;
    const result = find(context.exports.default(), predicate);
    assert.ok(result);
    return result;
  }
  function pending() {
    let resolve!: (value: string) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<string>((yes, no) => { resolve = yes; reject = no; });
    return { resolve, reject, file: { name: "old.csv", size: 5, text: () => promise } };
  }
  const upload = (job: ReturnType<typeof pending>) => element(node => node.type === "input" && node.props.type === "file").props.onChange({ target: { files: [job.file], value: "old.csv" } });
  const button = (key: string) => element(node => node.type === "button" && node.children.includes(key));
  const input = () => element(node => node.type === "textarea");
  const flush = () => new Promise<void>(resolve => setImmediate(resolve));

  let job = pending();
  upload(job);
  input().props.onChange({ target: { value: "new,value" } });
  job.resolve("old,value");
  await flush();
  assert.equal(input().props.value, "new,value");

  job = pending();
  upload(job);
  button("csvViewerPage.example").props.onClick();
  job.reject(new Error("obsolete read failure"));
  await flush();
  assert.ok(input().props.value.startsWith("name,team"));
  cursor = 0;
  assert.equal(find(context.exports.default(), node => node.props.role === "alert"), undefined);

  job = pending();
  upload(job);
  button("common.clear").props.onClick();
  job.resolve("old,value");
  await flush();
  assert.equal(input().props.value, "");

  const first = pending(), second = pending();
  upload(first);
  upload(second);
  second.resolve("second,value");
  await flush();
  first.resolve("first,value");
  await flush();
  assert.equal(input().props.value, "second,value");
});
