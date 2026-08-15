"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { CATEGORIES, convert, formatResult, unitSymbols } from "@/lib/units";

export default function UnitConverterPage() {
  const t = useTranslations();
  const [catKey, setCatKey] = useState(CATEGORIES[0].key);
  const cat = CATEGORIES.find((c) => c.key === catKey)!;
  const symbols = unitSymbols(cat);

  const [from, setFrom] = useState(symbols[0]);
  const [to, setTo] = useState(symbols[1]);
  const [value, setValue] = useState("1");

  function selectCategory(key: string) {
    const next = CATEGORIES.find((c) => c.key === key)!;
    const syms = unitSymbols(next);
    setCatKey(key);
    setFrom(syms[0]);
    setTo(syms[1]);
  }

  const num = Number(value);
  const result =
    value.trim() !== "" && Number.isFinite(num)
      ? formatResult(convert(cat, num, from, to))
      : "";

  const unitSelect = (
    val: string,
    onChange: (v: string) => void,
  ) => (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
    >
      {symbols.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );

  return (
    <ToolLayout
      title={t("tools.unit-converter.name")}
      description={t("unitConverterPage.description")}
      icon="📏"
    >
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => selectCategory(c.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              c.key === catKey
                ? "bg-emerald-500 text-white shadow-sm"
                : "border border-border text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {t(`unitConverterPage.categories.${c.key}`)}
          </button>
        ))}
      </div>

      <ToolPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* From */}
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              {t("unitConverterPage.from")}
            </label>
            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputMode="decimal"
                spellCheck={false}
                className="w-full min-w-0 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
              />
              {unitSelect(from, setFrom)}
            </div>
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            aria-label={t("unitConverterPage.swap")}
            className="mb-0.5 shrink-0 self-center rounded-lg border border-border px-3 py-3 text-sm transition hover:bg-foreground/5 sm:self-end"
          >
            ⇄
          </button>

          {/* To */}
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              {t("unitConverterPage.to")}
            </label>
            <div className="flex gap-2">
              <div className="flex w-full min-w-0 items-center rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
                {result || "—"}
              </div>
              {unitSelect(to, setTo)}
            </div>
          </div>

          <CopyButton value={result} className="mb-0.5 shrink-0 self-end" />
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
