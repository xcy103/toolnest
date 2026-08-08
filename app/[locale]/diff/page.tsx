"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";

type Line = { type: "same" | "add" | "del"; text: string };

/**
 * Line-level diff via the classic longest-common-subsequence algorithm: build
 * the LCS-length table, then backtrack to emit unchanged / removed / added lines.
 */
function diffLines(aText: string, bText: string): Line[] {
  // An empty side is zero lines, not one blank line (avoids a spurious "-" row).
  const a = aText === "" ? [] : aText.split("\n");
  const b = bText === "" ? [] : bText.split("\n");
  const n = a.length;
  const m = b.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: Line[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: a[i] });
      i++;
    } else {
      out.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "del", text: a[i++] });
  while (j < m) out.push({ type: "add", text: b[j++] });
  return out;
}

const LINE_STYLE: Record<Line["type"], string> = {
  same: "text-foreground/60",
  add: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  del: "bg-red-500/10 text-red-700 dark:text-red-300",
};
const PREFIX: Record<Line["type"], string> = { same: " ", add: "+", del: "-" };

export default function DiffPage() {
  const t = useTranslations();
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");

  const lines = useMemo(() => {
    if (!original && !changed) return null;
    return diffLines(original, changed);
  }, [original, changed]);

  const added = lines?.filter((l) => l.type === "add").length ?? 0;
  const removed = lines?.filter((l) => l.type === "del").length ?? 0;

  return (
    <ToolLayout
      title={t("tools.diff.name")}
      description={t("diffPage.description")}
      icon="🔀"
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ToolPanel label={t("diffPage.originalLabel")}>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={8}
            placeholder={t("diffPage.originalPlaceholder")}
            spellCheck={false}
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
        </ToolPanel>
        <ToolPanel label={t("diffPage.changedLabel")}>
          <textarea
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            rows={8}
            placeholder={t("diffPage.changedPlaceholder")}
            spellCheck={false}
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
        </ToolPanel>
      </div>

      {/* Result */}
      {lines && (
        <ToolPanel
          label={`${t("diffPage.resultLabel")} · ${t("diffPage.added", { n: added })} · ${t("diffPage.removed", { n: removed })}`}
        >
          {added === 0 && removed === 0 ? (
            <p className="text-sm text-muted">{t("diffPage.identical")}</p>
          ) : (
            <pre className="overflow-x-auto rounded-lg border border-border bg-background text-sm">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`px-3 py-0.5 ${LINE_STYLE[line.type]}`}
                >
                  <span className="mr-2 select-none opacity-60">
                    {PREFIX[line.type]}
                  </span>
                  {line.text || " "}
                </div>
              ))}
            </pre>
          )}
        </ToolPanel>
      )}
    </ToolLayout>
  );
}
