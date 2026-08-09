"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import {
  clampChannel as clamp,
  hslToRgb,
  parseHex,
  rgbToHex,
  rgbToHsl,
  type Rgb,
} from "@/lib/color";

const DEFAULT: Rgb = { r: 16, g: 185, b: 129 };

function numberField(
  label: string,
  value: number,
  max: number,
  onChange: (n: number) => void,
) {
  return (
    <label className="flex-1">
      <span className="mb-1 block text-center text-xs text-muted">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Math.round(Number(e.target.value)), max))}
        className="w-full rounded-lg border border-border bg-background p-2 text-center font-mono text-sm outline-none focus:border-emerald-500"
      />
    </label>
  );
}

export default function ColorConverterPage() {
  const t = useTranslations();
  const [rgb, setRgb] = useState<Rgb>(DEFAULT);
  const [hexText, setHexText] = useState(rgbToHex(DEFAULT));

  // Set the canonical colour *and* sync the hex text (used by every control
  // except the hex field itself, which keeps the raw text the user is typing).
  function applyRgb(next: Rgb) {
    setRgb(next);
    setHexText(rgbToHex(next));
  }

  function onHexChange(v: string) {
    setHexText(v);
    const parsed = parseHex(v);
    if (parsed) setRgb(parsed);
  }

  const hsl = rgbToHsl(rgb);
  const hexValid = parseHex(hexText) !== null;
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout
      title={t("tools.color-converter.name")}
      description={t("colorConverterPage.description")}
      icon="🎨"
    >
      {/* Preview + picker */}
      <ToolPanel>
        <div className="flex items-center gap-4">
          <div
            className="h-24 w-24 shrink-0 rounded-xl border border-border shadow-inner"
            style={{ backgroundColor: rgbToHex(rgb) }}
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-foreground/5">
            <input
              type="color"
              value={rgbToHex(rgb)}
              onChange={(e) => applyRgb(parseHex(e.target.value)!)}
              className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
            />
            {t("colorConverterPage.pick")}
          </label>
        </div>
      </ToolPanel>

      {/* HEX */}
      <ToolPanel
        label={t("colorConverterPage.hex")}
        action={<CopyButton value={hexValid ? rgbToHex(rgb) : ""} />}
      >
        <input
          value={hexText}
          onChange={(e) => onHexChange(e.target.value)}
          spellCheck={false}
          className={`w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500 ${
            hexValid ? "border-border" : "border-red-500"
          }`}
        />
      </ToolPanel>

      {/* RGB */}
      <ToolPanel
        label={t("colorConverterPage.rgb")}
        action={<CopyButton value={rgbString} />}
      >
        <div className="flex gap-3">
          {numberField("R", rgb.r, 255, (r) => applyRgb({ ...rgb, r }))}
          {numberField("G", rgb.g, 255, (g) => applyRgb({ ...rgb, g }))}
          {numberField("B", rgb.b, 255, (b) => applyRgb({ ...rgb, b }))}
        </div>
      </ToolPanel>

      {/* HSL */}
      <ToolPanel
        label={t("colorConverterPage.hsl")}
        action={<CopyButton value={hslString} />}
      >
        <div className="flex gap-3">
          {numberField("H", hsl.h, 360, (h) => applyRgb(hslToRgb({ ...hsl, h })))}
          {numberField("S", hsl.s, 100, (s) => applyRgb(hslToRgb({ ...hsl, s })))}
          {numberField("L", hsl.l, 100, (l) => applyRgb(hslToRgb({ ...hsl, l })))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
