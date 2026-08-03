"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

/** base64url → UTF-8 string. Throws on malformed input. */
function b64urlDecode(seg: string): string {
  const b64 = seg.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const binary = atob(b64 + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

type Decoded = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
};

/** Split and decode a JWT's header and payload. Throws if it isn't a JWT. */
function decodeJwt(token: string): Decoded {
  const parts = token.trim().split(".");
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error("not a jwt");
  }
  return {
    header: JSON.parse(b64urlDecode(parts[0])),
    payload: JSON.parse(b64urlDecode(parts[1])),
  };
}

const TIMESTAMP_CLAIMS = ["iat", "exp", "nbf"] as const;

export default function JwtPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [input, setInput] = useState("");

  const { decoded, error } = useMemo(() => {
    if (!input.trim()) return { decoded: null, error: "" };
    try {
      return { decoded: decodeJwt(input), error: "" };
    } catch {
      return { decoded: null, error: t("jwtPage.error") };
    }
  }, [input, t]);

  const headerJson = decoded ? JSON.stringify(decoded.header, null, 2) : "";
  const payloadJson = decoded ? JSON.stringify(decoded.payload, null, 2) : "";

  // Human-readable dates for any standard timestamp claims present.
  const claims = decoded
    ? TIMESTAMP_CLAIMS.filter(
        (c) => typeof decoded.payload[c] === "number",
      ).map((c) => ({
        key: c,
        date: new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "medium",
        }).format((decoded.payload[c] as number) * 1000),
      }))
    : [];

  return (
    <ToolLayout
      title={t("tools.jwt.name")}
      description={t("jwtPage.description")}
      icon="🎫"
    >
      {/* Input */}
      <ToolPanel
        label={t("jwtPage.inputLabel")}
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
          rows={4}
          placeholder={t("jwtPage.placeholder")}
          spellCheck={false}
          className="w-full resize-y break-all rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          ⚠️ {error}
        </p>
      )}

      {decoded && (
        <>
          <ToolPanel
            label={t("jwtPage.headerLabel")}
            action={<CopyButton value={headerJson} />}
          >
            <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
              {headerJson}
            </pre>
          </ToolPanel>

          <ToolPanel
            label={t("jwtPage.payloadLabel")}
            action={<CopyButton value={payloadJson} />}
          >
            <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
              {payloadJson}
            </pre>

            {claims.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {claims.map((c) => (
                  <li key={c.key}>
                    <span className="font-mono text-foreground/70">{c.key}</span>{" "}
                    · {t(`jwtPage.${c.key}`)}: {c.date}
                  </li>
                ))}
              </ul>
            )}
          </ToolPanel>

          <p className="text-sm text-muted">⚠️ {t("jwtPage.notVerified")}</p>
        </>
      )}
    </ToolLayout>
  );
}
