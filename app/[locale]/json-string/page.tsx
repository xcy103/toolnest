"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import {
  escapeJsonString,
  JSON_STRING_LIMIT,
  JsonStringError,
  type JsonStringErrorKey,
  unescapeJsonString,
} from "@/lib/json-string";

type Mode = "escape" | "unescape";

const examples: Record<Mode, string> = {
  escape: 'Hello, "ToolNest"!\nPath:\tC:\\Tools\nUnicode: 中文 😀',
  unescape: '"Line 1\\nLine 2\\t\\"quoted\\"\\\\path 中文 😀"',
};

const textAreaClass =
  "w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500";

export default function JsonStringPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("escape");
  const [input, setInput] = useState("");
  const [hasInput, setHasInput] = useState(false);

  const processed = useMemo<{
    output: string;
    error: JsonStringErrorKey | null;
    valid: boolean;
  }>(() => {
    if (!hasInput) return { output: "", error: null, valid: false };
    try {
      return {
        output: mode === "escape" ? escapeJsonString(input) : unescapeJsonString(input),
        error: null,
        valid: true,
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof JsonStringError ? error.key : "syntax",
        valid: false,
      };
    }
  }, [hasInput, input, mode]);

  function updateInput(value: string) {
    setInput(value);
    setHasInput(true);
  }

  function changeMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    if (processed.valid) {
      setInput(processed.output);
      setHasInput(true);
    } else {
      setInput("");
      setHasInput(false);
    }
  }

  function clear() {
    setInput("");
    setHasInput(false);
  }

  return (
    <ToolLayout
      title={t("tools.json-string.name")}
      description={t("jsonStringPage.description")}
      icon={"\\n"}
    >
      <div
        className="inline-flex rounded-lg border border-border p-1"
        aria-label={t("jsonStringPage.mode")}
      >
        {(["escape", "unescape"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => changeMode(value)}
            aria-pressed={mode === value}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              mode === value
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {t(`jsonStringPage.modes.${value}`)}
          </button>
        ))}
      </div>

      <ToolPanel
        label={t(`jsonStringPage.input.${mode}`)}
        action={
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => updateInput(examples[mode])}
              className="text-muted transition hover:text-foreground"
            >
              {t("jsonStringPage.example")}
            </button>
            {hasInput && (
              <button
                type="button"
                onClick={clear}
                className="text-muted transition hover:text-foreground"
              >
                {t("common.clear")}
              </button>
            )}
          </div>
        }
      >
        <textarea
          value={input}
          onChange={(event) => updateInput(event.target.value)}
          rows={9}
          aria-label={t(`jsonStringPage.input.${mode}`)}
          placeholder={t(`jsonStringPage.placeholders.${mode}`)}
          spellCheck={false}
          className={textAreaClass}
        />
        <p className="mt-3 text-xs text-muted">{t(`jsonStringPage.hints.${mode}`)}</p>
      </ToolPanel>

      {processed.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
        >
          {t(`jsonStringPage.errors.${processed.error}`, { characters: JSON_STRING_LIMIT })}
        </p>
      )}

      <ToolPanel
        label={t(`jsonStringPage.output.${mode}`)}
        action={<CopyButton value={processed.output} allowEmpty={processed.valid} />}
      >
        <textarea
          value={processed.output}
          readOnly
          rows={9}
          aria-label={t(`jsonStringPage.output.${mode}`)}
          placeholder={t("common.resultPlaceholder")}
          className={textAreaClass}
        />
        <p className="mt-3 text-xs text-muted">{t("jsonStringPage.rule")}</p>
      </ToolPanel>
    </ToolLayout>
  );
}
