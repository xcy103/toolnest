"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import {
  boxShadowDeclaration,
  boxShadowValue,
  BOX_SHADOW_LIMITS,
  type ShadowLayer,
} from "@/lib/box-shadow";

type Layer = ShadowLayer & { id: number };
type NumericKey = "x" | "y" | "blur" | "spread" | "opacity";

const INITIAL_LAYER: Layer = {
  id: 1,
  x: 0,
  y: 12,
  blur: 28,
  spread: -8,
  color: "#0f172a",
  opacity: 30,
  inset: false,
};

const EXAMPLE_LAYERS: Layer[] = [
  { ...INITIAL_LAYER, id: 1, y: 18, blur: 38, spread: -12, opacity: 28 },
  { ...INITIAL_LAYER, id: 2, y: 4, blur: 10, spread: -4, color: "#10b981", opacity: 22 },
];

const numericControls: Array<{
  key: NumericKey;
  min: number;
  max: number;
  unit: "px" | "%";
}> = [
  { key: "x", min: -BOX_SHADOW_LIMITS.offset, max: BOX_SHADOW_LIMITS.offset, unit: "px" },
  { key: "y", min: -BOX_SHADOW_LIMITS.offset, max: BOX_SHADOW_LIMITS.offset, unit: "px" },
  { key: "blur", min: 0, max: BOX_SHADOW_LIMITS.blur, unit: "px" },
  { key: "spread", min: -BOX_SHADOW_LIMITS.spread, max: BOX_SHADOW_LIMITS.spread, unit: "px" },
  { key: "opacity", min: 0, max: 100, unit: "%" },
];

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export default function BoxShadowPage() {
  const t = useTranslations();
  const [layers, setLayers] = useState<Layer[]>([INITIAL_LAYER]);
  const [selectedId, setSelectedId] = useState(1);
  const [nextId, setNextId] = useState(2);
  const selected = layers.find((layer) => layer.id === selectedId) ?? layers[0];

  const shadowValue = useMemo(() => boxShadowValue(layers), [layers]);
  const declaration = useMemo(() => boxShadowDeclaration(layers), [layers]);

  function updateLayer(patch: Partial<ShadowLayer>) {
    setLayers((current) =>
      current.map((layer) => (layer.id === selected.id ? { ...layer, ...patch } : layer)),
    );
  }

  function addLayer() {
    if (layers.length >= BOX_SHADOW_LIMITS.layers) return;
    const layer: Layer = {
      ...INITIAL_LAYER,
      id: nextId,
      x: layers.length * 2,
      y: 4 + layers.length * 4,
      blur: 10 + layers.length * 6,
      spread: -2 - layers.length * 2,
      opacity: 18,
    };
    setLayers((current) => [...current, layer]);
    setSelectedId(nextId);
    setNextId((value) => value + 1);
  }

  function removeSelected() {
    if (layers.length === 1) return;
    const remaining = layers.filter((layer) => layer.id !== selected.id);
    setLayers(remaining);
    setSelectedId(remaining[0].id);
  }

  function loadExample() {
    setLayers(EXAMPLE_LAYERS);
    setSelectedId(1);
    setNextId(3);
  }

  return (
    <ToolLayout
      title={t("tools.box-shadow.name")}
      description={t("boxShadowPage.description")}
      icon="▣"
    >
      <div
        className="flex min-h-56 items-center justify-center rounded-lg border border-border bg-foreground/5 p-10"
        aria-label={t("boxShadowPage.preview")}
      >
        <div
          className="flex h-28 w-44 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold text-foreground/70"
          style={{ boxShadow: shadowValue }}
        >
          {t("boxShadowPage.preview")}
        </div>
      </div>

      <ToolPanel
        label={t("boxShadowPage.layers")}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadExample}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              {t("boxShadowPage.example")}
            </button>
            <button
              type="button"
              onClick={addLayer}
              disabled={layers.length >= BOX_SHADOW_LIMITS.layers}
              aria-label={t("boxShadowPage.addLayer")}
              title={t("boxShadowPage.addLayer")}
              className="h-9 w-9 rounded-lg border border-border text-lg transition enabled:hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
            <button
              type="button"
              onClick={removeSelected}
              disabled={layers.length === 1}
              aria-label={t("boxShadowPage.removeLayer")}
              title={t("boxShadowPage.removeLayer")}
              className="h-9 w-9 rounded-lg border border-border text-lg transition enabled:hover:border-red-500 enabled:hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ×
            </button>
          </div>
        }
      >
        <div className="mb-5 flex flex-wrap gap-2" aria-label={t("boxShadowPage.layers")}>
          {layers.map((layer, index) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedId(layer.id)}
              aria-pressed={layer.id === selected.id}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                layer.id === selected.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "border border-border text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {t("boxShadowPage.layer", { number: index + 1 })}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {numericControls.map((control) => {
            const label = t(`boxShadowPage.controls.${control.key}`);
            return (
              <div key={control.key}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-foreground/80" htmlFor={`shadow-${control.key}`}>
                    {label}
                  </label>
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min={control.min}
                      max={control.max}
                      value={selected[control.key]}
                      onChange={(event) =>
                        updateLayer({
                          [control.key]: clamp(Number(event.target.value), control.min, control.max),
                        })
                      }
                      aria-label={`${label} ${t("boxShadowPage.numberInput")}`}
                      className="w-full rounded-lg border border-border bg-background py-2 pl-2 pr-8 text-right font-mono text-sm outline-none focus:border-emerald-500"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
                      {control.unit}
                    </span>
                  </div>
                </div>
                <input
                  id={`shadow-${control.key}`}
                  type="range"
                  min={control.min}
                  max={control.max}
                  value={selected[control.key]}
                  onChange={(event) => updateLayer({ [control.key]: Number(event.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-3 text-sm font-medium text-foreground/80">
              <input
                type="color"
                value={selected.color}
                onChange={(event) => updateLayer({ color: event.target.value })}
                aria-label={t("boxShadowPage.controls.color")}
                className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
              />
              <span>{t("boxShadowPage.controls.color")}</span>
              <code className="text-xs text-muted">{selected.color}</code>
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <input
                type="checkbox"
                checked={selected.inset}
                onChange={(event) => updateLayer({ inset: event.target.checked })}
                className="h-4 w-4 accent-emerald-500"
              />
              {t("boxShadowPage.controls.inset")}
            </label>
          </div>
        </div>
      </ToolPanel>

      <ToolPanel
        label={t("boxShadowPage.css")}
        action={<CopyButton value={declaration} />}
      >
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
          {declaration}
        </pre>
        <p className="mt-3 text-xs text-muted">
          {t("boxShadowPage.layerCount", { count: layers.length, max: BOX_SHADOW_LIMITS.layers })}
        </p>
      </ToolPanel>
    </ToolLayout>
  );
}
