"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { parseDuration, calculateDuration, formatDuration, formatDurationUnit } from "@/lib/duration";

function readDuration(value: string): number | "invalid" | null {
  if (!value.trim()) return null;
  try {
    return parseDuration(value);
  } catch {
    return "invalid";
  }
}

export default function DurationPage() {
  const t = useTranslations();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const first = readDuration(a);
  const second = readDuration(b);
  const result = typeof first === "number" && typeof second === "number"
    ? calculateDuration(first, second, operation)
    : null;
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
          {[
            { id: "duration-a", label: t("durationPage.first"), value: a, set: setA, invalid: first === "invalid" },
            { id: "duration-b", label: t("durationPage.second"), value: b, set: setB, invalid: second === "invalid" },
          ].map(({ id, label, value, set, invalid }) => (
            <div key={id} className="min-w-0">
              <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
              <input id={id} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} value={value} onChange={(e) => set(e.target.value)} placeholder="HH:MM:SS" className="w-full min-w-0 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
              {invalid && <p id={`${id}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400">{t("durationPage.error")}</p>}
            </div>
          ))}
        </div>
      </ToolPanel>
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
