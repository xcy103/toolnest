"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { cropFilename, encodeCrop, IMAGE_FORMATS, validCrop, validDimensions, type CropRect, type ImageFormat } from "@/lib/image-tools";

type Source = { image: HTMLImageElement; url: string; name: string; width: number; height: number };
type Result = { url: string; name: string; width: number; height: number; size: number };
const FIELD = "w-full min-w-0 rounded-lg border border-border bg-background p-2.5 text-base outline-none focus:border-emerald-500";
const RATIOS = [{ key: "free", value: 0 }, { key: "square", value: 1 }, { key: "fourThree", value: 4 / 3 }, { key: "sixteenNine", value: 16 / 9 }];

export default function ImageCropPage() {
  const t = useTranslations();
  const [source, setSource] = useState<Source | null>(null);
  const [rect, setRect] = useState<Record<keyof CropRect, string>>({ x: "0", y: "0", width: "", height: "" });
  const [ratio, setRatio] = useState("free");
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const preview = useRef<HTMLCanvasElement>(null);
  const sourceUrl = useRef<string | null>(null);
  const resultUrl = useRef<string | null>(null);
  const generation = useRef(0);

  const parsed: CropRect = { x: Number(rect.x), y: Number(rect.y), width: Number(rect.width), height: Number(rect.height) };
  const integerStrings = Object.values(rect).every((value) => /^\d+$/.test(value));
  const valid = !!source && integerStrings && validCrop(parsed, source.width, source.height);

  function release(ref: React.RefObject<string | null>) {
    if (ref.current) URL.revokeObjectURL(ref.current);
    ref.current = null;
  }
  function invalidate() {
    generation.current++;
    setBusy(false);
    setError("");
    release(resultUrl);
    setResult(null);
  }
  useEffect(() => () => {
    generation.current++;
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
  }, []);

  useEffect(() => {
    if (!source || !preview.current) return;
    const canvas = preview.current;
    const scale = Math.min(1, 1000 / Math.max(source.width, source.height));
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(source.image, 0, 0, canvas.width, canvas.height);
    if (!valid) return;
    ctx.fillStyle = "rgba(15, 23, 42, 0.58)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source.image, parsed.x, parsed.y, parsed.width, parsed.height,
      parsed.x * scale, parsed.y * scale, parsed.width * scale, parsed.height * scale);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.strokeRect(parsed.x * scale, parsed.y * scale, parsed.width * scale, parsed.height * scale);
  }, [source, parsed.x, parsed.y, parsed.width, parsed.height, valid]);

  async function load(file: File | undefined) {
    if (!file) return;
    invalidate();
    const token = generation.current;
    release(sourceUrl);
    setSource(null);
    if (!(IMAGE_FORMATS as readonly string[]).includes(file.type)) { setError("type"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("size"); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (token !== generation.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (!validDimensions(image.naturalWidth, image.naturalHeight)) throw new Error("dimensions");
      sourceUrl.current = url;
      setSource({ image, url, name: file.name, width: image.naturalWidth, height: image.naturalHeight });
      setRect({ x: "0", y: "0", width: String(image.naturalWidth), height: String(image.naturalHeight) });
      setRatio("free");
    } catch (cause) {
      URL.revokeObjectURL(url);
      if (token === generation.current) setError(cause instanceof Error && cause.message === "dimensions" ? "dimensions" : "decode");
    }
  }

  function setField(key: keyof CropRect, value: string) {
    invalidate();
    setRect((current) => {
      const next = { ...current, [key]: value };
      const selected = RATIOS.find((item) => item.key === ratio)?.value ?? 0;
      if (selected && /^\d+$/.test(value)) {
        if (key === "width") next.height = String(Math.max(1, Math.round(Number(value) / selected)));
        if (key === "height") next.width = String(Math.max(1, Math.round(Number(value) * selected)));
      }
      return next;
    });
  }

  function chooseRatio(key: string, value: number) {
    invalidate();
    setRatio(key);
    if (!source || value === 0) return;
    const width = Math.min(source.width, Math.floor(source.height * value));
    const height = Math.min(source.height, Math.floor(source.width / value));
    setRect({ x: String(Math.floor((source.width - width) / 2)), y: String(Math.floor((source.height - height) / 2)), width: String(width), height: String(height) });
  }

  async function crop() {
    if (!source || !valid) return;
    invalidate();
    const token = generation.current;
    setBusy(true);
    try {
      const blob = await encodeCrop(source.image, source.width, source.height, parsed, format, quality / 100, background);
      if (token !== generation.current) return;
      const url = URL.createObjectURL(blob);
      resultUrl.current = url;
      setResult({ url, name: cropFilename(source.name, format), width: parsed.width, height: parsed.height, size: blob.size });
    } catch {
      if (token === generation.current) setError("export");
    } finally {
      if (token === generation.current) setBusy(false);
    }
  }

  return <ToolLayout title={t("tools.image-crop.name")} description={t("imageCropPage.description")} icon="✂">
    <div className="space-y-2">
      <label htmlFor="crop-file" className="block text-sm font-medium">{t("imageTool.choose")}</label>
      <input id="crop-file" type="file" accept="image/png,image/jpeg,image/webp" className={FIELD} onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} />
      <p className="text-sm text-muted">{t("imageTool.scope")}</p>
    </div>
    {source && <>
      <canvas ref={preview} aria-label={t("imageCropPage.preview")} className="max-h-[32rem] w-full border border-border bg-[repeating-conic-gradient(#e2e8f0_0_25%,#fff_0_50%)_0_0/16px_16px] object-contain dark:bg-none dark:bg-slate-800" />
      <ToolPanel>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t("imageCropPage.ratio")}>{RATIOS.map((item) => <button type="button" key={item.key} aria-pressed={ratio === item.key} onClick={() => chooseRatio(item.key, item.value)} className="rounded-md border border-border px-2 py-2 text-sm aria-pressed:border-emerald-500 aria-pressed:bg-emerald-500/10">{t(`imageCropPage.ratios.${item.key}`)}</button>)}</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{(["x", "y", "width", "height"] as const).map((key) => <label key={key} className="space-y-1 text-sm">{t(`imageCropPage.${key}`)}<input type="number" min={key === "x" || key === "y" ? 0 : 1} step="1" value={rect[key]} onChange={(e) => setField(key, e.target.value)} className={FIELD} /></label>)}</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm">{t("imageTool.format")}<select value={format} onChange={(e) => { invalidate(); setFormat(e.target.value as ImageFormat); }} className={FIELD}>{IMAGE_FORMATS.map((mime) => <option key={mime} value={mime}>{mime.split("/")[1].toUpperCase()}</option>)}</select></label>
          {format !== "image/png" && <label className="space-y-2 text-sm">{t("imageTool.quality")} {quality}%<input type="range" min="10" max="100" value={quality} onChange={(e) => { invalidate(); setQuality(Number(e.target.value)); }} className="block w-full accent-emerald-500" /></label>}
          {format === "image/jpeg" && <label className="flex items-center gap-3 text-sm">{t("imageTool.background")}<input type="color" value={background} onChange={(e) => { invalidate(); setBackground(e.target.value); }} /></label>}
        </div>
      </ToolPanel>
      {!valid && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t("imageCropPage.invalid")}</p>}
      <button type="button" disabled={!valid || busy} onClick={() => void crop()} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{t(busy ? "imageTool.processing" : "imageCropPage.crop")}</button>
      {result && <ToolPanel label={t("imageTool.output")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
        <img src={result.url} alt={t("imageTool.output")} className="max-h-[32rem] w-full border border-border object-contain" />
        <p className="mt-3 text-sm tabular-nums">{result.width} × {result.height} · {(result.size / 1024).toFixed(1)} KB</p>
        <a href={result.url} download={result.name} className="mt-3 inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium">{t("imageTool.download")}</a>
      </ToolPanel>}
    </>}
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t(`imageTool.errors.${error}`)}</p>}
  </ToolLayout>;
}
