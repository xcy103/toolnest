"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { compressedFilename, encodeImage, fitWithinWidth, IMAGE_FORMATS, validDimensions, type ImageFormat } from "@/lib/image-tools";

type Source = { image: HTMLImageElement; width: number; height: number; size: number; name: string };
type Output = { url: string; size: number; width: number; height: number; name: string };
const FORMATS: { mime: ImageFormat; label: string }[] = [
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
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<ImageFormat>("image/jpeg");
  const [background, setBackground] = useState("#ffffff");
  const [output, setOutput] = useState<Output | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const outputUrl = useRef<string | null>(null);
  const generation = useRef(0);

  function releaseOutput() {
    if (outputUrl.current) URL.revokeObjectURL(outputUrl.current);
    outputUrl.current = null;
    setOutput(null);
  }

  function prepareCompression() {
    generation.current++;
    releaseOutput();
    setBusy(true);
    setError("");
  }

  async function load(file: File | undefined) {
    if (!file) return;
    generation.current++;
    const token = generation.current;
    releaseOutput();
    setSource(null);
    setBusy(false);
    setError("");
    if (!(IMAGE_FORMATS as readonly string[]).includes(file.type)) { setError("type"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("size"); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (token !== generation.current) return;
      if (!validDimensions(image.naturalWidth, image.naturalHeight)) throw new Error("dimensions");
      setBusy(true);
      setSource({ image, width: image.naturalWidth, height: image.naturalHeight, size: file.size, name: file.name });
    } catch (cause) {
      if (token === generation.current) setError(cause instanceof Error && cause.message === "dimensions" ? "dimensions" : "decode");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  useEffect(() => {
    if (!source) return;
    generation.current++;
    const token = generation.current;
    const requestRef = generation;
    const dimensions = fitWithinWidth(source.width, source.height, maxWidth);
    void encodeImage(source.image, dimensions.width, dimensions.height, format, quality / 100, background)
      .then((blob) => {
        if (token !== generation.current) return;
        const url = URL.createObjectURL(blob);
        outputUrl.current = url;
        setOutput({ url, size: blob.size, ...dimensions, name: compressedFilename(source.name, format) });
      })
      .catch(() => { if (token === generation.current) setError("export"); })
      .finally(() => { if (token === generation.current) setBusy(false); });
    return () => { if (requestRef.current === token) requestRef.current++; };
  }, [source, maxWidth, quality, format, background]);

  useEffect(() => {
    const urlRef = outputUrl;
    const requestRef = generation;
    return () => {
      requestRef.current++;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const percentSmaller = source && output && output.size < source.size ? Math.round((1 - output.size / source.size) * 100) : 0;

  return <ToolLayout title={t("tools.image-compressor.name")} description={t("imageCompressorPage.description")} icon="🖼️">
    <ToolPanel>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition hover:border-emerald-500/50 hover:bg-foreground/5">
        <span aria-hidden className="text-3xl">🖼️</span>
        <span className="text-sm font-medium text-foreground/80">{t("imageCompressorPage.choose")}</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} className="hidden" />
      </label>
      <p className="mt-3 text-center text-sm text-muted">{t("imageTool.scope")}</p>
    </ToolPanel>

    {source && <ToolPanel>
      <div className="space-y-5">
        <label className="block text-sm font-semibold text-foreground/80">{t("imageCompressorPage.maxWidth")}: {maxWidth}px
          <input type="range" min="100" max="4000" step="20" value={maxWidth} onChange={(e) => { const value = Number(e.target.value); if (value !== maxWidth) { prepareCompression(); setMaxWidth(value); } }} className="mt-2 block w-full accent-emerald-500" />
        </label>
        {format !== "image/png" && <label className="block text-sm font-semibold text-foreground/80">{t("imageCompressorPage.quality")}: {quality}%
          <input type="range" min="10" max="100" step="5" value={quality} onChange={(e) => { const value = Number(e.target.value); if (value !== quality) { prepareCompression(); setQuality(value); } }} className="mt-2 block w-full accent-emerald-500" />
        </label>}
        <div><span className="mb-2 block text-sm font-semibold text-foreground/80">{t("imageCompressorPage.format")}</span>
          <div className="inline-flex max-w-full rounded-lg border border-border p-1" role="group" aria-label={t("imageCompressorPage.format")}>{FORMATS.map((item) => <button key={item.mime} type="button" aria-pressed={format === item.mime} onClick={() => { if (item.mime !== format) { prepareCompression(); setFormat(item.mime); } }} className="rounded-md px-4 py-1.5 text-sm font-medium transition aria-pressed:bg-emerald-500 aria-pressed:text-white">{item.label}</button>)}</div>
        </div>
        {format === "image/jpeg" && <label className="flex items-center gap-3 text-sm font-semibold text-foreground/80">{t("imageTool.background")}<input type="color" value={background} onChange={(e) => { prepareCompression(); setBackground(e.target.value); }} /></label>}
      </div>
    </ToolPanel>}

    {busy && <p role="status" className="text-sm text-muted">{t("imageTool.processing")}</p>}
    {output && source && <ToolPanel>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
        <img src={output.url} alt={t("imageCompressorPage.compressed")} className="max-h-72 w-full rounded-lg border border-border object-contain" />
        <div className="flex min-w-0 flex-col justify-center gap-3 text-sm">
          <div className="flex items-start justify-between gap-3"><span className="text-muted">{t("imageCompressorPage.original")}</span><span className="break-all text-right font-mono">{source.width}×{source.height} · {humanSize(source.size)}</span></div>
          <div className="flex items-start justify-between gap-3"><span className="text-muted">{t("imageCompressorPage.compressed")}</span><span className="break-all text-right font-mono text-emerald-600 dark:text-emerald-400">{output.width}×{output.height} · {humanSize(output.size)}</span></div>
          {percentSmaller > 0 && <p className="text-right text-emerald-600 dark:text-emerald-400">{t("imageCompressorPage.smaller", { percent: percentSmaller })}</p>}
          <a href={output.url} download={output.name} className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">{t("imageCompressorPage.download")}</a>
        </div>
      </div>
    </ToolPanel>}
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t(`imageTool.errors.${error}`)}</p>}
  </ToolLayout>;
}
