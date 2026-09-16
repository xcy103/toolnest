"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import WeekendSelector from "@/components/WeekendSelector";
import { businessDaysBetween } from "@/lib/business-days";
import { parseCalendarDate } from "@/lib/date-arithmetic";

export default function BusinessDaysPage() {
  const t = useTranslations();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEnd, setIncludeEnd] = useState(true);
  const [weekendDays, setWeekendDays] = useState([0, 6]);

  const calculation = useMemo(() => {
    const start = parseCalendarDate(startDate);
    const end = parseCalendarDate(endDate);
    if (!start || !end) return { state: "dates" as const };

    const result = businessDaysBetween(start, end, weekendDays, includeEnd);
    return result
      ? { state: "ready" as const, ...result }
      : { state: "order" as const };
  }, [endDate, includeEnd, startDate, weekendDays]);

  const copyValue =
    calculation.state === "ready" ? String(calculation.businessDays) : "";

  return (
    <ToolLayout
      title={t("tools.business-days.name")}
      description={t("businessDaysPage.description")}
      icon="💼"
    >
      <ToolPanel>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>{t("businessDaysPage.startDate")}</span>
            <input
              type="date"
              min="0001-01-01"
              max="9999-12-31"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>{t("businessDaysPage.endDate")}</span>
            <input
              type="date"
              min="0001-01-01"
              max="9999-12-31"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={includeEnd}
            onChange={(event) => setIncludeEnd(event.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          <span>{t("businessDaysPage.includeEnd")}</span>
        </label>

        <p className="mt-3 text-sm text-muted">{t("businessDaysPage.rangeRule")}</p>
      </ToolPanel>

      <ToolPanel>
        <WeekendSelector value={weekendDays} onChange={setWeekendDays} />
      </ToolPanel>

      <ToolPanel
        label={t("common.result")}
        action={<CopyButton value={copyValue} />}
      >
        <div className="min-h-28" aria-live="polite">
          {calculation.state === "ready" ? (
            <>
              <p className="text-4xl font-semibold text-emerald-600 dark:text-emerald-400">
                {t("businessDaysPage.businessDayCount", {
                  count: calculation.businessDays,
                })}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted">{t("businessDaysPage.countedDates")}</p>
                  <p className="mt-1 font-mono text-xl font-semibold">
                    {calculation.totalDays}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted">{t("businessDaysPage.nonBusinessDays")}</p>
                  <p className="mt-1 font-mono text-xl font-semibold">
                    {calculation.nonBusinessDays}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground/75">
                {t("businessDaysPage.summary", {
                  start: startDate,
                  end: endDate,
                  endRule: includeEnd
                    ? t("businessDaysPage.included")
                    : t("businessDaysPage.excluded"),
                })}
              </p>
            </>
          ) : (
            <p className="py-8 text-center text-muted">
              {t(`businessDaysPage.errors.${calculation.state}`)}
            </p>
          )}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
