"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Parsed =
  | { ok: true; value: bigint | null }
  | { ok: false };

/** Parse a string in the given base into a BigInt (null for empty input). */
function parseInBase(raw: string, base: number): Parsed {
  let s = raw.trim().toLowerCase();
  if (s === "") return { ok: true, value: null };
  let neg = false;
  if (s[0] === "-") {
    neg = true;
    s = s.slice(1);
  }
  if (s === "") return { ok: false };
  const B = BigInt(base);
  let v = 0n;
  for (const ch of s) {
    const d =
      ch >= "0" && ch <= "9"
        ? ch.charCodeAt(0) - 48
        : ch >= "a" && ch <= "z"
          ? ch.charCodeAt(0) - 87
          : -1;
    if (d < 0 || d >= base) return { ok: false };
    v = v * B + BigInt(d);
  }
  return { ok: true, value: neg ? -v : v };
}

/** BigInt → uppercase string in the given base (empty for null). */
function formatInBase(value: bigint | null, base: number): string {
  if (value === null) return "";
  return value.toString(base).toUpperCase();
}

export default function BaseConverterPage() {
  const t = useTranslations();
  // Single source of truth; each field renders from this except the one being typed in.
  const [value, setValue] = useState<bigint | null>(null);
  const [editing, setEditing] = useState<{ base: number; text: string } | null>(
    null,
  );
  const [errorBase, setErrorBase] = useState<number | null>(null);
  const [customBase, setCustomBase] = useState(36);

  function onEdit(base: number, raw: string) {
    setEditing({ base, text: raw });
    const parsed = parseInBase(raw, base);
    if (parsed.ok) {
      setValue(parsed.value);
      setErrorBase(null);
    } else {
      setErrorBase(base);
    }
  }

  function fieldValue(base: number): string {
    if (editing && editing.base === base) return editing.text;
    return formatInBase(value, base);
  }

  const rows: { base: number; label: string }[] = [
    { base: 2, label: t("baseConverterPage.binary") },
    { base: 8, label: t("baseConverterPage.octal") },
    { base: 10, label: t("baseConverterPage.decimal") },
    { base: 16, label: t("baseConverterPage.hex") },
  ];

  function Field({ base, label }: { base: number; label: string }) {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="text-sm font-semibold text-foreground/80">
            {label}
          </label>
          <CopyButton value={fieldValue(base)} />
        </div>
        <input
          value={fieldValue(base)}
          onChange={(e) => onEdit(base, e.target.value)}
          spellCheck={false}
          placeholder={t("baseConverterPage.placeholder")}
          className={`w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500 ${
            errorBase === base ? "border-red-500" : "border-border"
          }`}
        />
        {errorBase === base && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            ⚠️ {t("baseConverterPage.error", { base })}
          </p>
        )}
      </div>
    );
  }

  return (
    <ToolLayout
      title={t("tools.base-converter.name")}
      description={t("baseConverterPage.description")}
      icon="🔢"
    >
      <ToolPanel>
        <div className="space-y-4">
          {rows.map((r) => (
            <Field key={r.base} base={r.base} label={r.label} />
          ))}
        </div>
      </ToolPanel>

      {/* Custom base */}
      <ToolPanel>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-foreground/80">
              {t("baseConverterPage.customLabel", { base: customBase })}
            </label>
            <input
              type="number"
              min={2}
              max={36}
              value={customBase}
              onChange={(e) => {
                const n = Math.min(36, Math.max(2, Number(e.target.value) || 2));
                setCustomBase(n);
                // Reformat all fields from the current value in the new base.
                setEditing(null);
                setErrorBase(null);
              }}
              className="w-20 rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <CopyButton value={fieldValue(customBase)} />
        </div>
        <input
          value={fieldValue(customBase)}
          onChange={(e) => onEdit(customBase, e.target.value)}
          spellCheck={false}
          placeholder={t("baseConverterPage.placeholder")}
          className={`w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500 ${
            errorBase === customBase ? "border-red-500" : "border-border"
          }`}
        />
        {errorBase === customBase && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            ⚠️ {t("baseConverterPage.error", { base: customBase })}
          </p>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
