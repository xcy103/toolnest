"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Stop = { color: string; pos: number };
type Kind = "linear" | "radial";

function buildCss(kind: Kind, angle: number, stops: Stop[]): string {
  const parts = [...stops]
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `${s.color} ${s.pos}%`)
    .join(", ");
  return kind === "linear"
    ? `linear-gradient(${angle}deg, ${parts})`
    : `radial-gradient(circle, ${parts})`;
}

export default function GradientPage() {
  const t = useTranslations();
  const [kind, setKind] = useState<Kind>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#10b981", pos: 0 },
    { color: "#3b82f6", pos: 100 },
  ]);

  const css = buildCss(kind, angle, stops);

  function updateStop(i: number, patch: Partial<Stop>) {
    setStops((s) => s.map((stop, j) => (j === i ? { ...stop, ...patch } : stop)));
  }

  return (
    <ToolLayout
      title={t("tools.gradient.name")}
      description={t("gradientPage.description")}
      icon="🌈"
    >
      {/* Preview */}
      <div
        className="h-40 rounded-xl border border-border shadow-sm"
        style={{ background: css }}
      />

      {/* Controls */}
      <ToolPanel>
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex rounded-lg border border-border p-1">
            {(
              [
                ["linear", t("gradientPage.typeLinear")],
                ["radial", t("gradientPage.typeRadial")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  kind === value
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-foreground/70 hover:bg-foreground/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {kind === "linear" && (
            <div className="flex flex-1 items-center gap-3">
              <span className="text-sm font-medium text-foreground/70">
                {t("gradientPage.angleLabel")}: {angle}°
              </span>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="min-w-0 flex-1 accent-emerald-500"
              />
            </div>
          )}
        </div>
      </ToolPanel>

      {/* Stops */}
      <ToolPanel
        label={t("gradientPage.stopsLabel")}
        action={
          <button
            type="button"
            onClick={() =>
              setStops((s) => [...s, { color: "#8b5cf6", pos: 50 }])
            }
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
          >
            + {t("gradientPage.addStop")}
          </button>
        }
      >
        <ul className="space-y-2">
          {stops.map((stop, i) => (
            <li key={i} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="h-9 w-11 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
              />
              <input
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                spellCheck={false}
                className="w-24 rounded-lg border border-border bg-background p-2 font-mono text-sm outline-none focus:border-emerald-500 sm:w-28"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={stop.pos}
                onChange={(e) => updateStop(i, { pos: Number(e.target.value) })}
                className="min-w-0 flex-1 accent-emerald-500"
              />
              <span className="w-10 shrink-0 text-right font-mono text-sm text-muted">
                {stop.pos}%
              </span>
              <button
                type="button"
                onClick={() => setStops((s) => s.filter((_, j) => j !== i))}
                disabled={stops.length <= 2}
                aria-label={t("gradientPage.removeStop")}
                className="shrink-0 text-muted transition enabled:hover:text-red-500 disabled:opacity-30"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </ToolPanel>

      {/* CSS output */}
      <ToolPanel
        label={t("gradientPage.cssLabel")}
        action={<CopyButton value={`background: ${css};`} />}
      >
        <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
          background: {css};
        </pre>
      </ToolPanel>
    </ToolLayout>
  );
}
