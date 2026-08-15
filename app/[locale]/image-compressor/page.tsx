"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type Source = {
  img: HTMLImageElement;
  width: number;
  height: number;
  size: number;
  name: string;
};
type Output = { url: string; size: number; width: number; height: number };

const FORMATS = [
  { mime: "image/jpeg", label: "JPEG" },
  { mime: "image/webp", label: "WebP" },
  { mime: "image/png", label: "PNG" },
];

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorPage() {
  const t = useTranslations();
  const [source, setSource] = useState<Source | null>(null);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [quality, setQuality] = useState(0.8);
  const [mime, setMime] = useState("image/jpeg");
  const [output, setOutput] = useState<Output | null>(null);
  // Track the current object URL so we can revoke it (avoid memory leaks).
  const urlRef = useRef<string | null>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    const tmpUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSource({
        img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        name: file.name.replace(/\.[^.]+$/, ""),
      });
      URL.revokeObjectURL(tmpUrl);
    };
    img.src = tmpUrl;
  }

  // Re-encode whenever the source or options change.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;

    function process(src: Source) {
      const scale = Math.min(1, maxWidth / src.width);
      const w = Math.round(src.width * scale);
      const h = Math.round(src.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(src.img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob || cancelled) return;
          if (urlRef.current) URL.revokeObjectURL(urlRef.current);
          const url = URL.createObjectURL(blob);
          urlRef.current = url;
          setOutput({ url, size: blob.size, width: w, height: h });
        },
        mime,
        mime === "image/png" ? undefined : quality,
      );
    }

    process(source);
    return () => {
      cancelled = true;
    };
  }, [source, maxWidth, quality, mime]);

  // Revoke the last URL on unmount.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const ext = mime.split("/")[1];
  const percentSmaller =
    source && output && output.size < source.size
      ? Math.round((1 - output.size / source.size) * 100)
      : 0;

  return (
    <ToolLayout
      title={t("tools.image-compressor.name")}
      description={t("imageCompressorPage.description")}
      icon="🖼️"
    >
      {/* Upload */}
      <ToolPanel>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-emerald-500/50 hover:bg-foreground/5">
          <span className="text-3xl">🖼️</span>
          <span className="text-sm font-medium text-foreground/80">
            {t("imageCompressorPage.choose")}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="hidden"
          />
        </label>
      </ToolPanel>

      {source && (
        <>
          {/* Options */}
          <ToolPanel>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
                  {t("imageCompressorPage.maxWidth")}: {maxWidth}px
                </label>
                <input
                  type="range"
                  min={100}
                  max={4000}
                  step={20}
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {mime !== "image/png" && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
                    {t("imageCompressorPage.quality")}:{" "}
                    {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              )}

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-foreground/80">
                  {t("imageCompressorPage.format")}
                </span>
                <div className="inline-flex rounded-lg border border-border p-1">
                  {FORMATS.map((f) => (
                    <button
                      key={f.mime}
                      type="button"
                      onClick={() => setMime(f.mime)}
                      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                        mime === f.mime
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-foreground/70 hover:bg-foreground/5"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ToolPanel>

          {/* Result */}
          {output && (
            <ToolPanel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- object URL, client-only */}
                <img
                  src={output.url}
                  alt=""
                  className="max-h-72 w-full rounded-lg border border-border object-contain"
                />
                <div className="flex flex-col justify-center gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">
                      {t("imageCompressorPage.original")}
                    </span>
                    <span className="font-mono">
                      {source.width}×{source.height} · {humanSize(source.size)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">
                      {t("imageCompressorPage.compressed")}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {output.width}×{output.height} · {humanSize(output.size)}
                    </span>
                  </div>
                  {percentSmaller > 0 && (
                    <div className="text-right text-emerald-600 dark:text-emerald-400">
                      {t("imageCompressorPage.smaller", { percent: percentSmaller })}
                    </div>
                  )}
                  <a
                    href={output.url}
                    download={`${source.name}.${ext}`}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    {t("imageCompressorPage.download")}
                  </a>
                </div>
              </div>
            </ToolPanel>
          )}
        </>
      )}
    </ToolLayout>
  );
}
