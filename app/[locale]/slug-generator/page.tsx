"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { generateSlug, type SlugOptions } from "@/lib/slug";

export default function SlugGeneratorPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<SlugOptions["separator"]>("-");
  const [lowercase, setLowercase] = useState(true);
  const [collapseSeparators, setCollapseSeparators] = useState(true);

  const slug = useMemo(
    () => generateSlug(input, { separator, lowercase, collapseSeparators }),
    [input, separator, lowercase, collapseSeparators],
  );
  const encoded = encodeURIComponent(slug);

  return (
    <ToolLayout title={t("tools.slug-generator.name")} description={t("slugGeneratorPage.description")} icon="#">
      <ToolPanel label={t("slugGeneratorPage.inputLabel")} action={<div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={() => setInput("Café & Code: 你好 世界!")} className="text-muted hover:text-foreground">{t("slugGeneratorPage.example")}</button>
        {input && <button type="button" onClick={() => setInput("")} className="text-muted hover:text-foreground">{t("common.clear")}</button>}
      </div>}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} spellCheck={false} aria-label={t("slugGeneratorPage.inputLabel")} placeholder={t("slugGeneratorPage.placeholder")} className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-emerald-500" />
      </ToolPanel>

      <ToolPanel>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-sm">
          <label className="flex items-center gap-2">{t("slugGeneratorPage.separator")}
            <select value={separator} onChange={(event) => setSeparator(event.target.value as SlugOptions["separator"])} className="rounded-lg border border-border bg-background p-2 text-foreground outline-none focus:border-emerald-500">
              <option value="-">-</option>
              <option value="_">_</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={lowercase} onChange={(event) => setLowercase(event.target.checked)} className="h-4 w-4 accent-emerald-500" />{t("slugGeneratorPage.lowercase")}</label>
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={collapseSeparators} onChange={(event) => setCollapseSeparators(event.target.checked)} className="h-4 w-4 accent-emerald-500" />{t("slugGeneratorPage.collapse")}</label>
        </div>
      </ToolPanel>

      <ToolPanel label={t("slugGeneratorPage.slugLabel")} action={<CopyButton value={slug} />}>
        <input type="text" value={slug} readOnly aria-label={t("slugGeneratorPage.slugLabel")} placeholder={t("common.resultPlaceholder")} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none" />
        {input && !slug && <p role="status" className="mt-2 text-sm text-muted">{t("slugGeneratorPage.noSlug")}</p>}
      </ToolPanel>

      <ToolPanel label={t("slugGeneratorPage.encodedLabel")} action={<CopyButton value={encoded} />}>
        <input type="text" value={encoded} readOnly aria-label={t("slugGeneratorPage.encodedLabel")} placeholder={t("common.resultPlaceholder")} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none" />
      </ToolPanel>
      <p className="text-sm text-muted">{t("slugGeneratorPage.rule")}</p>
    </ToolLayout>
  );
}
