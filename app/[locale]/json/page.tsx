"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Mode = "format" | "minify";
type Indent = 2 | 4;

/** Parse then re-serialize JSON, either pretty-printed or minified. */
function process(input: string, mode: Mode, indent: Indent): string {
  const parsed = JSON.parse(input);
  return mode === "format"
    ? JSON.stringify(parsed, null, indent)
    : JSON.stringify(parsed);
}

/** Pull the line/column out of a JSON.parse SyntaxError, if the engine offers one. */
function errorPosition(
  input: string,
  err: unknown,
): { line: number; column: number } | null {
  const message = err instanceof Error ? err.message : String(err);
  // V8 includes "at position N" — translate it into a line/column hint.
  const match = /position (\d+)/.exec(message);
  if (!match) return null;
  const pos = Number(match[1]);
  const before = input.slice(0, pos);
  return {
    line: before.split("\n").length,
    column: pos - before.lastIndexOf("\n"),
  };
}

export default function JsonPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<Indent>(2);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: process(input, mode, indent), error: "" };
    } catch (err) {
      const pos = errorPosition(input, err);
      return {
        output: "",
        error: pos ? t("jsonPage.errorAt", pos) : t("jsonPage.error"),
      };
    }
  }, [input, mode, indent, t]);

  return (
    <ToolLayout
      title={t("tools.json.name")}
      description={t("jsonPage.description")}
      icon="{ }"
    >
      {/* Mode + indent controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["format", t("jsonPage.format")],
              ["minify", t("jsonPage.minify")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                mode === value
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Indent selector — only meaningful when formatting */}
        {mode === "format" && (
          <div className="inline-flex rounded-lg border border-border p-1">
            {([2, 4] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setIndent(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  indent === value
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                {t("jsonPage.indent", { n: value })}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ToolPanel
        label={t("jsonPage.inputLabel")}
        action={
          input ? (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("common.clear")}
            </button>
          ) : null
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={t("jsonPage.placeholder", {
            example: '{"name":"ToolNest","tags":[1,2,3]}',
          })}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Output */}
      <ToolPanel label={t("common.result")} action={<CopyButton value={output} />}>
        {error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        ) : (
          <textarea
            value={output}
            readOnly
            rows={8}
            placeholder={t("common.resultPlaceholder")}
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
          />
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
