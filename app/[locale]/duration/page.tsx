"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { parseDuration, calculateDuration, formatDuration, formatDurationUnit } from "@/lib/duration";

export default function DurationPage() {
  const t = useTranslations();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  let result: number | null = null;
  let error = "";
  if (a !== "" || b !== "") {
    try {
      result = calculateDuration(parseDuration(a), parseDuration(b), operation);
    } catch {
      error = t("durationPage.error");
    }
  }
  const formatted = result === null ? "" : formatDuration(result);
  const units = result === null ? [] : [
    { label: t("durationPage.seconds"), value: String(result) },
    { label: t("durationPage.minutes"), value: formatDurationUnit(result / 60) },
    { label: t("durationPage.hours"), value: formatDurationUnit(result / 3600) },
  ];
  const copy = result === null ? "" : [formatted, ...units.map(({ label, value }) => `${label}: ${value}`)].join("\n");

  return (
    <ToolLayout title={t("tools.duration.name")} description={t("durationPage.description")} icon="H:M:S">
      <div className="inline-flex rounded-lg border border-border p-1">
        {(["add", "subtract"] as const).map((value) => (
          <button key={value} type="button" aria-pressed={operation === value} onClick={() => setOperation(value)} className={`rounded-md px-3 py-2 text-sm ${operation === value ? "bg-emerald-500 text-white" : "hover:bg-foreground/5"}`}>
            {t(`durationPage.${value}`)}
          </button>
        ))}
      </div>
      <ToolPanel label={t("durationPage.inputs")} action={
        <div className="flex gap-3 text-sm">
          <button type="button" onClick={() => { setA("23:59:59"); setB("00:00:02"); }} className="text-muted hover:text-foreground">{t("durationPage.example")}</button>
          <button type="button" onClick={() => { setA(""); setB(""); }} className="text-muted hover:text-foreground">{t("common.clear")}</button>
        </div>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          {[{ label: t("durationPage.first"), value: a, set: setA }, { label: t("durationPage.second"), value: b, set: setB }].map(({ label, value, set }) => (
            <label key={label} className="block min-w-0">
              <span className="mb-2 block text-sm font-medium">{label}</span>
              <input aria-label={label} aria-invalid={Boolean(error)} value={value} onChange={(e) => set(e.target.value)} placeholder="HH:MM:SS" className="w-full min-w-0 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
            </label>
          ))}
        </div>
      </ToolPanel>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <ToolPanel label={t("durationPage.result")} action={<CopyButton value={copy} />}>
        <output aria-live="polite" className="block break-words font-mono text-2xl">{formatted || "—"}</output>
        {result !== null && <>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {units.map(({ label, value }) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 break-words font-mono">{value}</dd></div>)}
          </dl>
          <p className="mt-4 text-sm text-muted">{t("durationPage.precision")}</p>
        </>}
      </ToolPanel>
    </ToolLayout>
  );
}
