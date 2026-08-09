"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { contrastRatio, parseHex, rgbToHex } from "@/lib/color";

/** WCAG thresholds by conformance level and text size. */
const CHECKS = [
  { key: "aaLarge", min: 3 },
  { key: "aaNormal", min: 4.5 },
  { key: "aaaLarge", min: 4.5 },
  { key: "aaaNormal", min: 7 },
] as const;

function ColorField({
  label,
  value,
  valid,
  onChange,
}: {
  label: string;
  value: string;
  valid: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <ToolPanel label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={`w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500 ${
            valid ? "border-border" : "border-red-500"
          }`}
        />
      </div>
    </ToolPanel>
  );
}

export default function ContrastPage() {
  const t = useTranslations();
  const [textHex, setTextHex] = useState("#111827");
  const [bgHex, setBgHex] = useState("#ffffff");

  const fg = parseHex(textHex);
  const bg = parseHex(bgHex);
  const ratio = fg && bg ? contrastRatio(fg, bg) : null;

  return (
    <ToolLayout
      title={t("tools.contrast.name")}
      description={t("contrastPage.description")}
      icon="👁️"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ColorField
          label={t("contrastPage.textColor")}
          value={textHex}
          valid={fg !== null}
          onChange={setTextHex}
        />
        <ColorField
          label={t("contrastPage.bgColor")}
          value={bgHex}
          valid={bg !== null}
          onChange={setBgHex}
        />
      </div>

      {ratio !== null && fg && bg && (
        <>
          {/* Ratio + preview */}
          <ToolPanel>
            <div
              className="rounded-xl border border-border p-6"
              style={{ backgroundColor: rgbToHex(bg), color: rgbToHex(fg) }}
            >
              <p className="text-base">
                {t("contrastPage.previewNormal")}: {t("contrastPage.previewText")}
              </p>
              <p className="mt-2 text-2xl font-bold">
                {t("contrastPage.previewLarge")}: {t("contrastPage.previewText")}
              </p>
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-muted">
                {t("contrastPage.ratio")}
              </span>
              <div className="font-mono text-4xl font-bold text-foreground">
                {ratio.toFixed(2)} : 1
              </div>
            </div>
          </ToolPanel>

          {/* Pass/fail grid */}
          <div className="grid grid-cols-2 gap-3">
            {CHECKS.map((c) => {
              const pass = ratio >= c.min;
              return (
                <div
                  key={c.key}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    pass
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-red-500/40 bg-red-500/10"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground/80">
                    {t(`contrastPage.${c.key}`)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      pass
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {pass ? `✓ ${t("contrastPage.pass")}` : `✗ ${t("contrastPage.fail")}`}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
