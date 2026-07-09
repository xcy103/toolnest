"use client";

import { useMemo, useState } from "react";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Mode = "format" | "minify";
type Indent = 2 | 4;

type Result =
  | { ok: true; output: string }
  | { ok: false; error: string };

/** Parse then re-serialize JSON, either pretty-printed or minified. */
function process(input: string, mode: Mode, indent: Indent): Result {
  const parsed = JSON.parse(input);
  const output =
    mode === "format"
      ? JSON.stringify(parsed, null, indent)
      : JSON.stringify(parsed);
  return { ok: true, output };
}

/** Turn a JSON.parse SyntaxError into a friendlier, position-aware message. */
function describeError(input: string, err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  // V8 includes "at position N" — translate it into a line/column hint.
  const match = /position (\d+)/.exec(message);
  if (match) {
    const pos = Number(match[1]);
    const before = input.slice(0, pos);
    const line = before.split("\n").length;
    const column = pos - before.lastIndexOf("\n");
    return `JSON 语法错误(第 ${line} 行,第 ${column} 列附近),请检查后重试。`;
  }
  return "JSON 语法错误,请检查输入内容。";
}

export default function JsonPage() {
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<Indent>(2);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result = process(input, mode, indent);
      return result.ok
        ? { output: result.output, error: "" }
        : { output: "", error: result.error };
    } catch (err) {
      return { output: "", error: describeError(input, err) };
    }
  }, [input, mode, indent]);

  return (
    <ToolLayout
      title="JSON 工具"
      description="对 JSON 进行格式化、压缩与语法校验,一键美化或最小化。所有计算在浏览器本地完成。"
      icon="{ }"
    >
      {/* Mode + indent controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["format", "格式化"],
              ["minify", "压缩"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                mode === value
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Indent selector — only meaningful when formatting */}
        {mode === "format" && (
          <div className="inline-flex rounded-lg border border-border p-1">
            {([2, 4] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setIndent(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  indent === value
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                {value} 空格
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ToolPanel
        label="JSON 输入"
        action={
          input ? (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-sm text-muted transition hover:text-foreground"
            >
              清空
            </button>
          ) : null
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder='在此粘贴 JSON,例如 {"name":"ToolNest","tags":[1,2,3]}'
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Output */}
      <ToolPanel label="结果" action={<CopyButton value={output} />}>
        {error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        ) : (
          <textarea
            value={output}
            readOnly
            rows={8}
            placeholder="结果会显示在这里…"
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
          />
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
