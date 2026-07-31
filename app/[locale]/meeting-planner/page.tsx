"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

/** Cities available to add. Labels come from `meetingPlannerPage.cities`. */
const ZONES: { id: string; tz: string }[] = [
  { id: "honolulu", tz: "Pacific/Honolulu" },
  { id: "losAngeles", tz: "America/Los_Angeles" },
  { id: "chicago", tz: "America/Chicago" },
  { id: "newYork", tz: "America/New_York" },
  { id: "saoPaulo", tz: "America/Sao_Paulo" },
  { id: "utc", tz: "UTC" },
  { id: "london", tz: "Europe/London" },
  { id: "berlin", tz: "Europe/Berlin" },
  { id: "paris", tz: "Europe/Paris" },
  { id: "dubai", tz: "Asia/Dubai" },
  { id: "newDelhi", tz: "Asia/Kolkata" },
  { id: "singapore", tz: "Asia/Singapore" },
  { id: "beijing", tz: "Asia/Shanghai" },
  { id: "tokyo", tz: "Asia/Tokyo" },
  { id: "sydney", tz: "Australia/Sydney" },
  { id: "auckland", tz: "Pacific/Auckland" },
];

const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_OPTIONS = Array.from({ length: 25 }, (_, i) => i);

/** Local hour (0–23) in a zone at a given instant. */
function hourInZone(ms: number, tz: string): number {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    hour12: false,
  }).format(ms);
  return Number(h) % 24;
}

function cellClass(hour: number, working: boolean): string {
  if (working) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (hour < 7 || hour >= 22) return "text-muted/50"; // asleep
  return "text-foreground/70";
}

export default function MeetingPlannerPage() {
  const t = useTranslations();
  const [selected, setSelected] = useState<string[]>([
    "losAngeles",
    "london",
    "beijing",
  ]);
  const [workStart, setWorkStart] = useState(9);
  const [workEnd, setWorkEnd] = useState(18);
  // The grid depends on today's date, so it's client-only to avoid a mismatch.
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    function init() {
      const d = new Date();
      setToday(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
    init();
  }, []);

  const zones = selected.map((id) => ZONE_BY_ID[id]).filter(Boolean);
  const available = ZONES.filter((z) => !selected.includes(z.id));
  const isWorking = (h: number) => workStart <= h && h < workEnd;

  const rows =
    today === null
      ? []
      : HOURS.map((i) => {
          const ms = today + i * 3_600_000;
          const cells = zones.map((z) => {
            const h = hourInZone(ms, z.tz);
            return { h, working: isWorking(h) };
          });
          return {
            key: i,
            cells,
            allWorking: cells.length > 0 && cells.every((c) => c.working),
          };
        });

  const hasOverlap = rows.some((r) => r.allWorking);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <ToolLayout
      title={t("tools.meeting-planner.name")}
      description={t("meetingPlannerPage.description")}
      icon="📅"
    >
      {/* Controls */}
      <ToolPanel>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              {t("meetingPlannerPage.workingHours")}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={workStart}
                onChange={(e) => setWorkStart(Number(e.target.value))}
                className="rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-emerald-500"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}:00
                  </option>
                ))}
              </select>
              <span className="text-muted">–</span>
              <select
                value={workEnd}
                onChange={(e) => setWorkEnd(Number(e.target.value))}
                className="rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-emerald-500"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          {available.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
                {t("meetingPlannerPage.addZone")}
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setSelected((s) => [...s, e.target.value]);
                }}
                className="rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">{t("meetingPlannerPage.addZone")}</option>
                {available.map((z) => (
                  <option key={z.id} value={z.id}>
                    {t(`meetingPlannerPage.cities.${z.id}`)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </ToolPanel>

      {/* Grid */}
      <ToolPanel>
        {zones.length === 0 ? (
          <p className="py-8 text-center text-muted">
            {t("meetingPlannerPage.empty")}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center text-sm">
                <thead>
                  <tr>
                    {zones.map((z) => (
                      <th
                        key={z.id}
                        className="border-b border-border p-2 font-semibold"
                      >
                        <div className="flex items-center justify-center gap-1">
                          {t(`meetingPlannerPage.cities.${z.id}`)}
                          <button
                            type="button"
                            onClick={() =>
                              setSelected((s) => s.filter((id) => id !== z.id))
                            }
                            aria-label={t("meetingPlannerPage.remove", {
                              city: t(`meetingPlannerPage.cities.${z.id}`),
                            })}
                            className="text-muted transition hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.key}
                      className={r.allWorking ? "bg-emerald-500/5" : ""}
                    >
                      {r.cells.map((c, i) => (
                        <td
                          key={i}
                          className={`p-1.5 font-mono ${cellClass(c.h, c.working)}`}
                        >
                          {pad(c.h)}:00
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {today !== null && (
              <p className="mt-4 text-sm text-muted">
                {hasOverlap
                  ? t("meetingPlannerPage.hint")
                  : t("meetingPlannerPage.noOverlap")}
              </p>
            )}
          </>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
