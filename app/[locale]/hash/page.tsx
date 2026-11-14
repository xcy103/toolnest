"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { md5 } from "@/lib/md5";

/** Algorithms shown, in display order. SHA variants use Web Crypto. */
const SHA_ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

type Digest = { label: string; value: string };
type HashResult = { input: string; digests: Digest[] | null };

export default function HashPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<HashResult | null>(null);
  const current = input && result?.input === input ? result : null;

  useEffect(() => {
    if (!input) return;
    let cancelled = false;

    async function compute() {
      try {
        const bytes = new TextEncoder().encode(input);
        const shaDigests = await Promise.all(SHA_ALGOS.map(async (label) => {
          const buffer = await crypto.subtle.digest(label, bytes);
          return { label, value: toHex(buffer) };
        }));
        if (!cancelled) {
          setResult({ input, digests: [{ label: "MD5", value: md5(bytes) }, ...shaDigests] });
        }
      } catch {
        if (!cancelled) setResult({ input, digests: null });
      }
    }

    compute();
    return () => {
      cancelled = true;
    };
  }, [input]);

  function updateInput(value: string) {
    setInput(value);
    setResult(null);
  }

  return (
    <ToolLayout
      title={t("tools.hash.name")}
      description={t("hashPage.description")}
      icon="#"
    >
      {/* Input */}
      <ToolPanel
        label={t("hashPage.inputLabel")}
        action={
          input ? (
            <button
              type="button"
              onClick={() => updateInput("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("common.clear")}
            </button>
          ) : null
        }
      >
        <textarea
          value={input}
          onChange={(e) => updateInput(e.target.value)}
          rows={5}
          placeholder={t("hashPage.placeholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Output — one row per algorithm */}
      <ToolPanel label={t("hashPage.outputLabel")}>
        {!current?.digests ? (
          <p role="status" className="text-sm text-muted">
            {t(!input ? "hashPage.outputPlaceholder" : current ? "hashPage.computeError" : "hashPage.computing")}
          </p>
        ) : (
          <ul className="space-y-3">
            {current.digests.map(({ label, value }) => (
              <li
                key={label}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="w-20 shrink-0 text-sm font-semibold text-foreground/80">
                  {label}
                </span>
                <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-background p-2.5 font-mono text-xs text-foreground/90 sm:text-sm">
                  {value}
                </code>
                <CopyButton value={value} className="shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </ToolPanel>

      <p className="text-sm text-muted">{t("hashPage.note")}</p>
    </ToolLayout>
  );
}
