"use client";

import { useMemo, useState } from "react";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Mode = "encode" | "decode";

/** UTF-8 safe text → Base64. */
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/** UTF-8 safe Base64 → text. Throws on invalid input. */
function decodeBase64(input: string): string {
  // Tolerate whitespace / line breaks that often appear in pasted Base64.
  const cleaned = input.replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result =
        mode === "encode" ? encodeBase64(input) : decodeBase64(input);
      return { output: result, error: "" };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? "输入不是有效的 Base64 字符串,请检查后重试。"
            : "编码失败,请检查输入内容。",
      };
    }
  }, [input, mode]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Feed the current output back as input to make encode↔decode round-trips easy.
    setMode(next);
    if (output) setInput(output);
  }

  return (
    <ToolLayout
      title="Base64 编解码"
      description="在文本与 Base64 之间互相转换,支持中文等 UTF-8 字符。所有计算在浏览器本地完成。"
      icon="🔤"
    >
      {/* Mode tabs */}
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

      {/* Input */}
      <ToolPanel
        label={mode === "encode" ? "原始文本" : "Base64"}
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
              ? "在此输入要编码的文本…"
              : "在此粘贴要解码的 Base64…"
          }
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Output */}
      <ToolPanel
        label="结果"
        action={<CopyButton value={output} />}
      >
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
