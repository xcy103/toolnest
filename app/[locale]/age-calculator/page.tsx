"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { calculateAge } from "@/lib/age";
import {
  calendarDateToUtc,
  formatCalendarDate,
  localTodayInputValue,
  parseCalendarDate,
} from "@/lib/date-arithmetic";

export default function AgeCalculatorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [birthValue, setBirthValue] = useState("");
  const [asOfValue, setAsOfValue] = useState("");
  const birth = parseCalendarDate(birthValue);
  const asOf = parseCalendarDate(asOfValue);
  const result = birth && asOf ? calculateAge(birth, asOf) : null;
  const nextBirthdayValue = result?.nextBirthday ? formatCalendarDate(result.nextBirthday) : "";
  const nextBirthdayText = result?.nextBirthday
    ? new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }).format(calendarDateToUtc(result.nextBirthday))
    : "";
  const copyValue = result ? `${result.years}y ${result.months}m ${result.days}d` : "";

  return (
    <ToolLayout title={t("tools.age-calculator.name")} description={t("ageCalculatorPage.description")} icon="🎂">
      <ToolPanel>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>{t("ageCalculatorPage.birthDate")}</span>
            <input type="date" min="0001-01-01" max="9999-12-31" value={birthValue}
              onChange={(event) => setBirthValue(event.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500" />
          </label>
          <div className="space-y-2 text-sm font-medium">
            <label htmlFor="age-as-of" className="block">{t("ageCalculatorPage.asOf")}</label>
            <div className="flex gap-2">
              <input id="age-as-of" type="date" min="0001-01-01" max="9999-12-31" value={asOfValue}
                onChange={(event) => setAsOfValue(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500" />
              <button type="button" onClick={() => setAsOfValue(localTodayInputValue())}
                className="shrink-0 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5">
                {t("dateCalculatorPage.today")}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">{t("ageCalculatorPage.leapRule")}</p>
      </ToolPanel>

      <ToolPanel label={t("common.result")} action={<CopyButton value={copyValue} />}>
        <div className="min-h-24" aria-live="polite">
          {result ? <>
            <div className="grid grid-cols-3 gap-3">
              {(["years", "months", "days"] as const).map((key) => (
                <div key={key} className="rounded-lg border border-border bg-background p-3 text-center">
                  <p className="font-mono text-2xl font-semibold text-emerald-600 dark:text-emerald-400 sm:text-3xl">{result[key]}</p>
                  <p className="mt-1 text-xs text-muted">{t(`ageCalculatorPage.units.${key}`)}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">{t("ageCalculatorPage.totalDays", { days: result.totalDays })}</p>
            {result.birthdayToday && <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t("ageCalculatorPage.birthdayToday")}</p>}
          </> : <p className="py-7 text-center text-muted">
            {t(birth && asOf ? "ageCalculatorPage.future" : "ageCalculatorPage.empty")}
          </p>}
        </div>
      </ToolPanel>

      <ToolPanel label={t("ageCalculatorPage.nextBirthday")}
        action={<CopyButton value={nextBirthdayValue} />}>
        {result?.nextBirthday && result.daysUntilBirthday !== null ? <div aria-live="polite">
          <time dateTime={nextBirthdayValue} className="block text-xl font-semibold text-emerald-600 dark:text-emerald-400 sm:text-2xl">{nextBirthdayText}</time>
          <p className="mt-2 font-mono text-sm text-muted">{nextBirthdayValue}</p>
          <p className="mt-3 text-sm text-foreground/75">{t("ageCalculatorPage.daysRemaining", { days: result.daysUntilBirthday })}</p>
        </div> : <p className="py-4 text-sm text-muted">{result ? t("ageCalculatorPage.outOfRange") : t("ageCalculatorPage.empty")}</p>}
      </ToolPanel>
      <p className="text-sm text-muted">{t("ageCalculatorPage.disclaimer")}</p>
    </ToolLayout>
  );
}
