"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type Stats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  minutes: number;
};

/**
 * Count text stats. Word counting is script-aware: CJK (Han) characters are
 * counted individually since they aren't space-separated, while runs of letters
 * or digits count as one word each.
 */
function computeStats(text: string): Stats {
  const han = (text.match(/\p{Script=Han}/gu) ?? []).length;
  const nonHanWords = (
    text.replace(/\p{Script=Han}/gu, " ").match(/[\p{L}\p{N}]+/gu) ?? []
  ).length;
  const words = han + nonHanWords;
  const trimmed = text.trim();

  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words,
    lines: text === "" ? 0 : text.split(/\n/).length,
    paragraphs:
      trimmed === ""
        ? 0
        : trimmed.split(/\n\s*\n/).filter((p) => p.trim() !== "").length,
    // Average adult reading speed ≈ 200 words per minute.
    minutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / 200)),
  };
}

export default function WordCounterPage() {
  const t = useTranslations();
  const [text, setText] = useState("");

  const stats = useMemo(() => computeStats(text), [text]);

  const tiles: { label: string; value: string }[] = [
    { label: t("wordCounterPage.characters"), value: String(stats.characters) },
    {
      label: t("wordCounterPage.charactersNoSpaces"),
      value: String(stats.charactersNoSpaces),
    },
    { label: t("wordCounterPage.words"), value: String(stats.words) },
    { label: t("wordCounterPage.lines"), value: String(stats.lines) },
    { label: t("wordCounterPage.paragraphs"), value: String(stats.paragraphs) },
    {
      label: t("wordCounterPage.readingTime"),
      value: t("wordCounterPage.readingMinutes", { n: stats.minutes }),
    },
  ];

  return (
    <ToolLayout
      title={t("tools.word-counter.name")}
      description={t("wordCounterPage.description")}
      icon="📝"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-sm"
          >
            <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {tile.value}
            </div>
            <div className="mt-1 text-xs text-muted">{tile.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <ToolPanel
        label={t("wordCounterPage.inputLabel")}
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
          rows={10}
          placeholder={t("wordCounterPage.placeholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>
    </ToolLayout>
  );
}
