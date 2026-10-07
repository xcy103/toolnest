"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { borderRadiusValue, updateCorner, type Corners, type RadiusUnit } from "@/lib/border-radius";

const cornerKeys = ["topLeft", "topRight", "bottomRight", "bottomLeft"] as const;

export default function BorderRadiusPage() {
  const t = useTranslations();
  const [corners, setCorners] = useState<Corners>([24, 24, 24, 24]);
  const [unit, setUnit] = useState<RadiusUnit>("px");
  const [linked, setLinked] = useState(true);
  const max = unit === "px" ? 200 : 100;
  const radius = borderRadiusValue(corners, unit);
  const css = `border-radius: ${radius};`;

  function change(index: number, raw: number) {
    const value = Number.isFinite(raw) ? Math.min(max, Math.max(0, Math.round(raw))) : 0;
    setCorners((current) => updateCorner(current, index, value, linked));
  }

  return (
    <ToolLayout title={t("tools.border-radius.name")} description={t("borderRadiusPage.description")} icon="◩">
      <div className="flex h-60 items-center justify-center bg-foreground/5" aria-label={t("borderRadiusPage.preview")}>
        <div data-testid="radius-preview" className="flex h-36 w-56 max-w-full items-center justify-center border-2 border-emerald-600 bg-emerald-500/15 text-sm font-medium" style={{ borderRadius: radius }}>
          {t("borderRadiusPage.preview")}
        </div>
      </div>
      <ToolPanel label={t("borderRadiusPage.corners")} action={<button type="button" onClick={() => { setCorners([16, 64, 32, 8]); setUnit("px"); setLinked(false); }} className="text-sm text-muted hover:text-foreground">{t("borderRadiusPage.example")}</button>}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={linked} onChange={(e) => { setLinked(e.target.checked); if (e.target.checked) setCorners([corners[0], corners[0], corners[0], corners[0]]); }} className="h-4 w-4 accent-emerald-500" />{t("borderRadiusPage.linked")}</label>
          <div className="inline-flex rounded-lg border border-border p-1" aria-label={t("borderRadiusPage.unit")}>
            {(["px", "%"] as const).map((value) => <button key={value} type="button" aria-pressed={unit === value} onClick={() => { setUnit(value); setCorners(corners.map((v) => Math.min(v, value === "px" ? 200 : 100)) as Corners); }} className={`rounded-md px-4 py-2 text-sm ${unit === value ? "bg-emerald-500 text-white" : "hover:bg-foreground/5"}`}>{value}</button>)}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {cornerKeys.map((key, index) => <div key={key}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor={`radius-${key}`} className="text-sm font-medium">{t(`borderRadiusPage.${key}`)}</label>
              <div className="flex w-28 items-center gap-1"><input type="number" min={0} max={max} step={1} value={corners[index]} onChange={(e) => change(index, Number(e.target.value))} aria-label={t(`borderRadiusPage.${key}`) + " " + t("borderRadiusPage.number")} className="w-20 rounded-lg border border-border bg-background p-2 font-mono text-sm outline-none focus:border-emerald-500" /><span className="text-xs text-muted">{unit}</span></div>
            </div>
            <input id={`radius-${key}`} type="range" min={0} max={max} value={corners[index]} onChange={(e) => change(index, Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>)}
        </div>
      </ToolPanel>
      <ToolPanel label="CSS" action={<CopyButton value={css} />}><pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 font-mono text-sm">{css}</pre></ToolPanel>
    </ToolLayout>
  );
}
