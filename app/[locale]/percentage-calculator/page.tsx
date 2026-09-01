"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import {
  formatCalculatorResult,
  percentageChange,
  percentageOf,
  percentageRatio,
} from "@/lib/everyday-calculators";

type Mode = "of" | "ratio" | "change";

export default function PercentageCalculatorPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("of");
  const [first, setFirst] = useState("15");
  const [second, setSecond] = useState("200");

  const result = useMemo(() => {
    const a = Number(first);
    const b = Number(second);
    if (!first.trim() || !second.trim() || !Number.isFinite(a) || !Number.isFinite(b)) {
      return "";
    }
    const value = mode === "of" ? percentageOf(a, b) : mode === "ratio" ? percentageRatio(a, b) : percentageChange(a, b);
    return formatCalculatorResult(value);
  }, [first, second, mode]);

  const suffix = mode === "of" ? "" : "%";

  return (
    <ToolLayout title={t("tools.percentage-calculator.name")} description={t("percentageCalculatorPage.description")} icon="%">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["of", "ratio", "change"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${mode === value ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-border hover:bg-foreground/5"}`}>
            {t(`percentageCalculatorPage.modes.${value}`)}
          </button>
        ))}
      </div>

      <ToolPanel>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>{t(`percentageCalculatorPage.labels.${mode}.first`)}</span>
            <input type="number" inputMode="decimal" value={first} onChange={(event) => setFirst(event.target.value)} className="w-full rounded-lg border border-border bg-background p-3 text-lg outline-none focus:border-emerald-500" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>{t(`percentageCalculatorPage.labels.${mode}.second`)}</span>
            <input type="number" inputMode="decimal" value={second} onChange={(event) => setSecond(event.target.value)} className="w-full rounded-lg border border-border bg-background p-3 text-lg outline-none focus:border-emerald-500" />
          </label>
        </div>
      </ToolPanel>

      <ToolPanel label={t("common.result")} action={<CopyButton value={result ? `${result}${suffix}` : ""} />}>
        <div className="min-h-12 font-mono text-3xl font-semibold text-emerald-600 dark:text-emerald-400" aria-live="polite">
          {result ? `${result}${suffix}` : t("percentageCalculatorPage.invalid")}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
