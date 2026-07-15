"use client";

import { useEffect, useMemo, useState } from "react";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Unit = "s" | "ms";

/** Timezones shown in the comparison table. */
const ZONES: { id: string; label: string }[] = [
  { id: "UTC", label: "UTC" },
  { id: "Asia/Shanghai", label: "北京 / 上海" },
  { id: "Asia/Tokyo", label: "东京" },
  { id: "Europe/London", label: "伦敦" },
  { id: "America/New_York", label: "纽约" },
  { id: "America/Los_Angeles", label: "洛杉矶" },
];

/** Format an epoch-ms value in a given IANA timezone. */
function formatInZone(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
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
      setError("时间戳必须是整数。");
      return;
    }
    const n = Number(trimmed);
    const ms = unit === "s" ? n * 1000 : n;
    if (!Number.isFinite(ms)) {
      setError("时间戳超出可表示范围。");
      return;
    }
    setError("");
    setTsMs(ms);
  }

  function onDateChange(value: string) {
    if (!value) return;
    const ms = new Date(value).getTime();
    if (Number.isNaN(ms)) {
      setError("日期无效。");
      return;
    }
    setError("");
    setTsMs(ms);
    setTsText(unit === "s" ? String(Math.floor(ms / 1000)) : String(ms));
  }

  const isoText = tsMs != null && !error ? new Date(tsMs).toISOString() : "";

  return (
    <ToolLayout
      title="时区与时间戳"
      description="Unix 时间戳与日期互相转换,并在多个时区实时对照。所有计算在浏览器本地完成。"
      icon="🕐"
    >
      {/* Timestamp ↔ date */}
      <ToolPanel
        label="时间戳"
        action={
          <button
            type="button"
            onClick={setNow}
            className="text-sm text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
          >
            使用当前时间
          </button>
        }
      >
        <div className="flex flex-wrap items-stretch gap-3">
          <input
            value={tsText}
            onChange={(e) => onTimestampChange(e.target.value)}
            inputMode="numeric"
            placeholder="Unix 时间戳"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
          <div className="inline-flex shrink-0 rounded-lg border border-border p-1">
            {(
              [
                ["s", "秒"],
                ["ms", "毫秒"],
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
            日期时间(本地 · {localTz || "…"})
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
      <ToolPanel label="多时区对照">
        {tsMs == null || error ? (
          <p className="text-sm text-muted">对照结果会显示在这里…</p>
        ) : (
          <ul className="space-y-2">
            {ZONES.map((zone) => (
              <li
                key={zone.id}
                className="flex flex-col gap-1 border-b border-border/60 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-foreground/80">
                  {zone.label}
                </span>
                <code className="font-mono text-sm text-foreground/90">
                  {formatInZone(tsMs, zone.id)}
                </code>
              </li>
            ))}
          </ul>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
