"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type Level = "L" | "M" | "Q" | "H";

const LEVELS: { value: Level; label: string }[] = [
  { value: "L", label: "L · 低 (7%)" },
  { value: "M", label: "M · 中 (15%)" },
  { value: "Q", label: "Q · 较高 (25%)" },
  { value: "H", label: "H · 高 (30%)" },
];

const SIZES = [256, 320, 512] as const;

export default function QrcodePage() {
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
          setError("内容过长,无法生成二维码,请缩短后重试。");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [input, level, size]);

  return (
    <ToolLayout
      title="二维码生成"
      description="把文本或链接生成为二维码,可调容错等级与尺寸并下载为 PNG。所有计算在浏览器本地完成。"
      icon="📱"
    >
      {/* Input */}
      <ToolPanel
        label="文本或链接"
        action={
          input ? (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              清空
            </button>
          ) : null
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="在此输入要生成二维码的文本或网址…"
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Options */}
      <ToolPanel label="选项">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground/70">
              容错等级
            </span>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border p-1">
              {LEVELS.map(({ value, label }) => (
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
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground/70">
              尺寸
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
      <ToolPanel label="二维码">
        {error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        ) : dataUrl ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not a remote asset */}
            <img
              src={dataUrl}
              alt="生成的二维码"
              width={size}
              height={size}
              className="h-auto max-w-full rounded-lg border border-border bg-white p-2"
            />
            <a
              href={dataUrl}
              download="qrcode.png"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
            >
              ⬇️ 下载 PNG
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted">二维码会显示在这里…</p>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
