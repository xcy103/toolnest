"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { flattenJsonText, JSON_FLAT_LIMITS, JsonFlatError, unflattenJsonText } from "@/lib/json-flat";

type Mode = "flatten" | "unflatten";
const examples: Record<Mode, string> = {
  flatten: '{\n  "user": { "name": "Ada", "roles": ["admin", "editor"] },\n  "empty": {},\n  "a/b~c": true\n}',
  unflatten: '{\n  "": {},\n  "/user": {},\n  "/user/name": "Ada",\n  "/user/roles": [],\n  "/user/roles/0": "admin",\n  "/user/roles/1": "editor"\n}',
};
const textAreaClass = "w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500";

export default function JsonFlattenPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("flatten");
  const [input, setInput] = useState("");
  const processed = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      return { output: mode === "flatten" ? flattenJsonText(input) : unflattenJsonText(input), error: null };
    } catch (error) {
      return { output: "", error: error instanceof JsonFlatError ? error.key : "syntax" };
    }
  }, [input, mode]);

  function changeMode(next: Mode) {
    setMode(next);
    setInput("");
  }

  return (
    <ToolLayout title={t("tools.json-flatten.name")} description={t("jsonFlattenPage.description")} icon="↔">
      <div className="inline-flex rounded-lg border border-border p-1" aria-label={t("jsonFlattenPage.mode")}>
        {(["flatten", "unflatten"] as const).map((value) => <button key={value} type="button" onClick={() => changeMode(value)} aria-pressed={mode === value} className={`rounded-md px-4 py-2 text-sm font-medium transition ${mode === value ? "bg-emerald-500 text-white shadow-sm" : "text-foreground/70 hover:bg-foreground/5"}`}>{t(`jsonFlattenPage.modes.${value}`)}</button>)}
      </div>

      <ToolPanel label={t(`jsonFlattenPage.input.${mode}`)} action={<div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={() => setInput(examples[mode])} className="text-muted hover:text-foreground">{t("jsonFlattenPage.example")}</button>
        {input && <button type="button" onClick={() => setInput("")} className="text-muted hover:text-foreground">{t("common.clear")}</button>}
      </div>}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={11} aria-label={t(`jsonFlattenPage.input.${mode}`)} placeholder={t(`jsonFlattenPage.placeholders.${mode}`)} spellCheck={false} className={textAreaClass} />
      </ToolPanel>

      {processed.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{t(`jsonFlattenPage.errors.${processed.error}`, JSON_FLAT_LIMITS)}</p>}

      <ToolPanel label={t(`jsonFlattenPage.output.${mode}`)} action={<CopyButton value={processed.output} />}>
        <textarea value={processed.output} readOnly rows={11} aria-label={t(`jsonFlattenPage.output.${mode}`)} placeholder={t("common.resultPlaceholder")} className={textAreaClass} />
        <p className="mt-3 text-xs text-muted">{t("jsonFlattenPage.rule")}</p>
      </ToolPanel>
    </ToolLayout>
  );
}
