"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { formatCalendarDate, localTodayInputValue, parseCalendarDate } from "@/lib/date-arithmetic";
import { isoWeekOf } from "@/lib/calendar-info";

export default function WeekNumberPage() {
  const t = useTranslations();
  const [value, setValue] = useState("");
  const selected = parseCalendarDate(value);
  const result = selected ? isoWeekOf(selected) : null;
  const monday = result ? formatCalendarDate(result.monday) : "";
  const sunday = result ? formatCalendarDate(result.sunday) : "";

  return (
    <ToolLayout title={t("tools.week-number.name")} description={t("weekNumberPage.description")} icon="📅">
      <ToolPanel>
        <div className="space-y-2 text-sm font-medium">
          <label htmlFor="week-date" className="block">{t("weekNumberPage.date")}</label>
          <div className="flex gap-2">
            <input id="week-date" type="date" min="0001-01-01" max="9999-12-31" value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500" />
            <button type="button" onClick={() => setValue(localTodayInputValue())}
              className="shrink-0 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5">
              {t("dateCalculatorPage.today")}
            </button>
          </div>
        </div>
      </ToolPanel>
      <ToolPanel label={t("common.result")} action={<CopyButton value={result ? `${result.weekYear}-W${String(result.week).padStart(2, "0")}` : ""} />}>
        <div className="min-h-24" aria-live="polite">
          {result ? <>
            <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
              {t("weekNumberPage.week", { week: result.week })}
            </p>
            <p className="mt-2 text-sm text-muted">{t("weekNumberPage.weekYear", { year: result.weekYear })}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted">{t("weekNumberPage.monday")}</p>
                <time dateTime={monday} className="mt-1 block font-mono font-semibold">{monday}</time>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted">{t("weekNumberPage.sunday")}</p>
                <time dateTime={sunday} className="mt-1 block font-mono font-semibold">{sunday}</time>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">{t("weekNumberPage.rule")}</p>
          </> : <p className="py-7 text-center text-muted">{selected ? t("weekNumberPage.range") : t("weekNumberPage.empty")}</p>}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
