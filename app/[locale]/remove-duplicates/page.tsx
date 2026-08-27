"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { removeDuplicateLines } from "@/lib/lines";

export default function RemoveDuplicatesPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [keepEmpty, setKeepEmpty] = useState(false);

  const result = useMemo(
    () =>
      removeDuplicateLines(input, {
        caseSensitive,
        trimWhitespace,
        keepEmpty,
      }),
    [caseSensitive, input, keepEmpty, trimWhitespace],
  );

  function loadExample() {
    setInput("Apple\nbanana\napple\n  Banana  \n\norange\napple");
  }

  return (
    <ToolLayout
      title={t("tools.remove-duplicates.name")}
      description={t("removeDuplicatesPage.description")}
      icon="≠"
    >
      <ToolPanel>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={() => setCaseSensitive((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("removeDuplicatesPage.caseSensitive")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={() => setTrimWhitespace((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("removeDuplicatesPage.trimWhitespace")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={keepEmpty}
              onChange={() => setKeepEmpty((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("removeDuplicatesPage.keepEmpty")}
          </label>
          <button
            type="button"
            onClick={loadExample}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
          >
            {t("removeDuplicatesPage.example")}
          </button>
        </div>
      </ToolPanel>

      <ToolPanel
        label={t("removeDuplicatesPage.inputLabel")}
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
          placeholder={t("removeDuplicatesPage.placeholder")}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      <ToolPanel
        label={t("common.result")}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">
              {t("removeDuplicatesPage.summary", {
                kept: result.kept,
                removed: result.removed,
              })}
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
