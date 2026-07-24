"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

/**
 * Split text into words, understanding input that is *already* in a naming
 * style — camelCase, PascalCase, snake_case, kebab-case or plain prose — so
 * conversions round-trip instead of mangling the input.
 */
function toWords(text: string): string[] {
  return text
    // fooBar → foo Bar
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    // HTTPServer → HTTP Server
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    // Anything that isn't a letter or digit is a separator.
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

const capitalize = (w: string) =>
  w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

function convert(text: string) {
  const words = toWords(text);
  // Prose-style conversions keep the original punctuation and spacing, but we
  // still break camelCase humps first so `helloWorld` titles as "Hello World"
  // rather than "Helloworld".
  const spaced = text
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2");

  return {
    upper: text.toUpperCase(),
    lower: text.toLowerCase(),
    // Capitalize the first letter of each word, leaving punctuation in place.
    title: spaced
      .toLowerCase()
      .replace(/(^|[^\p{L}\p{N}'’])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase()),
    // Capitalize the first letter of each sentence.
    sentence: spaced
      .toLowerCase()
      .replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase()),
    camel: words
      .map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w)))
      .join(""),
    pascal: words.map(capitalize).join(""),
    snake: words.map((w) => w.toLowerCase()).join("_"),
    kebab: words.map((w) => w.toLowerCase()).join("-"),
    constant: words.map((w) => w.toUpperCase()).join("_"),
  };
}

const KEYS = [
  "upper",
  "lower",
  "title",
  "sentence",
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
] as const;

export default function CaseConverterPage() {
  const t = useTranslations();
  const [text, setText] = useState("");

  const results = useMemo(() => convert(text), [text]);

  return (
    <ToolLayout
      title={t("tools.case-converter.name")}
      description={t("caseConverterPage.description")}
      icon="🔠"
    >
      {/* Input */}
      <ToolPanel
        label={t("caseConverterPage.inputLabel")}
        action={
          text ? (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("common.clear")}
            </button>
          ) : null
        }
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={t("caseConverterPage.placeholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Results — one row per case style */}
      <ToolPanel label={t("common.result")}>
        <ul className="space-y-3">
          {KEYS.map((key) => (
            <li
              key={key}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="w-44 shrink-0 text-sm font-semibold text-foreground/80">
                {t(`caseConverterPage.${key}`)}
              </span>
              <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-background p-2.5 font-mono text-xs text-foreground/90 sm:text-sm">
                {results[key]}
              </code>
              <CopyButton value={results[key]} className="shrink-0" />
            </li>
          ))}
        </ul>
      </ToolPanel>
    </ToolLayout>
  );
}
