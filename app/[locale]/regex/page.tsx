"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

const FLAGS = ["g", "i", "m", "s", "u"] as const;
type Flag = (typeof FLAGS)[number];

type MatchInfo = { index: number; text: string; groups: (string | undefined)[] };

type Result =
  | { ok: true; matches: MatchInfo[] }
  | { ok: false; message: string };

function run(pattern: string, flags: string, subject: string): Result {
  try {
    // Force the global flag so we can enumerate every match.
    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const matches: MatchInfo[] = [];
    for (const m of subject.matchAll(re)) {
      matches.push({
        index: m.index ?? 0,
        text: m[0],
        groups: m.slice(1),
      });
      // Guard against zero-length matches looping forever.
      if (m[0] === "") re.lastIndex++;
    }
    return { ok: true, matches };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** Wrap matched spans of `text` in <mark>, skipping zero-length matches. */
function highlight(text: string, matches: MatchInfo[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    const start = m.index;
    const end = start + m.text.length;
    if (end <= last || end === start) return;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(
      <mark
        key={i}
        className="rounded bg-emerald-500/30 text-foreground"
      >
        {text.slice(start, end)}
      </mark>,
    );
    last = end;
  });
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function RegexPage() {
  const t = useTranslations();
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Flag[]>(["g"]);
  const [subject, setSubject] = useState("");

  const result = useMemo(
    () => (pattern ? run(pattern, flags.join(""), subject) : null),
    [pattern, flags, subject],
  );

  function toggleFlag(f: Flag) {
    setFlags((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  }

  return (
    <ToolLayout
      title={t("tools.regex.name")}
      description={t("regexPage.description")}
      icon="✳️"
    >
      {/* Pattern + flags */}
      <ToolPanel label={t("regexPage.patternLabel")}>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder={t("regexPage.patternPlaceholder")}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
        <div className="mt-3">
          <span className="mb-1.5 block text-sm font-medium text-foreground/70">
            {t("regexPage.flagsLabel")}
          </span>
          <div className="flex flex-wrap gap-2">
            {FLAGS.map((f) => (
              <label
                key={f}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm transition hover:bg-foreground/5"
              >
                <input
                  type="checkbox"
                  checked={flags.includes(f)}
                  onChange={() => toggleFlag(f)}
                  className="h-4 w-4 accent-emerald-500"
                />
                {t(`regexPage.flag${f.toUpperCase()}`)}
              </label>
            ))}
          </div>
        </div>
      </ToolPanel>

      {/* Test string */}
      <ToolPanel label={t("regexPage.testLabel")}>
        <textarea
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          rows={5}
          placeholder={t("regexPage.testPlaceholder")}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Result */}
      {result && !result.ok && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          ⚠️ {t("regexPage.error", { message: result.message })}
        </p>
      )}

      {result && result.ok && subject && (
        <ToolPanel
          label={`${t("regexPage.matchesLabel")} · ${t("regexPage.matchCount", { n: result.matches.length })}`}
        >
          {/* Highlighted subject */}
          <pre className="mb-4 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90">
            {highlight(subject, result.matches)}
          </pre>

          {result.matches.length === 0 ? (
            <p className="text-sm text-muted">{t("regexPage.noMatches")}</p>
          ) : (
            <ol className="space-y-2">
              {result.matches.map((m, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border bg-background p-2.5 text-sm"
                >
                  <code className="font-mono text-emerald-600 dark:text-emerald-400">
                    {m.text || "∅"}
                  </code>
                  {m.groups.length > 0 && (
                    <span className="ml-2 text-muted">
                      {m.groups.map((g, gi) => (
                        <span key={gi} className="ml-2">
                          {t("regexPage.group", { n: gi + 1 })}:{" "}
                          <code className="font-mono text-foreground/80">
                            {g ?? "∅"}
                          </code>
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
