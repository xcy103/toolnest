"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { parseAspectInteger, reduceAspectRatio, solveAspectDimension, formatAspectValue, type Rounding } from "@/lib/aspect-ratio";

const fieldClass = "w-full min-w-0 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500";

export default function AspectRatioPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<"reduce" | "solve">("reduce");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [preset, setPreset] = useState("16:9");
  const [ratioWidth, setRatioWidth] = useState("16");
  const [ratioHeight, setRatioHeight] = useState("9");
  const [side, setSide] = useState<"width" | "height">("width");
  const [known, setKnown] = useState("");
  const [rounding, setRounding] = useState<Rounding>("nearest");
  let output = "";
  let detail = "";
  let error = "";
  const active = mode === "reduce" ? width !== "" || height !== "" : known !== "";
  if (active) {
    try {
      if (mode === "reduce") {
        const ratio = reduceAspectRatio(parseAspectInteger(width), parseAspectInteger(height));
        output = `${ratio[0]}:${ratio[1]}`;
      } else {
        const result = solveAspectDimension(parseAspectInteger(known), parseAspectInteger(ratioWidth), parseAspectInteger(ratioHeight), side, rounding);
        output = String(result.rounded);
        detail = t("aspectRatioPage.detail", { value: formatAspectValue(result.value), fraction: result.fraction });
      }
    } catch (e) {
      error = t(e instanceof RangeError && e.message === "result" ? "aspectRatioPage.resultError" : "aspectRatioPage.inputError");
    }
  }
  function field(label: string, value: string, change: (value: string) => void) {
    return <label className="block min-w-0"><span className="mb-2 block text-sm font-medium">{label}</span><input aria-label={label} value={value} onChange={(e) => change(e.target.value)} inputMode="numeric" className={fieldClass} /></label>;
  }
  return (
    <ToolLayout title={t("tools.aspect-ratio.name")} description={t("aspectRatioPage.description")} icon="W:H">
      <div className="inline-flex flex-wrap rounded-lg border border-border p-1">
        {(["reduce", "solve"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`rounded-md px-3 py-2 text-sm ${mode === value ? "bg-emerald-500 text-white" : "hover:bg-foreground/5"}`}>{t(`aspectRatioPage.${value}`)}</button>)}
      </div>
      <ToolPanel label={t("aspectRatioPage.inputs")} action={<div className="flex gap-3 text-sm"><button type="button" onClick={() => { if(mode === "reduce") {setWidth("1920");setHeight("1080");} else {setKnown("100");setSide("width");setPreset("16:9");setRatioWidth("16");setRatioHeight("9");} }} className="text-muted hover:text-foreground">{t("aspectRatioPage.example")}</button><button type="button" onClick={() => {setWidth("");setHeight("");setKnown("");}} className="text-muted hover:text-foreground">{t("common.clear")}</button></div>}>
        {mode === "reduce" ? <div className="grid gap-4 sm:grid-cols-2">{field(t("aspectRatioPage.width"),width,setWidth)}{field(t("aspectRatioPage.height"),height,setHeight)}</div> : <div className="space-y-4">
          <label className="block text-sm font-medium">{t("aspectRatioPage.ratio")}<select aria-label={t("aspectRatioPage.ratio")} value={preset} onChange={(e) => {setPreset(e.target.value); if(e.target.value !== "custom") { const [w,h] = e.target.value.split(":"); setRatioWidth(w);setRatioHeight(h);}}} className={`${fieldClass} mt-2`}>{["16:9","4:3","1:1","9:16","3:2","21:9"].map((v) => <option key={v}>{v}</option>)}<option value="custom">{t("aspectRatioPage.custom")}</option></select></label>
          {preset === "custom" && <div className="grid grid-cols-2 gap-4">{field(t("aspectRatioPage.ratioWidth"),ratioWidth,setRatioWidth)}{field(t("aspectRatioPage.ratioHeight"),ratioHeight,setRatioHeight)}</div>}
          <label className="block text-sm font-medium">{t("aspectRatioPage.knownSide")}<select aria-label={t("aspectRatioPage.knownSide")} value={side} onChange={(e) => setSide(e.target.value as "width" | "height")} className={`${fieldClass} mt-2`}><option value="width">{t("aspectRatioPage.width")}</option><option value="height">{t("aspectRatioPage.height")}</option></select></label>
          {field(t("aspectRatioPage.known"),known,setKnown)}
          <label className="block text-sm font-medium">{t("aspectRatioPage.rounding")}<select aria-label={t("aspectRatioPage.rounding")} value={rounding} onChange={(e) => setRounding(e.target.value as Rounding)} className={`${fieldClass} mt-2`}>{(["nearest","floor","ceil"] as const).map((v) => <option key={v} value={v}>{t(`aspectRatioPage.roundings.${v}`)}</option>)}</select></label>
        </div>}
      </ToolPanel>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <ToolPanel label={mode === "reduce" ? t("aspectRatioPage.ratio") : t(side === "width" ? "aspectRatioPage.height" : "aspectRatioPage.width")} action={<CopyButton value={output} />}>
        <output className="block break-words font-mono text-2xl">{output || "—"}</output>
        {detail && <p className="mt-3 break-words text-sm text-muted">{detail}</p>}
      </ToolPanel>
    </ToolLayout>
  );
}
