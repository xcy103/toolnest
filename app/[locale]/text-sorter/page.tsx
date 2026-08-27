"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { sortLines } from "@/lib/lines";

type Direction = "asc" | "desc";

export default function TextSorterPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("asc");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [numeric, setNumeric] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);

  const result = useMemo(
    () =>
      sortLines(input, {
        direction,
        caseSensitive,
        numeric,
        trimWhitespace,
        removeDuplicates,
      }),
    [caseSensitive, direction, input, numeric, removeDuplicates, trimWhitespace],
  );

  function loadExample() {
    setInput(numeric ? "10\n2\n1\n25\n4" : "banana\nApple\ncherry\napple\nDate");
  }

  return (
    <ToolLayout
      title={t("tools.text-sorter.name")}
      description={t("textSorterPage.description")}
      icon="A↧"
    >
      <ToolPanel>
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex rounded-lg border border-border p-1">
            {(
              [
                ["asc", t("textSorterPage.ascending")],
                ["desc", t("textSorterPage.descending")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDirection(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  direction === value
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-foreground/70 hover:bg-foreground/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={() => setCaseSensitive((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("textSorterPage.caseSensitive")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={numeric}
              onChange={() => setNumeric((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("textSorterPage.numeric")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={() => setTrimWhitespace((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("textSorterPage.trimWhitespace")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={() => setRemoveDuplicates((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("textSorterPage.removeDuplicates")}
          </label>
          <button
            type="button"
            onClick={loadExample}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
          >
            {t("textSorterPage.example")}
          </button>
        </div>
      </ToolPanel>

      <ToolPanel
        label={t("textSorterPage.inputLabel")}
        action={
          input ? (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("common.clear")}
            </button>
          ) : null
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={9}
          spellCheck={false}
          placeholder={t("textSorterPage.placeholder")}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      <ToolPanel
        label={t("common.result")}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">
              {t("textSorterPage.summary", { count: result.count })}
            </span>
            <CopyButton value={result.output} />
          </div>
        }
      >
        <textarea
          value={result.output}
          readOnly
          rows={9}
          placeholder={t("common.resultPlaceholder")}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
        />
      </ToolPanel>
    </ToolLayout>
  );
}
