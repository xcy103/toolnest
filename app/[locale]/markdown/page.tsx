"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { renderMarkdown } from "@/lib/markdown";

const SAMPLE = `# Markdown Preview

A **live** preview with *italics*, \`inline code\` and [links](https://example.com).

- Lists
- work too

1. And ordered
2. lists

> Blockquotes as well.

\`\`\`
code blocks
\`\`\`
`;

// Tailwind's reset strips heading/list styling, so restore it for the preview.
const PREVIEW_CSS = `
.md-preview h1{font-size:1.6em;font-weight:700;margin:.6em 0 .4em}
.md-preview h2{font-size:1.35em;font-weight:700;margin:.6em 0 .4em}
.md-preview h3{font-size:1.15em;font-weight:600;margin:.6em 0 .3em}
.md-preview p{margin:.5em 0;line-height:1.6}
.md-preview ul{list-style:disc;padding-left:1.4em;margin:.5em 0}
.md-preview ol{list-style:decimal;padding-left:1.4em;margin:.5em 0}
.md-preview li{margin:.2em 0}
.md-preview a{color:#10b981;text-decoration:underline}
.md-preview code{background:rgba(127,127,127,.15);padding:.1em .35em;border-radius:.25em;font-family:monospace;font-size:.9em}
.md-preview pre{background:rgba(127,127,127,.12);padding:.75em;border-radius:.5em;overflow-x:auto;margin:.5em 0}
.md-preview pre code{background:none;padding:0}
.md-preview blockquote{border-left:3px solid rgba(127,127,127,.4);padding-left:.8em;margin:.5em 0;color:inherit;opacity:.85}
.md-preview hr{border:0;border-top:1px solid rgba(127,127,127,.3);margin:1em 0}
`;

export default function MarkdownPage() {
  const t = useTranslations();
  const [md, setMd] = useState(SAMPLE);
  const html = useMemo(() => renderMarkdown(md), [md]);

  return (
    <ToolLayout
      title={t("tools.markdown.name")}
      description={t("markdownPage.description")}
      icon="📖"
    >
      <style>{PREVIEW_CSS}</style>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel label={t("markdownPage.inputLabel")}>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            rows={18}
            placeholder={t("markdownPage.placeholder")}
            spellCheck={false}
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
          />
        </ToolPanel>
        <ToolPanel label={t("markdownPage.previewLabel")}>
          <div
            className="md-preview min-h-[27rem] rounded-lg border border-border bg-background p-4 text-sm text-foreground/90"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </ToolPanel>
      </div>
    </ToolLayout>
  );
}
