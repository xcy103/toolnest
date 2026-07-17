"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  /** Text to copy to the clipboard. */
  value: string;
  /** Optional label override; defaults to the translated "Copy". */
  label?: string;
  className?: string;
};

/** A small button that copies `value` and shows a transient "copied" state. */
export default function CopyButton({ value, label, className = "" }: Props) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition enabled:hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {copied ? `✅ ${t("copied")}` : `📋 ${label ?? t("copy")}`}
    </button>
  );
}
