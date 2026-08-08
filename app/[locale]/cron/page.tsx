"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type FieldKey = "minute" | "hour" | "dom" | "month" | "dow";

const FIELDS: { key: FieldKey; labelKey: string; min: number; max: number }[] = [
  { key: "minute", labelKey: "fieldMinute", min: 0, max: 59 },
  { key: "hour", labelKey: "fieldHour", min: 0, max: 23 },
  { key: "dom", labelKey: "fieldDayOfMonth", min: 1, max: 31 },
  { key: "month", labelKey: "fieldMonth", min: 1, max: 12 },
  { key: "dow", labelKey: "fieldDayOfWeek", min: 0, max: 7 },
];

type Describers = {
  any: string;
  step: (n: number) => string;
  name: (key: FieldKey, n: number) => string;
};

// Cron also accepts 3-letter names in the month and weekday fields.
const MONTH_NUM: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
const DOW_NUM: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/** Replace 3-letter month/weekday names with their numbers so the numeric parser handles them. */
function normalizeNames(raw: string, key: FieldKey): string {
  const map = key === "month" ? MONTH_NUM : key === "dow" ? DOW_NUM : null;
  if (!map) return raw;
  return raw.replace(/[a-z]{3}/gi, (m) => {
    const n = map[m.toLowerCase()];
    return n === undefined ? m : String(n);
  });
}

/** Describe one cron field (a step, range, list or single value), or null if invalid. */
function describeField(
  raw: string,
  key: FieldKey,
  min: number,
  max: number,
  d: Describers,
): string | null {
  const inRange = (n: number) => n >= min && n <= max;
  const parts = normalizeNames(raw, key).split(",").map((part): string | null => {
    if (part === "*") return d.any;

    let m = /^\*\/(\d+)$/.exec(part);
    if (m) {
      const n = Number(m[1]);
      return n >= 1 ? d.step(n) : null;
    }

    m = /^(\d+)-(\d+)(?:\/(\d+))?$/.exec(part);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      const step = m[3] ? Number(m[3]) : null;
      if (!inRange(a) || !inRange(b) || a > b) return null;
      if (step !== null && step < 1) return null;
      const base = `${d.name(key, a)}–${d.name(key, b)}`;
      return step !== null ? `${base} (${d.step(step)})` : base;
    }

    m = /^(\d+)$/.exec(part);
    if (m) {
      const n = Number(m[1]);
      return inRange(n) ? d.name(key, n) : null;
    }

    return null;
  });

  if (parts.some((p) => p === null)) return null;
  return parts.join(", ");
}

export default function CronPage() {
  const t = useTranslations();
  const [expr, setExpr] = useState("");

  const months = t("cronPage.months").split(",");
  const weekdays = t("cronPage.weekdays").split(",");

  const describers: Describers = useMemo(
    () => ({
      any: t("cronPage.any"),
      step: (n: number) => t("cronPage.step", { n }),
      name: (key: FieldKey, n: number) => {
        if (key === "month") return months[n - 1] ?? String(n);
        if (key === "dow") return weekdays[n % 7] ?? String(n);
        return String(n);
      },
    }),
    // months/weekdays derive from t; re-create when the locale (t) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const result = useMemo(() => {
    const trimmed = expr.trim();
    if (!trimmed) return null;
    const tokens = trimmed.split(/\s+/);
    if (tokens.length !== 5) return { error: true as const };
    const rows = FIELDS.map((f, i) => ({
      key: f.key,
      labelKey: f.labelKey,
      raw: tokens[i],
      desc: describeField(tokens[i], f.key, f.min, f.max, describers),
    }));
    return { error: false as const, rows };
  }, [expr, describers]);

  return (
    <ToolLayout
      title={t("tools.cron.name")}
      description={t("cronPage.description")}
      icon="⏰"
    >
      <ToolPanel>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder={t("cronPage.placeholder")}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background p-3 text-center font-mono text-lg outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {result?.error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          ⚠️ {t("cronPage.error")}
        </p>
      )}

      {result && !result.error && (
        <ToolPanel>
          <ul className="divide-y divide-border">
            {result.rows.map((row) => (
              <li
                key={row.key}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-foreground/80">
                  {t(`cronPage.${row.labelKey}`)}
                </span>
                <code className="w-16 shrink-0 font-mono text-sm text-muted">
                  {row.raw}
                </code>
                <span
                  className={`text-sm ${
                    row.desc === null
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground/90"
                  }`}
                >
                  {row.desc === null
                    ? `⚠️ ${t("cronPage.invalid")}`
                    : row.desc}
                </span>
              </li>
            ))}
          </ul>
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
