"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type Level = "L" | "M" | "Q" | "H";

const LEVELS: Level[] = ["L", "M", "Q", "H"];

const SIZES = [256, 320, 512] as const;

export default function QrcodePage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<Level>("M");
  const [size, setSize] = useState<(typeof SIZES)[number]>(320);
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!input.trim()) {
        if (!cancelled) {
          setDataUrl("");
          setError("");
        }
        return;
      }
      try {
        const url = await QRCode.toDataURL(input, {
          errorCorrectionLevel: level,
          width: size,
          margin: 2,
        });
        if (!cancelled) {
          setDataUrl(url);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setDataUrl("");
          setError(t("qrcodePage.error"));
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [input, level, size, t]);

  return (
    <ToolLayout
      title={t("tools.qrcode.name")}
      description={t("qrcodePage.description")}
      icon="📱"
    >
      {/* Input */}
      <ToolPanel
        label={t("qrcodePage.inputLabel")}
        action={
          input ? (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("common.clear")}
            </button>
          ) : null
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={t("qrcodePage.placeholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Options */}
      <ToolPanel label={t("qrcodePage.optionsLabel")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground/70">
              {t("qrcodePage.levelLabel")}
            </span>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border p-1">
              {LEVELS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLevel(value)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    level === value
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/60 hover:bg-foreground/5"
                  }`}
                >
                  {t(`qrcodePage.level${value}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground/70">
              {t("qrcodePage.sizeLabel")}
            </span>
            <div className="inline-flex gap-1 rounded-lg border border-border p-1">
              {SIZES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSize(value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    size === value
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/60 hover:bg-foreground/5"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ToolPanel>

      {/* Output */}
      <ToolPanel label={t("qrcodePage.outputLabel")}>
        {error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        ) : dataUrl ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not a remote asset */}
            <img
              src={dataUrl}
              alt={t("qrcodePage.alt")}
              width={size}
              height={size}
              className="h-auto max-w-full rounded-lg border border-border bg-white p-2"
            />
            <a
              href={dataUrl}
              download="qrcode.png"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
            >
              {t("qrcodePage.download")}
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("qrcodePage.outputPlaceholder")}</p>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
