"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { encodeImage, IMAGE_FORMATS, linkedSize, outputFilename, validDimensions, type ImageFormat } from "@/lib/image-tools";

type Source = { image: HTMLImageElement; url: string; name: string; size: number };
type Output = { url: string; size: number; width: number; height: number; name: string };
const field = "w-full min-w-0 rounded-lg border border-border bg-background p-2.5 text-base outline-none focus:border-emerald-500";

export default function ImageTool({ mode }: { mode: "resize" | "convert" }) {
  const t = useTranslations();
  const slug = mode === "resize" ? "image-resizer" : "image-converter";
  const namespace = mode === "resize" ? "imageResizerPage" : "imageConverterPage";
  const [source, setSource] = useState<Source | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const urls = useRef(new Set<string>());
  const outputUrl = useRef<string | null>(null);
  const sourceUrl = useRef<string | null>(null);

  function release(url: string | null) {
    if (url) { URL.revokeObjectURL(url); urls.current.delete(url); }
  }
  function retain(blob: Blob) {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }
  function invalidate() {
    generation.current++;
    setBusy(false);
    setError("");
    release(outputUrl.current);
    outputUrl.current = null;
    setOutput(null);
  }
  useEffect(() => {
    const activeUrls = urls.current;
    const requestGeneration = generation;
    return () => {
      requestGeneration.current++;
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      activeUrls.clear();
    };
  }, []);

  async function load(file: File | undefined) {
    if (!file) return;
    invalidate();
    const token = generation.current;
    release(sourceUrl.current);
    sourceUrl.current = null;
    setSource(null);
    setLoading(false);
    if (!(IMAGE_FORMATS as readonly string[]).includes(file.type)) { setError("type"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("size"); return; }
    setLoading(true);
    const url = retain(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (token !== generation.current) { release(url); return; }
      if (!validDimensions(image.naturalWidth, image.naturalHeight)) throw new Error("dimensions");
      sourceUrl.current = url;
      setSource({ image, url, name: file.name, size: file.size });
      setWidth(String(image.naturalWidth));
      setHeight(String(image.naturalHeight));
    } catch (cause) {
      release(url);
      if (token === generation.current) setError(cause instanceof Error && cause.message === "dimensions" ? "dimensions" : "decode");
    } finally {
      if (token === generation.current) setLoading(false);
    }
  }

  function dimensions(axis: "width" | "height", value: string) {
    invalidate();
    if (axis === "width") {
      setWidth(value);
      if (locked && source) setHeight(linkedSize(value, source.image.naturalWidth, source.image.naturalHeight));
    } else {
      setHeight(value);
      if (locked && source) setWidth(linkedSize(value, source.image.naturalHeight, source.image.naturalWidth));
    }
  }
  const w = Number(width);
  const h = Number(height);
  const valid = /^\d+$/.test(width) && /^\d+$/.test(height) && validDimensions(w, h);

  async function process() {
    if (!source || !valid) return;
    invalidate();
    const token = generation.current;
    setBusy(true);
    try {
      const blob = await encodeImage(source.image, w, h, format, quality / 100, background);
      if (token !== generation.current) return;
      const url = retain(blob);
      outputUrl.current = url;
      setOutput({ url, width: w, height: h, size: blob.size, name: outputFilename(source.name, format, mode === "resize") });
    } catch {
      if (token === generation.current) setError("export");
    } finally {
      if (token === generation.current) setBusy(false);
    }
  }

  return (
    <ToolLayout title={t(`tools.${slug}.name`)} description={t(`${namespace}.description`)}>
      <div className="space-y-2">
        <label htmlFor="image-file" className="block text-sm font-medium">{t("imageTool.choose")}</label>
        <input id="image-file" type="file" accept="image/png,image/jpeg,image/webp" className={`${field} file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2`}
          onChange={(event) => { void load(event.target.files?.[0]); event.target.value = ""; }} />
        <p className="text-sm text-muted">{t("imageTool.scope")}</p>
      </div>
      {loading && <p role="status">{t("imageTool.loading")}</p>}
      {source && (
        <>
          <ToolPanel>
            <div className="grid gap-4 sm:grid-cols-2">
              {mode === "resize" && <>
                <label className="space-y-1 text-sm">{t("imageTool.width")}<input aria-label={t("imageTool.width")} type="number" min="1" max="8192" step="1" value={width} className={field} onChange={(e) => dimensions("width", e.target.value)} /></label>
                <label className="space-y-1 text-sm">{t("imageTool.height")}<input aria-label={t("imageTool.height")} type="number" min="1" max="8192" step="1" value={height} className={field} onChange={(e) => dimensions("height", e.target.value)} /></label>
                <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={locked} onChange={(e) => { invalidate(); setLocked(e.target.checked); if (e.target.checked) setHeight(linkedSize(width, source.image.naturalWidth, source.image.naturalHeight)); }} />{t("imageTool.lock")}</label>
              </>}
              <label className="space-y-1 text-sm">{t("imageTool.format")}<select aria-label={t("imageTool.format")} value={format} className={field} onChange={(e) => { invalidate(); setFormat(e.target.value as ImageFormat); }}>
                {IMAGE_FORMATS.map((mime) => <option key={mime} value={mime}>{mime.split("/")[1].toUpperCase()}</option>)}
              </select></label>
              {format !== "image/png" && <label className="space-y-2 text-sm">{t("imageTool.quality")} {quality}%<input aria-label={t("imageTool.quality")} type="range" min="10" max="100" value={quality} className="block w-full accent-emerald-500" onChange={(e) => { invalidate(); setQuality(Number(e.target.value)); }} /></label>}
              {format === "image/jpeg" && <label className="flex items-center gap-3 text-sm">{t("imageTool.background")}<input aria-label={t("imageTool.background")} type="color" value={background} onChange={(e) => { invalidate(); setBackground(e.target.value); }} /></label>}
            </div>
          </ToolPanel>
          {!valid && <p role="alert" className="text-sm text-red-600">{t("imageTool.errors.dimensions")}</p>}
          <button type="button" disabled={!valid || busy} onClick={() => void process()} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{t(busy ? "imageTool.processing" : mode === "resize" ? "imageTool.resize" : "imageTool.convert")}</button>
          <div className="grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
            <figure className="min-w-0 space-y-2">
              <figcaption className="text-sm font-medium">{t("imageTool.original")}</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={source.url} alt={t("imageTool.original")} className="aspect-square w-full border border-border object-contain" />
              <p className="break-all text-sm text-muted">{source.name}</p>
              <p className="text-sm tabular-nums">{source.image.naturalWidth} × {source.image.naturalHeight} · {(source.size / 1024).toFixed(1)} KB</p>
            </figure>
            <figure className="min-w-0 space-y-2" aria-live="polite">
              <figcaption className="text-sm font-medium">{t("imageTool.output")}</figcaption>
              {output ? <>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                <img src={output.url} alt={t("imageTool.output")} className="aspect-square w-full border border-border object-contain" />
                <p className="text-sm tabular-nums">{output.width} × {output.height} · {(output.size / 1024).toFixed(1)} KB</p>
                <a href={output.url} download={output.name} className="inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium">{t("imageTool.download")}</a>
              </> : <div className="flex aspect-square items-center justify-center border border-border text-sm text-muted">{t("imageTool.noOutput")}</div>}
            </figure>
          </div>
        </>
      )}
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t(`imageTool.errors.${error}`)}</p>}
    </ToolLayout>
  );
}
