"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { calendarDateToUtc, formatCalendarDate, localTodayInputValue, parseCalendarDate } from "@/lib/date-arithmetic";
import { nextWeekday, weekdayOf } from "@/lib/calendar-info";

const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function WeekdayPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [value, setValue] = useState("");
  const [target, setTarget] = useState(1);
  const selected = parseCalendarDate(value);
  const day = selected ? weekdayOf(selected) : null;
  const next = selected ? nextWeekday(selected, target) : null;
  const nextValue = next ? formatCalendarDate(next) : "";

  return (
    <ToolLayout title={t("tools.weekday.name")} description={t("weekdayPage.description")} icon="🗓️">
      <ToolPanel>
        <label htmlFor="weekday-date" className="block text-sm font-medium">{t("weekdayPage.date")}</label>
        <div className="mt-2 flex gap-2">
          <input id="weekday-date" type="date" min="0001-01-01" max="9999-12-31" value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500" />
          <button type="button" onClick={() => setValue(localTodayInputValue())}
            className="shrink-0 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5">
            {t("dateCalculatorPage.today")}
          </button>
        </div>
      </ToolPanel>
      <ToolPanel label={t("weekdayPage.weekday")} action={<CopyButton value={day === null ? "" : t(`businessDaysCommon.days.${keys[day]}.long`)} />}>
        <div className="min-h-20" aria-live="polite">
          {selected && day !== null ? <>
            <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{t(`businessDaysCommon.days.${keys[day]}.long`)}</p>
            <p className="mt-2 text-sm text-muted">{new Intl.DateTimeFormat(locale, {dateStyle: "full", timeZone: "UTC"}).format(calendarDateToUtc(selected))}</p>
          </> : <p className="py-6 text-center text-muted">{t("weekdayPage.empty")}</p>}
        </div>
      </ToolPanel>
      <ToolPanel label={t("weekdayPage.nextTitle")}>
        <label className="block text-sm font-medium" htmlFor="target-weekday">{t("weekdayPage.target")}</label>
        <select id="target-weekday" value={target} onChange={(event) => setTarget(Number(event.target.value))}
          className="mt-2 w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-emerald-500">
          {keys.map((key, index) => <option key={key} value={index}>{t(`businessDaysCommon.days.${key}.long`)}</option>)}
        </select>
        <p className="mt-3 text-sm text-muted">{t("weekdayPage.rule")}</p>
        <div className="mt-5 flex min-h-14 flex-wrap items-center justify-between gap-3" aria-live="polite">
          {next ? <time dateTime={nextValue} className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            {new Intl.DateTimeFormat(locale, {dateStyle: "full", timeZone: "UTC"}).format(calendarDateToUtc(next))}
          </time> : <p className="text-sm text-muted">{selected ? t("weekdayPage.range") : t("weekdayPage.empty")}</p>}
          <CopyButton value={nextValue} />
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
