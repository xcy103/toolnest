"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { decodeHtmlEntities, encodeHtmlEntities } from "@/lib/html-entities";

type Mode = "encode" | "decode";

export default function HtmlEntitiesPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? encodeHtmlEntities(input) : decodeHtmlEntities(input);
  }, [input, mode]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    if (output) setInput(output);
  }

  function loadExample() {
    setInput(
      mode === "encode"
        ? `<p class="note">Tom & Jerry's "demo"</p>`
        : "&lt;p class=&quot;note&quot;&gt;Tom &amp; Jerry&#39;s &quot;demo&quot;&lt;/p&gt;",
    );
  }

  return (
    <ToolLayout
      title={t("tools.html-entities.name")}
      description={t("htmlEntitiesPage.description")}
      icon="&lt;&gt;"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["encode", t("htmlEntitiesPage.encode")],
              ["decode", t("htmlEntitiesPage.decode")],
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

        <button
          type="button"
          onClick={loadExample}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
        >
          {t("htmlEntitiesPage.example")}
        </button>
      </div>

      <p className="text-sm text-muted">{t("htmlEntitiesPage.hint")}</p>

      <ToolPanel
        label={
          mode === "encode"
            ? t("htmlEntitiesPage.inputEncode")
            : t("htmlEntitiesPage.inputDecode")
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
          rows={8}
          spellCheck={false}
          placeholder={
            mode === "encode"
              ? t("htmlEntitiesPage.placeholderEncode")
              : t("htmlEntitiesPage.placeholderDecode")
          }
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      <ToolPanel label={t("common.result")} action={<CopyButton value={output} />}>
        <textarea
          value={output}
          readOnly
          rows={8}
          placeholder={t("common.resultPlaceholder")}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
        />
      </ToolPanel>
    </ToolLayout>
  );
}
