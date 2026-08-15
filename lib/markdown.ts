/**
 * A small, safe Markdown → HTML renderer for the preview tool.
 *
 * Safety model: HTML in the source is escaped *first*, so any raw `<script>` or
 * tags the user types become inert text. Markdown syntax is then applied to the
 * already-escaped text, and links are restricted to safe URL schemes. This keeps
 * the output usable with `dangerouslySetInnerHTML` without an XSS hole.
 *
 * Supported: headings, bold, italic, inline code, fenced code blocks, links,
 * unordered/ordered lists, blockquotes, horizontal rules, paragraphs.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  let out = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    // Only allow safe schemes; anything else (e.g. javascript:) stays literal text.
    return /^(https?:|mailto:|\/|#)/i.test(url)
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
      : m;
  });
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md).split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listBuf: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];

  const flushList = () => {
    if (listType) {
      html.push(`<${listType}>${listBuf.join("")}</${listType}>`);
      listType = null;
      listBuf = [];
    }
  };

  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCode) {
        html.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
        inCode = false;
        codeBuf = [];
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushList();
      const lvl = heading[1].length;
      html.push(`<h${lvl}>${inline(heading[2])}</h${lvl}>`);
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flushList();
      html.push("<hr>");
      continue;
    }

    // The blockquote marker `>` has already been escaped to `&gt;` above.
    if (/^&gt;\s?/.test(line)) {
      flushList();
      html.push(
        `<blockquote>${inline(line.replace(/^&gt;\s?/, ""))}</blockquote>`,
      );
      continue;
    }

    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    if (line.trim() === "") {
      flushList();
      continue;
    }

    flushList();
    html.push(`<p>${inline(line)}</p>`);
  }

  flushList();
  if (inCode) html.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
  return html.join("\n");
}
