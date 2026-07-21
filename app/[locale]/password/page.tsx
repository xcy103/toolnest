"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
const AMBIGUOUS = new Set("Il1O0".split(""));

type Options = {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

/** Pick a uniformly-distributed random index in [0, max) without modulo bias. */
function randomIndex(max: number): number {
  // Reject values in the final, non-whole "wrap" of the 32-bit range.
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

function buildPool(opts: Options): string {
  let pool = "";
  if (opts.lower) pool += SETS.lower;
  if (opts.upper) pool += SETS.upper;
  if (opts.numbers) pool += SETS.numbers;
  if (opts.symbols) pool += SETS.symbols;
  if (opts.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  return pool;
}

function generate(opts: Options): string {
  const pool = buildPool(opts);
  if (!pool) return "";
  let out = "";
  for (let i = 0; i < opts.length; i++) out += pool[randomIndex(pool.length)];
  return out;
}

/** Rough strength bucket from Shannon entropy (length × log2(pool size)). */
function strengthBucket(opts: Options): 0 | 1 | 2 | 3 {
  const pool = buildPool(opts);
  if (!pool) return 0;
  const bits = opts.length * Math.log2(pool.length);
  if (bits < 40) return 0;
  if (bits < 60) return 1;
  if (bits < 80) return 2;
  return 3;
}

export default function PasswordPage() {
  const t = useTranslations();
  const [opts, setOpts] = useState<Options>({
    length: 16,
    lower: true,
    upper: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");

  const noCharset = !opts.lower && !opts.upper && !opts.numbers && !opts.symbols;

  function regenerate() {
    setPassword(noCharset ? "" : generate(opts));
  }

  // Generate on mount and whenever the options change. Random output must be
  // produced on the client only, or SSR and hydration would disagree.
  useEffect(() => {
    function run() {
      setPassword(noCharset ? "" : generate(opts));
    }
    run();
  }, [opts, noCharset]);

  function toggle(key: keyof Omit<Options, "length">) {
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  }

  const strengthKeys = [
    "strengthWeak",
    "strengthFair",
    "strengthGood",
    "strengthStrong",
  ] as const;
  const strengthColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
  ];
  const bucket = strengthBucket(opts);

  const CHECKBOXES: { key: keyof Omit<Options, "length">; label: string }[] = [
    { key: "lower", label: t("passwordPage.optLower") },
    { key: "upper", label: t("passwordPage.optUpper") },
    { key: "numbers", label: t("passwordPage.optNumbers") },
    { key: "symbols", label: t("passwordPage.optSymbols") },
  ];

  return (
    <ToolLayout
      title={t("tools.password.name")}
      description={t("passwordPage.description")}
      icon="🔑"
    >
      {/* Output */}
      <ToolPanel
        label={t("passwordPage.outputLabel")}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={regenerate}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              🔄 {t("passwordPage.regenerate")}
            </button>
            <CopyButton value={password} />
          </div>
        }
      >
        {noCharset ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {t("passwordPage.errorNoCharset")}
          </p>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-lg text-foreground">
              {password}
            </code>
          </div>
        )}

        {/* Strength meter */}
        {!noCharset && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= bucket ? strengthColors[bucket] : "bg-foreground/10"
                  }`}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs text-muted">
              {t("passwordPage.strengthLabel")}:{" "}
              {t(`passwordPage.${strengthKeys[bucket]}`)}
            </span>
          </div>
        )}
      </ToolPanel>

      {/* Options */}
      <ToolPanel>
        {/* Length slider */}
        <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
          {t("passwordPage.lengthLabel", { n: opts.length })}
        </label>
        <input
          type="range"
          min={4}
          max={64}
          value={opts.length}
          onChange={(e) =>
            setOpts((o) => ({ ...o, length: Number(e.target.value) }))
          }
          className="w-full accent-emerald-500"
        />

        {/* Character-set toggles */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHECKBOXES.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition hover:bg-foreground/5"
            >
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={() => toggle(key)}
                className="h-4 w-4 accent-emerald-500"
              />
              {label}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition hover:bg-foreground/5 sm:col-span-2">
            <input
              type="checkbox"
              checked={opts.excludeAmbiguous}
              onChange={() => toggle("excludeAmbiguous")}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("passwordPage.excludeAmbiguous")}
          </label>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
