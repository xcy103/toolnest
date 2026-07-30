"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

/** Cities shown, in display order. Labels come from `worldClockPage.cities`. */
const CITIES: { id: string; tz: string }[] = [
  { id: "utc", tz: "UTC" },
  { id: "losAngeles", tz: "America/Los_Angeles" },
  { id: "newYork", tz: "America/New_York" },
  { id: "saoPaulo", tz: "America/Sao_Paulo" },
  { id: "london", tz: "Europe/London" },
  { id: "paris", tz: "Europe/Paris" },
  { id: "dubai", tz: "Asia/Dubai" },
  { id: "newDelhi", tz: "Asia/Kolkata" },
  { id: "beijing", tz: "Asia/Shanghai" },
  { id: "tokyo", tz: "Asia/Tokyo" },
  { id: "sydney", tz: "Australia/Sydney" },
];

function fmtTime(ms: number, tz: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(ms);
}

function fmtDate(ms: number, tz: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(ms);
}

/** Short UTC offset for a zone, e.g. "GMT+8". */
function offset(ms: number, tz: string): string {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  })
    .formatToParts(ms)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? "";
}

/** Hour (0–23) in the zone, for a day/night indicator. */
function hourIn(ms: number, tz: string): number {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    hour12: false,
  }).format(ms);
  return Number(h) % 24;
}

function Clock({
  label,
  tz,
  now,
  locale,
}: {
  label: string;
  tz: string;
  // null until the client mounts — only the live time is client-only; the city
  // label and layout render on the server so they're in the static HTML.
  now: number | null;
  locale: string;
}) {
  const hour = now !== null ? hourIn(now, tz) : -1;
  const daytime = hour >= 6 && hour < 18;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{label}</span>
        {now !== null && (
          <span aria-hidden className="text-lg">
            {daytime ? "☀️" : "🌙"}
          </span>
        )}
      </div>
      <div className="mt-3 font-mono text-3xl font-bold tracking-tight text-foreground">
        {now !== null ? fmtTime(now, tz, locale) : "--:--:--"}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-sm text-muted">
        <span>{now !== null ? fmtDate(now, tz, locale) : " "}</span>
        <span className="font-mono">{now !== null ? offset(now, tz) : ""}</span>
      </div>
    </div>
  );
}

export default function WorldClockPage() {
  const t = useTranslations();
  const locale = useLocale();

  // Time is client-only: rendering Date.now() on the server would mismatch on
  // hydration and can't be static. Start null, then tick every second.
  const [now, setNow] = useState<number | null>(null);
  const [localTz, setLocalTz] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setNow(Date.now());
    }
    function init() {
      setLocalTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
      tick();
    }
    init();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <ToolLayout
      title={t("tools.world-clock.name")}
      description={t("worldClockPage.description")}
      icon="🌍"
    >
      <ToolPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Local time first, if it isn't already one of the listed zones. */}
          {localTz && !CITIES.some((c) => c.tz === localTz) && (
            <Clock
              label={t("worldClockPage.localLabel")}
              tz={localTz}
              now={now}
              locale={locale}
            />
          )}
          {CITIES.map((city) => (
            <Clock
              key={city.id}
              label={t(`worldClockPage.cities.${city.id}`)}
              tz={city.tz}
              now={now}
              locale={locale}
            />
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
