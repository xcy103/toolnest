"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type Mode = "countdown" | "diff";

/** Parse a `<input type="date">` value as *local* midnight (not UTC). */
function parseLocalDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Break a span (a ≤ b) into calendar years, months and days. */
function calendarDiff(a: Date, b: Date) {
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months--;
    // Borrow the days in a's own month — always ≥ a's day-of-month, so this can
    // never leave `days` negative (borrowing b's previous month can, e.g. Jan 31).
    days += new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

export default function CountdownPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("countdown");
  const [target, setTarget] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // Live "now" for the countdown; client-only so SSR/hydration agree.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setNow(Date.now());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const targetMs = target ? new Date(target).getTime() : NaN;

  // Countdown breakdown from the absolute remaining/elapsed milliseconds.
  let countdown: {
    past: boolean;
    d: number;
    h: number;
    m: number;
    s: number;
  } | null = null;
  if (now !== null && Number.isFinite(targetMs)) {
    const delta = targetMs - now;
    const abs = Math.floor(Math.abs(delta) / 1000);
    countdown = {
      past: delta < 0,
      d: Math.floor(abs / 86400),
      h: Math.floor((abs % 86400) / 3600),
      m: Math.floor((abs % 3600) / 60),
      s: abs % 60,
    };
  }

  // Date difference (order-independent).
  const fromDate = parseLocalDate(from);
  const toDate = parseLocalDate(to);
  let diff: {
    cal: ReturnType<typeof calendarDiff>;
    totalDays: number;
    weeks: number;
  } | null = null;
  if (fromDate && toDate) {
    const [a, b] =
      fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate];
    const totalDays = Math.round((b.getTime() - a.getTime()) / 86_400_000);
    diff = {
      cal: calendarDiff(a, b),
      totalDays,
      weeks: Math.floor(totalDays / 7),
    };
  }

  return (
    <ToolLayout
      title={t("tools.countdown.name")}
      description={t("countdownPage.description")}
      icon="⏳"
    >
      {/* Mode tabs */}
      <div className="inline-flex rounded-lg border border-border p-1">
        {(
          [
            ["countdown", t("countdownPage.modeCountdown")],
            ["diff", t("countdownPage.modeDiff")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
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

      {mode === "countdown" ? (
        <>
          <ToolPanel label={t("countdownPage.targetLabel")}>
            <input
              type="datetime-local"
              step="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
            />
          </ToolPanel>

          <ToolPanel>
            {countdown === null ? (
              <p className="py-4 text-center text-muted">
                {t("countdownPage.pickTarget")}
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm font-semibold text-foreground/80">
                  {countdown.past
                    ? t("countdownPage.statusElapsed")
                    : t("countdownPage.statusRemaining")}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <Tile value={countdown.d} label={t("countdownPage.unitDays")} />
                  <Tile value={countdown.h} label={t("countdownPage.unitHours")} />
                  <Tile
                    value={countdown.m}
                    label={t("countdownPage.unitMinutes")}
                  />
                  <Tile
                    value={countdown.s}
                    label={t("countdownPage.unitSeconds")}
                  />
                </div>
              </>
            )}
          </ToolPanel>
        </>
      ) : (
        <>
          <ToolPanel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
                  {t("countdownPage.fromLabel")}
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
                  {t("countdownPage.toLabel")}
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </ToolPanel>

          <ToolPanel label={t("countdownPage.durationLabel")}>
            {diff === null ? (
              <p className="py-4 text-center text-muted">
                {t("countdownPage.pickDates")}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Tile
                    value={diff.cal.years}
                    label={t("countdownPage.unitYears")}
                  />
                  <Tile
                    value={diff.cal.months}
                    label={t("countdownPage.unitMonths")}
                  />
                  <Tile
                    value={diff.cal.days}
                    label={t("countdownPage.unitDays")}
                  />
                </div>
                <p className="mt-4 text-center text-sm text-muted">
                  {t("countdownPage.totals", {
                    days: diff.totalDays,
                    weeks: diff.weeks,
                  })}
                </p>
              </>
            )}
          </ToolPanel>
        </>
      )}
    </ToolLayout>
  );
}
