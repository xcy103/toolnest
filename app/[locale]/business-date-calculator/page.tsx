"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import WeekendSelector from "@/components/WeekendSelector";
import { addBusinessDays } from "@/lib/business-days";
import {
  calendarDateToUtc,
  formatCalendarDate,
  localTodayInputValue,
  parseCalendarDate,
} from "@/lib/date-arithmetic";

type Operation = "add" | "subtract";

export default function BusinessDateCalculatorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [baseDate, setBaseDate] = useState("");
  const [operation, setOperation] = useState<Operation>("add");
  const [amount, setAmount] = useState("1");
  const [weekendDays, setWeekendDays] = useState([0, 6]);

  const calculation = useMemo(() => {
    const start = parseCalendarDate(baseDate);
    if (!start) return { state: "date" as const };
    if (!/^\d+$/.test(amount)) return { state: "amount" as const };

    const parsedAmount = Number(amount);
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount > 9999) {
      return { state: "amount" as const };
    }

    const result = addBusinessDays(
      start,
      operation === "add" ? parsedAmount : -parsedAmount,
      weekendDays,
    );
    return result
      ? { state: "ready" as const, ...result, amount: parsedAmount }
      : { state: "range" as const };
  }, [amount, baseDate, operation, weekendDays]);

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
      title={t("tools.business-date-calculator.name")}
      description={t("businessDateCalculatorPage.description")}
      icon="🗓️"
    >
      <ToolPanel>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 text-sm font-medium">
            <label htmlFor="business-base-date" className="block">
              {t("businessDateCalculatorPage.startDate")}
            </label>
            <div className="flex gap-2">
              <input
                id="business-base-date"
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                value={baseDate}
                onChange={(event) => setBaseDate(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setBaseDate(localTodayInputValue())}
                className="shrink-0 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-foreground/5"
              >
                {t("dateCalculatorPage.today")}
              </button>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t("businessDateCalculatorPage.operation")}
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
                  {t(`businessDateCalculatorPage.operations.${value}`)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <label className="mt-5 block space-y-2 text-sm font-medium">
          <span>{t("businessDateCalculatorPage.amount")}</span>
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

        <p className="mt-3 text-sm text-muted">
          {t("businessDateCalculatorPage.startRule")}
        </p>
      </ToolPanel>

      <ToolPanel>
        <WeekendSelector value={weekendDays} onChange={setWeekendDays} />
      </ToolPanel>

      <ToolPanel
        label={t("common.result")}
        action={<CopyButton value={resultValue} />}
      >
        <div className="min-h-28" aria-live="polite">
          {calculation.state === "ready" ? (
            <>
              <time
                dateTime={resultValue}
                className="block text-2xl font-semibold text-emerald-600 dark:text-emerald-400 sm:text-3xl"
              >
                {formattedResult}
              </time>
              <p className="mt-2 font-mono text-sm text-muted">{resultValue}</p>
              <p className="mt-4 text-sm text-foreground/75">
                {t("businessDateCalculatorPage.summary", {
                  operation,
                  amount: calculation.amount,
                  start: baseDate,
                })}
              </p>
              <p className="mt-2 text-sm text-muted">
                {t("businessDateCalculatorPage.skipped", {
                  calendarDays: calculation.calendarDaysMoved,
                  skippedDays: calculation.skippedDays,
                })}
              </p>
            </>
          ) : (
            <p className="py-8 text-center text-muted">
              {t(`businessDateCalculatorPage.errors.${calculation.state}`)}
            </p>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
