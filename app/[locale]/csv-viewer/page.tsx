"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { ConvertError, type Delimiter } from "@/lib/csv";
import {
  CSV_TABLE_LIMITS,
  CsvTableError,
  filterCsvRows,
  parseCsvTable,
  sortCsvRows,
} from "@/lib/csv-table";

const PAGE_SIZE = 100;
const EXAMPLE = `name,team,score,city
Ada,Engineering,98,London
Grace,Engineering,95,New York
Lin,Design,91,Shanghai
Margaret,Research,97,New York`;

type ViewerError = { key: string; values?: Record<string, string | number> } | null;

export default function CsvViewerPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [header, setHeader] = useState(true);
  const [columnQuery, setColumnQuery] = useState("");
  const [rowQuery, setRowQuery] = useState("");
  const [sort, setSort] = useState<{ column: number; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [fileError, setFileError] = useState<ViewerError>(null);

  const parsed = useMemo(() => {
    if (!input.trim()) return { table: null, error: null as ViewerError };
    try {
      return { table: parseCsvTable(input, { delimiter, header }), error: null as ViewerError };
    } catch (error) {
      if (error instanceof ConvertError || error instanceof CsvTableError) {
        return { table: null, error: { key: error.key, values: error.values } };
      }
      return { table: null, error: { key: "unknown" } };
    }
  }, [input, delimiter, header]);

  const visibleColumns = useMemo(() => {
    if (!parsed.table) return [];
    const needle = columnQuery.trim().toLocaleLowerCase();
    return parsed.table.columns
      .map((name, index) => ({ name, index }))
      .filter(({ name }) => !needle || name.toLocaleLowerCase().includes(needle));
  }, [parsed.table, columnQuery]);

  const rows = useMemo(() => {
    if (!parsed.table) return [];
    const filtered = filterCsvRows(parsed.table.rows, rowQuery);
    return sort ? sortCsvRows(filtered, sort.column, sort.direction) : filtered;
  }, [parsed.table, rowQuery, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const error = fileError ?? parsed.error;

  function resetView() {
    setPage(1);
    setSort(null);
  }

  function clearSearches() {
    setColumnQuery("");
    setRowQuery("");
  }

  async function loadFile(file?: File) {
    if (!file) return;
    setFileError(null);
    if (file.size > CSV_TABLE_LIMITS.bytes) {
      setFileError({ key: "csvTooLarge", values: { max: CSV_TABLE_LIMITS.bytes / 1024 / 1024 } });
      return;
    }
    try {
      setInput(await file.text());
      setFileName(file.name);
      clearSearches();
      resetView();
    } catch {
      setFileError({ key: "fileRead" });
    }
  }

  function toggleSort(column: number) {
    setSort((current) => current?.column === column
      ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
      : { column, direction: "asc" });
    setPage(1);
  }

  return (
    <ToolLayout title={t("tools.csv-viewer.name")} description={t("csvViewerPage.description")} icon="▦">
      <ToolPanel label={t("csvViewerPage.source")} action={input && <button type="button" onClick={() => { setInput(""); setFileName(""); setFileError(null); clearSearches(); resetView(); }} className="text-sm text-muted hover:text-foreground">{t("common.clear")}</button>}>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 text-center transition hover:border-emerald-500/50 hover:bg-foreground/5">
          <span aria-hidden className="text-2xl">↥</span>
          <span className="text-sm font-medium text-foreground/80">{fileName || t("csvViewerPage.openFile")}</span>
          <span className="text-xs text-muted">{t("csvViewerPage.limits", { size: 2, rows: CSV_TABLE_LIMITS.rows, columns: CSV_TABLE_LIMITS.columns })}</span>
          <input type="file" accept=".csv,text/csv,text/plain" onChange={(event) => { void loadFile(event.target.files?.[0]); event.target.value = ""; }} className="hidden" />
        </label>

        <div className="my-4 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border" /><span>{t("csvViewerPage.orPaste")}</span><span className="h-px flex-1 bg-border" /></div>
        <textarea value={input} onChange={(event) => { setInput(event.target.value); setFileName(""); setFileError(null); resetView(); }} rows={6} spellCheck={false} placeholder={t("csvViewerPage.placeholder")} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <label className="flex items-center gap-2 text-muted">{t("csvViewerPage.delimiter")}
            <select value={delimiter} onChange={(event) => { setDelimiter(event.target.value as Delimiter); resetView(); }} className="rounded-lg border border-border bg-background p-2 text-foreground outline-none focus:border-emerald-500">
              <option value=",">{t("csvViewerPage.comma")}</option><option value=";">{t("csvViewerPage.semicolon")}</option><option value={"\t"}>{t("csvViewerPage.tab")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={header} onChange={(event) => { setHeader(event.target.checked); resetView(); }} className="h-4 w-4 accent-emerald-500" />{t("csvViewerPage.header")}</label>
          <button type="button" onClick={() => { setInput(EXAMPLE); setFileName(""); setFileError(null); setDelimiter(","); setHeader(true); clearSearches(); resetView(); }} className="text-muted hover:text-foreground">{t("csvViewerPage.example")}</button>
        </div>
      </ToolPanel>

      {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{t(`csvViewerPage.errors.${error.key}`, error.values)}</p>}

      {parsed.table && !error && <ToolPanel label={t("csvViewerPage.table")} action={<span className="text-sm text-muted">{t("csvViewerPage.summary", { shown: rows.length, total: parsed.table.rows.length, columns: parsed.table.columns.length })}</span>}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm"><span className="text-muted">{t("csvViewerPage.columnSearch")}</span><input type="search" value={columnQuery} onChange={(event) => setColumnQuery(event.target.value)} placeholder={t("csvViewerPage.columnPlaceholder")} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-emerald-500" /></label>
          <label className="space-y-1 text-sm"><span className="text-muted">{t("csvViewerPage.rowFilter")}</span><input type="search" value={rowQuery} onChange={(event) => { setRowQuery(event.target.value); setPage(1); }} placeholder={t("csvViewerPage.rowPlaceholder")} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-emerald-500" /></label>
        </div>

        {visibleColumns.length === 0 ? <p className="py-8 text-center text-sm text-muted">{t("csvViewerPage.noColumns")}</p> : rows.length === 0 ? <p className="py-8 text-center text-sm text-muted">{t("csvViewerPage.noRows")}</p> : <>
          <div className="max-h-[32rem] overflow-auto rounded-lg border border-border">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card"><tr><th className="border-b border-r border-border px-3 py-2 font-mono text-xs text-muted">#</th>{visibleColumns.map(({ name, index }) => <th key={index} className="min-w-36 border-b border-border px-3 py-2 font-semibold"><button type="button" onClick={() => toggleSort(index)} title={t("csvViewerPage.sortBy", { column: name })} className="flex w-full items-center justify-between gap-2 text-left hover:text-emerald-600"><span className="break-words">{name}</span><span aria-hidden>{sort?.column === index ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}</tr></thead>
              <tbody>{pageRows.map((row, rowIndex) => <tr key={(safePage - 1) * PAGE_SIZE + rowIndex} className="odd:bg-foreground/[0.025]"><td className="border-r border-t border-border px-3 py-2 font-mono text-xs text-muted">{(safePage - 1) * PAGE_SIZE + rowIndex + 1}</td>{visibleColumns.map(({ index }) => <td key={index} className="max-w-80 whitespace-pre-wrap break-words border-t border-border px-3 py-2 align-top">{row[index]}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {pageCount > 1 && <div className="mt-4 flex items-center justify-between gap-3"><button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40">← {t("csvViewerPage.previous")}</button><span className="text-sm text-muted">{t("csvViewerPage.page", { page: safePage, pages: pageCount })}</span><button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40">{t("csvViewerPage.next")} →</button></div>}
        </>}
      </ToolPanel>}
    </ToolLayout>
  );
}
