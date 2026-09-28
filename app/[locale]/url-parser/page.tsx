"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { parseUrl, UrlParserError, URL_PARSER_LIMITS } from "@/lib/url-parser";

const fields = ["protocol", "origin", "hostname", "port", "pathname", "search", "hash", "username", "password"] as const;
const inputClass = "w-full min-w-0 rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500";

export default function UrlParserPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [base, setBase] = useState("");
  const parsed = useMemo(() => {
    if (!input.trim()) return { result: null, error: null };
    try {
      return { result: parseUrl(input, base), error: null };
    } catch (error) {
      return { result: null, error: error instanceof UrlParserError ? error.key : "invalid" };
    }
  }, [input, base]);
  const { result, error } = parsed;

  return (
    <ToolLayout title={t("tools.url-parser.name")} description={t("urlParserPage.description")} icon="↗">
      <ToolPanel label={t("urlParserPage.input")} action={<div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" onClick={() => { setInput("https://example.com:8443/docs?q=hello+world&tag=web&tag=tools&empty=#intro"); setBase(""); }} className="text-muted hover:text-foreground">{t("urlParserPage.example")}</button>
        {(input || base) && <button type="button" onClick={() => { setInput(""); setBase(""); }} className="text-muted hover:text-foreground">{t("common.clear")}</button>}
      </div>}>
        <textarea rows={3} value={input} onChange={(event) => setInput(event.target.value)} aria-label={t("urlParserPage.input")} placeholder={t("urlParserPage.placeholder")} spellCheck={false} autoComplete="off" className={inputClass} />
        <label className="mt-4 block space-y-2 text-sm"><span className="text-muted">{t("urlParserPage.base")}</span>
          <input type="text" value={base} onChange={(event) => setBase(event.target.value)} placeholder="https://example.com/app/" spellCheck={false} autoComplete="off" className={inputClass} />
        </label>
      </ToolPanel>

      {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{t(`urlParserPage.errors.${error}`, { characters: URL_PARSER_LIMITS.characters, parameters: URL_PARSER_LIMITS.parameters })}</p>}

      {result && <>
        <ToolPanel label={t("urlParserPage.normalized")} action={<CopyButton value={result.href} />}>
          <textarea readOnly rows={3} value={result.href} aria-label={t("urlParserPage.normalized")} className={inputClass} />
        </ToolPanel>

        <ToolPanel label={t("urlParserPage.components")}>
          <dl className="divide-y divide-border">
            {fields.map((field) => <div key={field} className="grid min-w-0 gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start">
              <dt className="text-sm text-muted">{t(`urlParserPage.fields.${field}`)}</dt>
              <dd className="flex min-w-0 items-start justify-between gap-3"><span className="min-w-0 whitespace-pre-wrap break-all font-mono text-sm">{result[field] || <span className="font-sans text-muted">{t("urlParserPage.absent")}</span>}</span><CopyButton value={result[field]} className="shrink-0" /></dd>
            </div>)}
          </dl>
        </ToolPanel>

        <ToolPanel label={t("urlParserPage.parameters")} action={<span className="text-sm text-muted">{t("urlParserPage.count", { count: result.parameters.length })}</span>}>
          {result.parameters.length === 0 ? <p role="status" className="text-sm text-muted">{t("urlParserPage.noParameters")}</p> : <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <thead><tr><th scope="col" className="w-10 border-b border-border py-2 text-muted">#</th><th scope="col" className="w-[35%] border-b border-border p-2">{t("urlParserPage.key")}</th><th scope="col" className="border-b border-border p-2">{t("urlParserPage.value")}</th></tr></thead>
              <tbody>{result.parameters.map(([key, value], index) => <tr key={index}>
                <td className="border-b border-border py-3 align-top text-muted">{index + 1}</td>
                <td className="break-all border-b border-border p-2 align-top font-mono">{key || <span className="font-sans text-muted">{t("urlParserPage.empty")}</span>}</td>
                <td className="break-all border-b border-border p-2 align-top"><div className="mb-2 whitespace-pre-wrap font-mono">{value || <span className="font-sans text-muted">{t("urlParserPage.empty")}</span>}</div><CopyButton value={value} /></td>
              </tr>)}</tbody>
            </table>
          </div>}
        </ToolPanel>
      </>}
    </ToolLayout>
  );
}
