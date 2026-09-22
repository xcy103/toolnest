"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { compareLists, type ListComparison } from "@/lib/lines";

const results: (keyof ListComparison)[] = ["intersection", "leftOnly", "rightOnly", "combined"];

export default function ListComparisonPage() {
  const t = useTranslations();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);

  const comparison = useMemo(
    () => compareLists(left, right, { caseSensitive, trimWhitespace }),
    [left, right, caseSensitive, trimWhitespace],
  );

  return (
    <ToolLayout title={t("tools.list-comparison.name")} description={t("listComparisonPage.description")} icon="∩">
      <ToolPanel>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={caseSensitive} onChange={(event) => setCaseSensitive(event.target.checked)} className="h-4 w-4 accent-emerald-500" />
            {t("listComparisonPage.caseSensitive")}
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={trimWhitespace} onChange={(event) => setTrimWhitespace(event.target.checked)} className="h-4 w-4 accent-emerald-500" />
            {t("listComparisonPage.trimWhitespace")}
          </label>
          <button type="button" onClick={() => { setLeft("Apple\nbanana\npear\napple"); setRight("banana\norange\nAPPLE"); }} className="ml-auto text-muted transition hover:text-foreground">
            {t("listComparisonPage.example")}
          </button>
        </div>
      </ToolPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        <ToolPanel label={t("listComparisonPage.left")} action={left && <button type="button" onClick={() => setLeft("")} className="text-sm text-muted hover:text-foreground">{t("common.clear")}</button>}>
          <textarea value={left} onChange={(event) => setLeft(event.target.value)} rows={9} spellCheck={false} aria-label={t("listComparisonPage.left")} placeholder={t("listComparisonPage.placeholder")} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
        </ToolPanel>
        <ToolPanel label={t("listComparisonPage.right")} action={right && <button type="button" onClick={() => setRight("")} className="text-sm text-muted hover:text-foreground">{t("common.clear")}</button>}>
          <textarea value={right} onChange={(event) => setRight(event.target.value)} rows={9} spellCheck={false} aria-label={t("listComparisonPage.right")} placeholder={t("listComparisonPage.placeholder")} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
        </ToolPanel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" aria-live="polite">
        {results.map((key) => {
          const items = comparison[key];
          const output = items.join("\n");
          return (
            <ToolPanel key={key} label={t(`listComparisonPage.results.${key}`)} action={<div className="flex items-center gap-2"><span className="font-mono text-sm text-muted">{items.length}</span><CopyButton value={output} /></div>}>
              <textarea value={output} readOnly rows={6} aria-label={t(`listComparisonPage.results.${key}`)} placeholder={t("listComparisonPage.empty")} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none" />
            </ToolPanel>
          );
        })}
      </div>
      <p className="text-sm text-muted">{t("listComparisonPage.rule")}</p>
    </ToolLayout>
  );
}
