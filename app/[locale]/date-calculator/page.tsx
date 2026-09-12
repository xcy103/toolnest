"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import {
  addToCalendarDate,
  calendarDateToUtc,
  formatCalendarDate,
  parseCalendarDate,
  type DateUnit,
} from "@/lib/date-arithmetic";

type Operation = "add" | "subtract";

function todayInputValue(): string {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function DateCalculatorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [baseDate, setBaseDate] = useState("");
  const [operation, setOperation] = useState<Operation>("add");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<DateUnit>("days");

  const calculation = useMemo(() => {
    const parsedDate = parseCalendarDate(baseDate);
    if (!parsedDate) return { state: "date" as const };
    if (!/^\d+$/.test(amount)) return { state: "amount" as const };

    const parsedAmount = Number(amount);
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount > 9999) {
      return { state: "amount" as const };
    }

    const result = addToCalendarDate(
      parsedDate,
      operation === "add" ? parsedAmount : -parsedAmount,
      unit,
    );
    return result
      ? { state: "ready" as const, ...result, amount: parsedAmount }
      : { state: "range" as const };
  }, [amount, baseDate, operation, unit]);

  const resultValue =
    calculation.state === "ready" ? formatCalendarDate(calculation.date) : "";
  const formattedResult =
    calculation.state === "ready"
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "full",
          timeZone: "UTC",
        }).format(calendarDateToUtc(calculation.date))
      : "";

  return (
    <ToolLayout
      title={t("tools.date-calculator.name")}
      description={t("dateCalculatorPage.description")}
      icon="📆"
    >
      <ToolPanel>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 text-sm font-medium">
            <label htmlFor="base-date" className="block">
              {t("dateCalculatorPage.baseDate")}
            </label>
            <div className="flex gap-2">
              <input
                id="base-date"
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                value={baseDate}
                onChange={(event) => setBaseDate(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setBaseDate(todayInputValue())}
                className="shrink-0 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-foreground/5"
              >
                {t("dateCalculatorPage.today")}
              </button>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t("dateCalculatorPage.operation")}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["add", "subtract"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={operation === value}
                  onClick={() => setOperation(value)}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                    operation === value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border hover:bg-foreground/5"
                  }`}
                >
                  {t(`dateCalculatorPage.operations.${value}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="space-y-2 text-sm font-medium">
            <span>{t("dateCalculatorPage.amount")}</span>
            <input
              type="number"
              min="0"
              max="9999"
              step="1"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500"
            />
          </label>

          <label className="space-y-2 text-sm font-medium">
            <span>{t("dateCalculatorPage.unit")}</span>
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value as DateUnit)}
              className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-emerald-500"
            >
              {(["days", "weeks", "months", "years"] as const).map((value) => (
                <option key={value} value={value}>
                  {t(`dateCalculatorPage.units.${value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm text-muted">
          {t("dateCalculatorPage.endOfMonthRule")}
        </p>
      </ToolPanel>

      <ToolPanel
        label={t("common.result")}
        action={<CopyButton value={resultValue} />}
      >
        <div className="min-h-24" aria-live="polite">
          {calculation.state === "ready" ? (
            <>
              <time
                dateTime={resultValue}
                className="block text-2xl font-semibold text-emerald-600 dark:text-emerald-400 sm:text-3xl"
              >
                {formattedResult}
              </time>
              <p className="mt-2 font-mono text-sm text-muted">{resultValue}</p>
              <p className="mt-3 text-sm text-foreground/75">
                {t(`dateCalculatorPage.summaries.${unit}`, {
                  operation,
                  amount: calculation.amount,
                  date: baseDate,
                })}
              </p>
              {calculation.clamped && (
                <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t("dateCalculatorPage.clamped")}
                </p>
              )}
            </>
          ) : (
            <p className="py-7 text-center text-muted">
              {t(`dateCalculatorPage.errors.${calculation.state}`)}
            </p>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
