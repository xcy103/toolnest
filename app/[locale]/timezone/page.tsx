"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Unit = "s" | "ms";

/** Timezones shown in the comparison table; labels come from the messages. */
const ZONES: { id: string; labelKey: string }[] = [
  { id: "UTC", labelKey: "utc" },
  { id: "Asia/Shanghai", labelKey: "shanghai" },
  { id: "Asia/Tokyo", labelKey: "tokyo" },
  { id: "Europe/London", labelKey: "london" },
  { id: "America/New_York", labelKey: "newYork" },
  { id: "America/Los_Angeles", labelKey: "losAngeles" },
];

/** Format an epoch-ms value in a given IANA timezone, in the UI locale. */
function formatInZone(ms: number, timeZone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(ms);
}

/** Epoch-ms → the value a <input type="datetime-local"> expects, in local time. */
function toLocalInputValue(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export default function TimezonePage() {
  const t = useTranslations();
  const locale = useLocale();

  // Source of truth: epoch milliseconds. null until mounted (avoids SSR mismatch).
  const [tsMs, setTsMs] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit>("s");
  // Raw text of the timestamp field, so partial/invalid typing isn't clobbered.
  const [tsText, setTsText] = useState("");
  const [error, setError] = useState("");

  // Initialize to "now" on the client only (Date.now() during render would
  // cause an SSR/hydration mismatch).
  useEffect(() => {
    function init() {
      const now = Date.now();
      setTsMs(now);
      setTsText(String(Math.floor(now / 1000)));
    }
    init();
  }, []);

  const localTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  function setNow() {
    const now = Date.now();
    setTsMs(now);
    setError("");
    setTsText(unit === "s" ? String(Math.floor(now / 1000)) : String(now));
  }

  function onUnitChange(next: Unit) {
    if (next === unit || tsMs == null) return;
    setUnit(next);
    setTsText(next === "s" ? String(Math.floor(tsMs / 1000)) : String(tsMs));
  }

  function onTimestampChange(text: string) {
    setTsText(text);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("");
      return;
    }
    if (!/^-?\d+$/.test(trimmed)) {
      setError(t("timezonePage.errorInteger"));
      return;
    }
    const n = Number(trimmed);
    const ms = unit === "s" ? n * 1000 : n;
    if (!Number.isFinite(ms)) {
      setError(t("timezonePage.errorRange"));
      return;
    }
    setError("");
    setTsMs(ms);
  }

  function onDateChange(value: string) {
    if (!value) return;
    const ms = new Date(value).getTime();
    if (Number.isNaN(ms)) {
      setError(t("timezonePage.errorDate"));
      return;
    }
    setError("");
    setTsMs(ms);
    setTsText(unit === "s" ? String(Math.floor(ms / 1000)) : String(ms));
  }

  const isoText = tsMs != null && !error ? new Date(tsMs).toISOString() : "";

  return (
    <ToolLayout
      title={t("tools.timezone.name")}
      description={t("timezonePage.description")}
      icon="🕐"
    >
      {/* Timestamp ↔ date */}
      <ToolPanel
        label={t("timezonePage.tsLabel")}
        action={
          <button
            type="button"
            onClick={setNow}
            className="text-sm text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
          >
            {t("timezonePage.useNow")}
          </button>
        }
      >
        <div className="flex flex-wrap items-stretch gap-3">
          <input
            value={tsText}
            onChange={(e) => onTimestampChange(e.target.value)}
            inputMode="numeric"
            placeholder={t("timezonePage.tsPlaceholder")}
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
          <div className="inline-flex shrink-0 rounded-lg border border-border p-1">
            {(
              [
                ["s", t("timezonePage.unitSeconds")],
                ["ms", t("timezonePage.unitMilliseconds")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onUnitChange(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  unit === value
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
            {t("timezonePage.dateLabel", { tz: localTz || "…" })}
          </label>
          <input
            type="datetime-local"
            step="1"
            value={tsMs != null && !error ? toLocalInputValue(tsMs) : ""}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {isoText && (
          <div className="mt-4 flex items-center gap-3">
            <span className="w-20 shrink-0 text-sm font-semibold text-foreground/80">
              ISO 8601
            </span>
            <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-background p-2.5 font-mono text-xs text-foreground/90 sm:text-sm">
              {isoText}
            </code>
            <CopyButton value={isoText} className="shrink-0" />
          </div>
        )}
      </ToolPanel>

      {/* Multi-timezone comparison */}
      <ToolPanel label={t("timezonePage.compareLabel")}>
        {tsMs == null || error ? (
          <p className="text-sm text-muted">
            {t("timezonePage.comparePlaceholder")}
          </p>
        ) : (
          <ul className="space-y-2">
            {ZONES.map((zone) => (
              <li
                key={zone.id}
                className="flex flex-col gap-1 border-b border-border/60 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-foreground/80">
                  {t(`timezonePage.zones.${zone.labelKey}`)}
                </span>
                <code className="font-mono text-sm text-foreground/90">
                  {formatInZone(tsMs, zone.id, locale)}
                </code>
              </li>
            ))}
          </ul>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
