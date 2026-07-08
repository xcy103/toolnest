"use client";

import { useMemo, useState } from "react";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Mode = "encode" | "decode";
type Scope = "component" | "uri";

/** Encode text for use in a URL. */
function encode(text: string, scope: Scope): string {
  // `component` escapes URL delimiters (/ ? & = # …) too — safe for query values.
  // `uri` preserves the overall URL structure — for encoding a whole address.
  return scope === "component" ? encodeURIComponent(text) : encodeURI(text);
}

/** Decode a percent-encoded URL string. Throws on malformed input. */
function decode(text: string, scope: Scope): string {
  const cleaned = text.trim();
  return scope === "component"
    ? decodeURIComponent(cleaned)
    : decodeURI(cleaned);
}

export default function UrlPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result =
        mode === "encode" ? encode(input, scope) : decode(input, scope);
      return { output: result, error: "" };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? "输入包含无效的百分号转义(如 % 后不是两位十六进制),请检查后重试。"
            : "编码失败,请检查输入内容。",
      };
    }
  }, [input, mode, scope]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Feed the current output back as input to make encode↔decode round-trips easy.
    setMode(next);
    if (output) setInput(output);
  }

  return (
    <ToolLayout
      title="URL 编解码"
      description="对 URL 及查询参数进行百分号编码与解码,支持中文等 UTF-8 字符。所有计算在浏览器本地完成。"
      icon="🔗"
    >
      {/* Mode tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["encode", "编码"],
              ["decode", "解码"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
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

        {/* Scope selector */}
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["component", "组件 / 参数值"],
              ["uri", "整段 URL"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                scope === value
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted">
        {scope === "component"
          ? "「组件 / 参数值」会转义 / ? & = # 等分隔符,适合编码单个查询参数或路径片段。"
          : "「整段 URL」会保留 URL 结构字符,适合编码包含中文或空格的完整网址。"}
      </p>

      {/* Input */}
      <ToolPanel
        label={mode === "encode" ? "原始文本" : "编码后的 URL"}
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
          rows={5}
          placeholder={
            mode === "encode"
              ? "在此输入要编码的文本或网址…"
              : "在此粘贴要解码的 URL…"
          }
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
            rows={5}
            placeholder="结果会显示在这里…"
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
          />
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
