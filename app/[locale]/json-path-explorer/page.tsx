"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { collectContainerPointers, findJsonNode, JSON_PATH_LIMITS, JsonPathError, type JsonTreeNode, nodePreview, nodeValueText, parseJsonTree, searchJsonTree } from "@/lib/json-path";

const example = `{
  "project": "ToolNest",
  "owner": { "name": "Ada", "active": true },
  "tools": [
    { "name": "URL Parser", "category": "Developer" },
    { "name": "JSON Explorer", "category": "Developer" }
  ],
  "settings": { "theme/mode": "system", "empty": {} }
}`;

function TreeNode({ node, query, visible, expanded, selected, onToggle, onSelect }: {
  node: JsonTreeNode;
  query: string;
  visible: Set<string>;
  expanded: Set<string>;
  selected: string;
  onToggle: (pointer: string) => void;
  onSelect: (pointer: string) => void;
}) {
  if (query && !visible.has(node.pointer)) return null;
  const container = node.children.length > 0;
  const open = query ? true : expanded.has(node.pointer);
  const buttonClass = `flex min-w-0 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-foreground/5 ${selected === node.pointer ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : ""}`;
  return (
    <li role="treeitem" aria-expanded={container ? open : undefined} aria-selected={selected === node.pointer}>
      <button type="button" onClick={() => { onSelect(node.pointer); if (container && !query) onToggle(node.pointer); }} className={buttonClass}>
        <span aria-hidden className="w-4 shrink-0 text-center text-muted">{container ? (open ? "▾" : "▸") : "·"}</span>
        <span className="min-w-0 break-all font-mono font-medium">{node.label || '""'}</span>
        <span className="min-w-0 truncate font-mono text-xs text-muted">{nodePreview(node)}</span>
      </button>
      {container && open && <ul role="group" className="ml-4 border-l border-border pl-2">
        {node.children.map((child) => <TreeNode key={child.pointer} node={child} query={query} visible={visible} expanded={expanded} selected={selected} onToggle={onToggle} onSelect={onSelect} />)}
      </ul>}
    </li>
  );
}

export default function JsonPathExplorerPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set([""]));
  const [selected, setSelected] = useState("");
  const parsed = useMemo(() => {
    if (!input.trim()) return { tree: null, count: 0, error: null };
    try {
      const result = parseJsonTree(input);
      return { tree: result.root, count: result.count, error: null };
    } catch (error) {
      return { tree: null, count: 0, error: error instanceof JsonPathError ? error.key : "syntax" };
    }
  }, [input]);
  const search = useMemo(() => parsed.tree ? searchJsonTree(parsed.tree, query) : { visible: new Set<string>(), matches: 0 }, [parsed.tree, query]);
  const selectedNode = parsed.tree ? findJsonNode(parsed.tree, selected) ?? parsed.tree : null;

  function loadExample() {
    setInput(example);
    setQuery("");
    setExpanded(new Set([""]));
    setSelected("");
  }

  function toggle(pointer: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(pointer)) next.delete(pointer); else next.add(pointer);
      return next;
    });
  }

  return (
    <ToolLayout title={t("tools.json-path-explorer.name")} description={t("jsonPathExplorerPage.description")} icon="⌘">
      <ToolPanel label={t("jsonPathExplorerPage.input")} action={<div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={loadExample} className="text-muted hover:text-foreground">{t("jsonPathExplorerPage.example")}</button>
        {input && <button type="button" onClick={() => { setInput(""); setQuery(""); setExpanded(new Set([""])); setSelected(""); }} className="text-muted hover:text-foreground">{t("common.clear")}</button>}
      </div>}>
        <textarea value={input} onChange={(event) => { setInput(event.target.value); setSelected(""); }} rows={9} aria-label={t("jsonPathExplorerPage.input")} placeholder={t("jsonPathExplorerPage.placeholder")} spellCheck={false} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
      </ToolPanel>

      {parsed.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{t(`jsonPathExplorerPage.errors.${parsed.error}`, JSON_PATH_LIMITS)}</p>}

      {parsed.tree && <>
        <ToolPanel label={t("jsonPathExplorerPage.tree")} action={<span className="text-sm text-muted">{t("jsonPathExplorerPage.nodeCount", { count: parsed.count })}</span>}>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <label className="min-w-52 flex-1 space-y-1 text-sm"><span className="text-muted">{t("jsonPathExplorerPage.search")}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("jsonPathExplorerPage.searchPlaceholder")} className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-emerald-500" /></label>
            <button type="button" onClick={() => setExpanded(collectContainerPointers(parsed.tree!))} className="rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-foreground/5">{t("jsonPathExplorerPage.expandAll")}</button>
            <button type="button" onClick={() => setExpanded(new Set())} className="rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-foreground/5">{t("jsonPathExplorerPage.collapseAll")}</button>
          </div>
          {query.trim() && <p role="status" className="mb-2 text-xs text-muted">{t("jsonPathExplorerPage.matchCount", { count: search.matches })}</p>}
          {query.trim() && search.matches === 0 ? <p className="py-8 text-center text-sm text-muted">{t("jsonPathExplorerPage.noMatches")}</p> : <div className="max-h-[32rem] overflow-auto rounded-lg border border-border p-2">
            <ul role="tree" aria-label={t("jsonPathExplorerPage.tree")}><TreeNode node={parsed.tree} query={query.trim()} visible={search.visible} expanded={expanded} selected={selectedNode?.pointer ?? ""} onToggle={toggle} onSelect={setSelected} /></ul>
          </div>}
        </ToolPanel>

        {selectedNode && <ToolPanel label={t("jsonPathExplorerPage.selected")}>
          <div className="space-y-4">
            <div><div className="mb-1 text-xs text-muted">{t("jsonPathExplorerPage.pointer")}</div><div className="flex min-w-0 items-start justify-between gap-3"><code className="min-w-0 break-all rounded bg-foreground/5 px-2 py-1 text-sm">{selectedNode.pointer || '""'}</code><CopyButton value={selectedNode.pointer} allowEmpty className="shrink-0" /></div></div>
            <div><div className="mb-1 text-xs text-muted">{t("jsonPathExplorerPage.type")}</div><p className="text-sm">{t(`jsonPathExplorerPage.types.${selectedNode.type}`)}</p></div>
            <div><div className="mb-1 text-xs text-muted">{t("jsonPathExplorerPage.value")}</div><div className="mb-2 flex justify-end"><CopyButton value={nodeValueText(selectedNode)} /></div><textarea value={nodeValueText(selectedNode)} readOnly rows={8} aria-label={t("jsonPathExplorerPage.value")} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none" /></div>
          </div>
        </ToolPanel>}
      </>}
    </ToolLayout>
  );
}
