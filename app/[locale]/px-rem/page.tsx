"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import {
  convertPxRemInput,
  type PxRemDirection,
  PX_REM_LIMITS,
  PxRemError,
} from "@/lib/px-rem";

type InputMode = "single" | "list";

const examples: Record<InputMode, Record<PxRemDirection, string>> = {
  single: { pxToRem: "24", remToPx: "1.5" },
  list: {
    pxToRem: "8\n12\n16\n24\n32\n48",
    remToPx: "0.5\n0.75\n1\n1.5\n2\n3",
  },
};

const fieldClass =
  "w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500";

export default function PxRemPage() {
  const t = useTranslations();
  const [direction, setDirection] = useState<PxRemDirection>("pxToRem");
  const [inputMode, setInputMode] = useState<InputMode>("single");
  const [rootSize, setRootSize] = useState("16");
  const [input, setInput] = useState("");

  const processed = useMemo(() => {
    if (!input.trim()) return { output: "", count: 0, error: null as PxRemError | null };
    try {
      const result = convertPxRemInput(input, direction, rootSize, inputMode === "list");
      return { ...result, error: null as PxRemError | null };
    } catch (error) {
      return {
        output: "",
        count: 0,
        error: error instanceof PxRemError ? error : new PxRemError("value"),
      };
    }
  }, [direction, input, inputMode, rootSize]);

  const fromUnit = direction === "pxToRem" ? "PX" : "REM";
  const toUnit = direction === "pxToRem" ? "REM" : "PX";
  const inputLabel = t(`pxRemPage.input.${inputMode}`, { unit: fromUnit });
  const outputLabel = t(`pxRemPage.output.${inputMode}`, { unit: toUnit });

  function errorMessage(error: PxRemError) {
    if (error.key === "value" && error.line) {
      return t("pxRemPage.errors.lineValue", { line: error.line, value: PX_REM_LIMITS.value });
    }
    return t(`pxRemPage.errors.${error.key}`, PX_REM_LIMITS);
  }

  return (
    <ToolLayout
      title={t("tools.px-rem.name")}
      description={t("pxRemPage.description")}
      icon="px"
    >
      <div className="flex flex-wrap gap-3">
        <div
          className="inline-flex rounded-lg border border-border p-1"
          aria-label={t("pxRemPage.direction")}
        >
          {(["pxToRem", "remToPx"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDirection(value)}
              aria-pressed={direction === value}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                direction === value
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {t(`pxRemPage.directions.${value}`)}
            </button>
          ))}
        </div>

        <div
          className="inline-flex rounded-lg border border-border p-1"
          aria-label={t("pxRemPage.inputMode")}
        >
          {(["single", "list"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInputMode(value)}
              aria-pressed={inputMode === value}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                inputMode === value
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {t(`pxRemPage.modes.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <ToolPanel label={t("pxRemPage.rootSize")}>
        <div className="flex max-w-xs items-center gap-2">
          <input
            value={rootSize}
            onChange={(event) => setRootSize(event.target.value)}
            inputMode="decimal"
            aria-label={t("pxRemPage.rootSize")}
            className={`${fieldClass} ${processed.error?.key === "root" ? "border-red-500" : ""}`}
          />
          <span className="font-mono text-sm text-muted">px</span>
        </div>
        <p className="mt-3 text-xs text-muted">{t("pxRemPage.rootHint", { root: PX_REM_LIMITS.root })}</p>
      </ToolPanel>

      <ToolPanel
        label={inputLabel}
        action={
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setInput(examples[inputMode][direction])}
              className="text-muted transition hover:text-foreground"
            >
              {t("pxRemPage.example")}
            </button>
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-muted transition hover:text-foreground"
              >
                {t("common.clear")}
              </button>
            )}
          </div>
        }
      >
        {inputMode === "single" ? (
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            inputMode="decimal"
            aria-label={inputLabel}
            placeholder={t("pxRemPage.placeholders.single")}
            className={fieldClass}
          />
        ) : (
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={9}
            inputMode="decimal"
            aria-label={inputLabel}
            placeholder={t("pxRemPage.placeholders.list")}
            spellCheck={false}
            className={`${fieldClass} resize-y`}
          />
        )}
        <p className="mt-3 text-xs text-muted">
          {t(`pxRemPage.hints.${inputMode}`, { items: PX_REM_LIMITS.items, value: PX_REM_LIMITS.value })}
        </p>
      </ToolPanel>

      {processed.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
        >
          {errorMessage(processed.error)}
        </p>
      )}

      <ToolPanel label={outputLabel} action={<CopyButton value={processed.output} />}>
        <textarea
          value={processed.output}
          readOnly
          rows={inputMode === "list" ? 9 : 3}
          aria-label={outputLabel}
          placeholder={t("common.resultPlaceholder")}
          className={`${fieldClass} resize-y`}
        />
        <p className="mt-3 text-xs text-muted">
          {inputMode === "list" && processed.count > 0
            ? t("pxRemPage.converted", { count: processed.count })
            : t("pxRemPage.rule")}
        </p>
      </ToolPanel>
    </ToolLayout>
  );
}
