"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Mode = "encode" | "decode";
type Scope = "component" | "uri";

/** Encode text for use in a URL. */
function encode(text: string, scope: Scope): string {
  // `component` escapes URL delimiters (/ ? & = # …) too — safe for query values.
  // `uri` preserves the overall URL structure — for encoding a whole address.
  return scope === "component" ? encodeURIComponent(text) : encodeURI(text);
}

/** Decode a percent-encoded URL string. Throws on malformed input. */
function decode(text: string, scope: Scope): string {
  const cleaned = text.trim();
  return scope === "component"
    ? decodeURIComponent(cleaned)
    : decodeURI(cleaned);
}

export default function UrlPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result =
        mode === "encode" ? encode(input, scope) : decode(input, scope);
      return { output: result, error: "" };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? t("urlPage.errorDecode")
            : t("urlPage.errorEncode"),
      };
    }
  }, [input, mode, scope, t]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Feed the current output back as input to make encode↔decode round-trips easy.
    setMode(next);
    if (output) setInput(output);
  }

  return (
    <ToolLayout
      title={t("tools.url.name")}
      description={t("urlPage.description")}
      icon="🔗"
    >
      {/* Mode tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["encode", t("urlPage.encode")],
              ["decode", t("urlPage.decode")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
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

        {/* Scope selector */}
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["component", t("urlPage.scopeComponent")],
              ["uri", t("urlPage.scopeUri")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                scope === value
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted">
        {scope === "component"
          ? t("urlPage.hintComponent")
          : t("urlPage.hintUri")}
      </p>

      {/* Input */}
      <ToolPanel
        label={
          mode === "encode"
            ? t("urlPage.inputLabelEncode")
            : t("urlPage.inputLabelDecode")
        }
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
          rows={5}
          placeholder={
            mode === "encode"
              ? t("urlPage.placeholderEncode")
              : t("urlPage.placeholderDecode")
          }
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
            rows={5}
            placeholder={t("common.resultPlaceholder")}
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
          />
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
