"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { bmiCategory, bmiImperial, bmiMetric, formatCalculatorResult } from "@/lib/everyday-calculators";

type Units = "metric" | "imperial";

export default function BmiCalculatorPage() {
  const t = useTranslations();
  const [units, setUnits] = useState<Units>("metric");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");

  const bmi = useMemo(() => {
    const w = Number(weight);
    const h = Number(height);
    if (!weight.trim() || !height.trim() || !Number.isFinite(w) || !Number.isFinite(h)) return Number.NaN;
    return units === "metric" ? bmiMetric(w, h) : bmiImperial(w, h);
  }, [height, units, weight]);
  const category = bmiCategory(bmi);

  function switchUnits(next: Units) {
    if (next === units) return;
    if (next === "imperial") {
      setWeight(formatCalculatorResult(Number(weight) * 2.2046226218, 3));
      setHeight(formatCalculatorResult(Number(height) / 2.54, 3));
    } else {
      setWeight(formatCalculatorResult(Number(weight) / 2.2046226218, 3));
      setHeight(formatCalculatorResult(Number(height) * 2.54, 3));
    }
    setUnits(next);
  }

  return (
    <ToolLayout title={t("tools.bmi-calculator.name")} description={t("bmiCalculatorPage.description")} icon="BMI">
      <div className="inline-flex rounded-lg border border-border p-1">
        {(["metric", "imperial"] as const).map((value) => (
          <button key={value} type="button" onClick={() => switchUnits(value)} className={`rounded-md px-4 py-2 text-sm font-medium transition ${units === value ? "bg-foreground/10 text-foreground" : "text-muted hover:bg-foreground/5"}`}>
            {t(`bmiCalculatorPage.units.${value}`)}
          </button>
        ))}
      </div>

      <ToolPanel>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>{t("bmiCalculatorPage.weight", { unit: t(`bmiCalculatorPage.unitLabels.${units}.weight`) })}</span>
            <input type="number" min="0" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} className="w-full rounded-lg border border-border bg-background p-3 text-lg outline-none focus:border-emerald-500" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>{t("bmiCalculatorPage.height", { unit: t(`bmiCalculatorPage.unitLabels.${units}.height`) })}</span>
            <input type="number" min="0" inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value)} className="w-full rounded-lg border border-border bg-background p-3 text-lg outline-none focus:border-emerald-500" />
          </label>
        </div>
      </ToolPanel>

      <ToolPanel label={t("bmiCalculatorPage.resultLabel")}>
        {category ? (
          <div aria-live="polite">
            <div className="font-mono text-4xl font-semibold text-emerald-600 dark:text-emerald-400">{formatCalculatorResult(bmi, 1)}</div>
            <p className="mt-2 font-medium">{t(`bmiCalculatorPage.categories.${category}`)}</p>
          </div>
        ) : <p className="text-muted">{t("bmiCalculatorPage.invalid")}</p>}
      </ToolPanel>

      <p className="text-sm leading-6 text-muted">{t("bmiCalculatorPage.note")}</p>
    </ToolLayout>
  );
}
