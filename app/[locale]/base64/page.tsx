"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { decodeBase64, encodeBase64 } from "@/lib/base64";

type Mode = "encode" | "decode";

export default function Base64Page() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (input === "" || (mode === "decode" && !input.trim())) return { output: "", error: "" };
    try {
      const result =
        mode === "encode" ? encodeBase64(input) : decodeBase64(input);
      return { output: result, error: "" };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? t("base64Page.errorDecode")
            : t("base64Page.errorEncode"),
      };
    }
  }, [input, mode, t]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Feed the current output back as input to make encode↔decode round-trips easy.
    setMode(next);
    if (output) setInput(output);
  }

  return (
    <ToolLayout
      title={t("tools.base64.name")}
      description={t("base64Page.description")}
      icon="🔤"
    >
      {/* Mode tabs */}
      <div className="inline-flex rounded-lg border border-border p-1">
        {(
          [
            ["encode", t("base64Page.encode")],
            ["decode", t("base64Page.decode")],
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

      {/* Input */}
      <ToolPanel
        label={
          mode === "encode"
            ? t("base64Page.inputLabelEncode")
            : t("base64Page.inputLabelDecode")
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
              ? t("base64Page.placeholderEncode")
              : t("base64Page.placeholderDecode")
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
