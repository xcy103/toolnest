"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { buildIco, encodeSquare, IMAGE_FORMATS, validDimensions } from "@/lib/image-tools";

type Source = { image: HTMLImageElement; url: string; name: string; width: number; height: number };
type Asset = { name: string; purpose: "ico" | "browser" | "apple" | "pwaSmall" | "pwaLarge"; url: string; size: number };
const FIELD = "w-full min-w-0 rounded-lg border border-border bg-background p-2.5 text-base outline-none focus:border-emerald-500";
const PNG_SIZES = [16, 32, 48, 180, 192, 512] as const;

export default function FaviconGeneratorPage() {
  const t = useTranslations();
  const [source, setSource] = useState<Source | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sourceUrl = useRef<string | null>(null);
  const assetUrls = useRef<string[]>([]);
  const generation = useRef(0);

  function clearAssets() {
    assetUrls.current.forEach((url) => URL.revokeObjectURL(url));
    assetUrls.current = [];
    setAssets([]);
  }
  function invalidate() {
    generation.current++;
    setBusy(false);
    setError("");
    clearAssets();
  }
  useEffect(() => {
    const sourceRef = sourceUrl;
    const assetsRef = assetUrls;
    const requestRef = generation;
    return () => {
      requestRef.current++;
      if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
      assetsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function load(file: File | undefined) {
    if (!file) return;
    invalidate();
    const token = generation.current;
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    sourceUrl.current = null;
    setSource(null);
    if (!(IMAGE_FORMATS as readonly string[]).includes(file.type)) { setError("type"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("size"); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (token !== generation.current) { URL.revokeObjectURL(url); return; }
      if (!validDimensions(image.naturalWidth, image.naturalHeight)) throw new Error("dimensions");
      sourceUrl.current = url;
      setSource({ image, url, name: file.name, width: image.naturalWidth, height: image.naturalHeight });
    } catch (cause) {
      URL.revokeObjectURL(url);
      if (token === generation.current) setError(cause instanceof Error && cause.message === "dimensions" ? "dimensions" : "decode");
    }
  }

  async function generate() {
    if (!source) return;
    invalidate();
    const token = generation.current;
    setBusy(true);
    try {
      const entries = await Promise.all(PNG_SIZES.map(async (size) => [size, await encodeSquare(source.image, source.width, source.height, size)] as const));
      if (token !== generation.current) return;
      const blobs = new Map<number, Blob>(entries);
      const icoEntries = await Promise.all(([16, 32, 48] as const).map(async (size) => ({ size, bytes: new Uint8Array(await blobs.get(size)!.arrayBuffer()) })));
      if (token !== generation.current) return;
      const icoBytes = buildIco(icoEntries);
      const icoBlob = new Blob([icoBytes.buffer as ArrayBuffer], { type: "image/x-icon" });
      const definitions = [
        { name: "favicon.ico", purpose: "ico" as const, blob: icoBlob },
        { name: "favicon-32x32.png", purpose: "browser" as const, blob: blobs.get(32)! },
        { name: "apple-touch-icon.png", purpose: "apple" as const, blob: blobs.get(180)! },
        { name: "icon-192.png", purpose: "pwaSmall" as const, blob: blobs.get(192)! },
        { name: "icon-512.png", purpose: "pwaLarge" as const, blob: blobs.get(512)! },
      ];
      const next = definitions.map(({ name, purpose, blob }) => ({ name, purpose, url: URL.createObjectURL(blob), size: blob.size }));
      assetUrls.current = next.map((asset) => asset.url);
      setAssets(next);
    } catch {
      if (token === generation.current) setError("export");
    } finally {
      if (token === generation.current) setBusy(false);
    }
  }

  return <ToolLayout title={t("tools.favicon-generator.name")} description={t("faviconGeneratorPage.description")} icon="★">
    <div className="space-y-2">
      <label htmlFor="favicon-file" className="block text-sm font-medium">{t("imageTool.choose")}</label>
      <input id="favicon-file" type="file" accept="image/png,image/jpeg,image/webp" className={FIELD} onChange={(e) => { void load(e.target.files?.[0]); e.target.value = ""; }} />
      <p className="text-sm text-muted">{t("faviconGeneratorPage.scope")}</p>
    </div>
    {source && <>
      <ToolPanel label={t("faviconGeneratorPage.preview")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
        <img src={source.url} alt={source.name} className="mx-auto max-h-80 max-w-full object-contain" />
        <p className="mt-3 text-center text-sm tabular-nums text-muted">{source.width} × {source.height}</p>
      </ToolPanel>
      <button type="button" disabled={busy} onClick={() => void generate()} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{t(busy ? "imageTool.processing" : "faviconGeneratorPage.generate")}</button>
    </>}
    {assets.length > 0 && <ToolPanel label={t("faviconGeneratorPage.result")}>
      <div className="divide-y divide-border">{assets.map((asset) => <div key={asset.name} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
        <div><p className="font-mono text-sm font-medium">{asset.name}</p><p className="text-sm text-muted">{t(`faviconGeneratorPage.purposes.${asset.purpose}`)} · {(asset.size / 1024).toFixed(1)} KB</p></div>
        <a href={asset.url} download={asset.name} className="rounded-lg border border-border px-3 py-2 text-sm font-medium">{t("faviconGeneratorPage.download", { name: asset.name })}</a>
      </div>)}</div>
    </ToolPanel>}
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t(`imageTool.errors.${error}`)}</p>}
  </ToolLayout>;
}
