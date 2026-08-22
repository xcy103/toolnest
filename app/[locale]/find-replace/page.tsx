"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import {
  buildPattern,
  findMatches,
  replaceAll,
  ReplaceError,
  type Match,
  type ReplaceOptions,
} from "@/lib/replace";

/** Wrap every match in <mark> so the user can see what will be replaced. */
function highlight(text: string, matches: Match[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    // Zero-length matches have nothing to paint.
    if (m.length === 0 || m.index < last) return;
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <mark key={i} className="rounded bg-emerald-500/30 text-foreground">
        {text.slice(m.index, m.index + m.length)}
      </mark>,
    );
    last = m.index + m.length;
  });
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function FindReplacePage() {
  const t = useTranslations();
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<ReplaceOptions>({
    regex: false,
    caseSensitive: false,
    wholeWord: false,
  });

  const result = useMemo(() => {
    if (!text || !search) {
      return { output: text, count: 0, matches: [] as Match[], error: "" };
    }
    try {
      const { output, count } = replaceAll(text, search, replacement, options);
      const matches = findMatches(text, buildPattern(search, options));
      return { output, count, matches, error: "" };
    } catch (err) {
      const key = err instanceof ReplaceError ? err.key : "unknown";
      const values = err instanceof ReplaceError ? err.values : {};
      return {
        output: "",
        count: 0,
        matches: [] as Match[],
        error: t(`findReplacePage.errors.${key}`, values),
      };
    }
  }, [text, search, replacement, options, t]);

  const toggle = (key: keyof ReplaceOptions) => () =>
    setOptions((o) => ({ ...o, [key]: !o[key] }));

  const optionList: { key: keyof ReplaceOptions; label: string }[] = [
    { key: "caseSensitive", label: t("findReplacePage.caseSensitive") },
    { key: "wholeWord", label: t("findReplacePage.wholeWord") },
    { key: "regex", label: t("findReplacePage.regexMode") },
  ];

  return (
    <ToolLayout
      title={t("tools.find-replace.name")}
      description={t("findReplacePage.description")}
      icon="🔎"
    >
      {/* Search / replace terms */}
      <ToolPanel>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground/80">
              {t("findReplacePage.findLabel")}
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("findReplacePage.findPlaceholder")}
              spellCheck={false}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground/80">
              {t("findReplacePage.replaceLabel")}
            </span>
            <input
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder={t("findReplacePage.replacePlaceholder")}
              spellCheck={false}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {optionList.map((o) => (
            <label key={o.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options[o.key]}
                onChange={toggle(o.key)}
                className="h-4 w-4 accent-emerald-500"
              />
              {o.label}
            </label>
          ))}
        </div>

        {options.regex && (
          <p className="mt-2 text-sm text-muted">{t("findReplacePage.regexHint")}</p>
        )}
      </ToolPanel>

      {/* Source text */}
      <ToolPanel
        label={t("findReplacePage.inputLabel")}
        action={
          text ? (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("common.clear")}
            </button>
          ) : null
        }
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={t("findReplacePage.inputPlaceholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />

        {/* Preview: what is about to be replaced */}
        {search && !result.error && text && (
          <div className="mt-3">
            <p className="mb-1.5 text-sm text-muted">
              {t("findReplacePage.preview")}
            </p>
            <div className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
              {highlight(text, result.matches)}
            </div>
          </div>
        )}
      </ToolPanel>

      {/* Result */}
      <ToolPanel
        label={t("common.result")}
        action={<CopyButton value={result.output} />}
      >
        {result.error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {result.error}
          </p>
        ) : (
          <>
            <textarea
              value={result.output}
              readOnly
              rows={8}
              placeholder={t("common.resultPlaceholder")}
              className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
            />
            {search && text && (
              <p className="mt-2 text-sm text-muted">
                {t("findReplacePage.replacedCount", { n: result.count })}
              </p>
            )}
          </>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
