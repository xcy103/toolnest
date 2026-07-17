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

type Digests = { label: string; value: string }[];

export default function HashPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [digests, setDigests] = useState<Digests>([]);

  useEffect(() => {
    let cancelled = false;

    async function compute() {
      if (!input) {
        if (!cancelled) setDigests([]);
        return;
      }
      const bytes = new TextEncoder().encode(input);
      const results: Digests = [{ label: "MD5", value: md5(bytes) }];
      for (const algo of SHA_ALGOS) {
        const buf = await crypto.subtle.digest(algo, bytes);
        results.push({ label: algo, value: toHex(buf) });
      }
      if (!cancelled) setDigests(results);
    }

    compute();
    return () => {
      cancelled = true;
    };
  }, [input]);

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
          placeholder={t("hashPage.placeholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Output — one row per algorithm */}
      <ToolPanel label={t("hashPage.outputLabel")}>
        {digests.length === 0 ? (
          <p className="text-sm text-muted">{t("hashPage.outputPlaceholder")}</p>
        ) : (
          <ul className="space-y-3">
            {digests.map(({ label, value }) => (
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
