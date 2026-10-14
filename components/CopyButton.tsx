"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  /** Text to copy to the clipboard. */
  value: string;
  /** Optional label override; defaults to the translated "Copy". */
  label?: string;
  className?: string;
  /** Permit copying an intentionally empty value, such as the root JSON Pointer. */
  allowEmpty?: boolean;
};

/** A small button that copies `value` and shows a transient "copied" state. */
export default function CopyButton({ value, label, className = "", allowEmpty = false }: Props) {
  const t = useTranslations("common");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);
  const copied = copiedValue !== null && copiedValue === value;

  useEffect(() => () => {
    request.current += 1;
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
  }, []);

  async function handleCopy() {
    if (!value && !allowEmpty) return;
    const currentRequest = ++request.current;
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    setCopiedValue(null);
    try {
      await navigator.clipboard.writeText(value);
      if (currentRequest !== request.current) return;
      setCopiedValue(value);
      resetTimer.current = setTimeout(() => {
        setCopiedValue(null);
        resetTimer.current = null;
      }, 1500);
    } catch {
      if (currentRequest === request.current) setCopiedValue(null);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value && !allowEmpty}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition enabled:hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {copied ? `✅ ${t("copied")}` : `📋 ${label ?? t("copy")}`}
    </button>
  );
}
