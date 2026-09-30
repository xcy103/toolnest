"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { buildUtmUrl, UTM_LIMITS, UtmError, type UtmFields } from "@/lib/utm-builder";

const emptyFields: UtmFields = { source: "", medium: "", campaign: "", term: "", content: "" };
const fieldNames = ["source", "medium", "campaign", "term", "content"] as const;
const inputClass = "w-full min-w-0 rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-emerald-500";

export default function UtmBuilderPage() {
  const t = useTranslations();
  const [destination, setDestination] = useState("");
  const [fields, setFields] = useState<UtmFields>(emptyFields);
  const active = Boolean(destination || Object.values(fields).some(Boolean));
  const generated = useMemo(() => {
    if (!active) return { url: "", error: null };
    try {
      return { url: buildUtmUrl(destination, fields), error: null };
    } catch (error) {
      return { url: "", error: error instanceof UtmError ? error.key : "invalidUrl" };
    }
  }, [active, destination, fields]);

  function updateField(name: keyof UtmFields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  return (
    <ToolLayout title={t("tools.utm-builder.name")} description={t("utmBuilderPage.description")} icon="↗">
      <ToolPanel label={t("utmBuilderPage.destination")} action={<div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={() => { setDestination("https://example.com/launch?ref=homepage#pricing"); setFields({ source: "newsletter", medium: "email", campaign: "fall launch", term: "", content: "hero button" }); }} className="text-muted hover:text-foreground">{t("utmBuilderPage.example")}</button>
        {active && <button type="button" onClick={() => { setDestination(""); setFields(emptyFields); }} className="text-muted hover:text-foreground">{t("common.clear")}</button>}
      </div>}>
        <input type="url" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="https://example.com/landing" aria-label={t("utmBuilderPage.destination")} spellCheck={false} autoComplete="url" className={`${inputClass} font-mono`} />
      </ToolPanel>

      <ToolPanel label={t("utmBuilderPage.campaignDetails")}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fieldNames.map((name) => <label key={name} className={`space-y-2 text-sm ${name === "campaign" ? "sm:col-span-2" : ""}`}>
            <span className="text-muted">{t(`utmBuilderPage.fields.${name}`)}{["source", "medium", "campaign"].includes(name) && <span aria-hidden className="ml-1 text-red-500">*</span>}</span>
            <input type="text" value={fields[name]} onChange={(event) => updateField(name, event.target.value)} maxLength={UTM_LIMITS.fieldCharacters + 1} aria-required={["source", "medium", "campaign"].includes(name)} placeholder={t(`utmBuilderPage.placeholders.${name}`)} autoComplete="off" className={inputClass} />
          </label>)}
        </div>
        <p className="mt-4 text-xs text-muted">{t("utmBuilderPage.requiredHint")}</p>
      </ToolPanel>

      {generated.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{t(`utmBuilderPage.errors.${generated.error}`, { urlCharacters: UTM_LIMITS.urlCharacters, fieldCharacters: UTM_LIMITS.fieldCharacters, parameters: UTM_LIMITS.parameters })}</p>}

      <ToolPanel label={t("utmBuilderPage.generated")} action={<CopyButton value={generated.url} />}>
        <textarea readOnly rows={5} value={generated.url} aria-label={t("utmBuilderPage.generated")} placeholder={t("common.resultPlaceholder")} className={`${inputClass} resize-y font-mono`} />
        <p className="mt-3 text-xs text-muted">{t("utmBuilderPage.privacy")}</p>
      </ToolPanel>
    </ToolLayout>
  );
}
