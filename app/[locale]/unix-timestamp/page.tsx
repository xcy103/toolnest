"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import {
  parseUnixTimestamp,
  toLocalDatetimeInputValue,
  unixMilliseconds,
  unixSeconds,
  type TimestampUnit,
} from "@/lib/timestamp";

type Mode = "timestampToDate" | "dateToTimestamp";

function formatDate(ms: number, locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(ms);
}

function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/60 py-3 last:border-0 sm:flex-row sm:items-center">
      <span className="w-36 shrink-0 text-sm font-semibold text-foreground/80">
        {label}
      </span>
      <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-background p-2.5 font-mono text-xs text-foreground/90 sm:text-sm">
        {value}
      </code>
      <CopyButton value={value} className="self-start sm:self-auto" />
    </div>
  );
}

export default function UnixTimestampPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("timestampToDate");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [timestampText, setTimestampText] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    function init() {
      const now = Date.now();
      setNowMs(now);
      setTimestampText(String(unixSeconds(now)));
      setDateValue(toLocalDatetimeInputValue(now));
    }
    init();
  }, []);

  const parsed = useMemo(
    () => parseUnixTimestamp(timestampText, unit),
    [timestampText, unit],
  );

  const activeMs =
    mode === "timestampToDate"
      ? parsed.ok
        ? parsed.ms
        : null
      : dateValue
        ? new Date(dateValue).getTime()
        : null;

  const localTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  function setNow() {
    const now = Date.now();
    setNowMs(now);
    setTimestampText(unit === "seconds" ? String(unixSeconds(now)) : String(now));
    setDateValue(toLocalDatetimeInputValue(now));
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    if (activeMs !== null && Number.isFinite(activeMs)) {
      setTimestampText(
        unit === "seconds"
          ? String(unixSeconds(activeMs))
          : String(unixMilliseconds(activeMs)),
      );
      setDateValue(toLocalDatetimeInputValue(activeMs));
    }
  }

  function switchUnit(next: TimestampUnit) {
    if (next === unit) return;
    setUnit(next);
    if (activeMs !== null && Number.isFinite(activeMs)) {
      setTimestampText(
        next === "seconds"
          ? String(unixSeconds(activeMs))
          : String(unixMilliseconds(activeMs)),
      );
    }
  }

  const showError = mode === "timestampToDate" && !parsed.ok && parsed.key !== "empty";
  const error =
    showError && parsed.key === "integer"
      ? t("unixTimestampPage.errorInteger")
      : showError
        ? t("unixTimestampPage.errorRange")
        : "";

  const hasResult = activeMs !== null && Number.isFinite(activeMs);
  const iso = hasResult ? new Date(activeMs).toISOString() : "";

  return (
    <ToolLayout
      title={t("tools.unix-timestamp.name")}
      description={t("unixTimestampPage.description")}
      icon="⏱"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["timestampToDate", t("unixTimestampPage.modeTimestamp")],
              ["dateToTimestamp", t("unixTimestampPage.modeDate")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                mode === value
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={setNow}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
        >
          {t("unixTimestampPage.useNow")}
        </button>
      </div>

      {mode === "timestampToDate" ? (
        <ToolPanel label={t("unixTimestampPage.timestampLabel")}>
          <div className="flex flex-wrap items-stretch gap-3">
            <input
              value={timestampText}
              onChange={(e) => setTimestampText(e.target.value)}
              inputMode="numeric"
              spellCheck={false}
              placeholder={t("unixTimestampPage.timestampPlaceholder")}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
            />
            <div className="inline-flex shrink-0 rounded-lg border border-border p-1">
              {(
                [
                  ["seconds", t("unixTimestampPage.seconds")],
                  ["milliseconds", t("unixTimestampPage.milliseconds")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchUnit(value)}
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
              {error}
            </p>
          )}
        </ToolPanel>
      ) : (
        <ToolPanel label={t("unixTimestampPage.dateLabel", { tz: localTz || "…" })}>
          <input
            type="datetime-local"
            step="1"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
        </ToolPanel>
      )}

      <ToolPanel label={t("common.result")}>
        {hasResult ? (
          <div className="-my-3">
            <ResultRow
              label={t("unixTimestampPage.unixSeconds")}
              value={String(unixSeconds(activeMs))}
            />
            <ResultRow
              label={t("unixTimestampPage.unixMilliseconds")}
              value={String(unixMilliseconds(activeMs))}
            />
            <ResultRow label="ISO 8601" value={iso} />
            <ResultRow
              label={t("unixTimestampPage.localTime")}
              value={formatDate(activeMs, locale)}
            />
            <ResultRow
              label={t("unixTimestampPage.utcTime")}
              value={formatDate(activeMs, locale, "UTC")}
            />
          </div>
        ) : (
          <p className="py-4 text-center text-muted">
            {nowMs === null
              ? t("unixTimestampPage.loading")
              : t("unixTimestampPage.empty")}
          </p>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
