"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { jsonToYaml, JsonYamlError, yamlToJson } from "@/lib/json-yaml";

type Mode = "jsonToYaml" | "yamlToJson";
type Indent = 2 | 4;

const JSON_EXAMPLE = `{
  "name": "ToolNest",
  "tools": 32,
  "tags": ["json", "yaml"],
  "local": true
}`;

const YAML_EXAMPLE = `name: ToolNest
tools: 32
tags:
  - json
  - yaml
local: true`;

export default function JsonYamlPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("jsonToYaml");
  const [indent, setIndent] = useState<Indent>(2);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result =
        mode === "jsonToYaml"
          ? jsonToYaml(input, indent)
          : yamlToJson(input, indent);
      return { output: result, error: "" };
    } catch (err) {
      const key = err instanceof JsonYamlError ? err.key : "unsupported";
      const values = err instanceof JsonYamlError ? err.values : {};
      return { output: "", error: t(`jsonYamlPage.errors.${key}`, values) };
    }
  }, [indent, input, mode, t]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    if (output) setInput(output);
  }

  function loadExample() {
    setInput(mode === "jsonToYaml" ? JSON_EXAMPLE : YAML_EXAMPLE);
  }

  return (
    <ToolLayout
      title={t("tools.json-yaml.name")}
      description={t("jsonYamlPage.description")}
      icon="⇄"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["jsonToYaml", t("jsonYamlPage.jsonToYaml")],
              ["yamlToJson", t("jsonYamlPage.yamlToJson")],
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
              {t("jsonYamlPage.indent", { n: value })}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted">{t("jsonYamlPage.scopeNote")}</p>

      <ToolPanel
        label={
          mode === "jsonToYaml"
            ? t("jsonYamlPage.inputJson")
            : t("jsonYamlPage.inputYaml")
        }
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadExample}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("jsonYamlPage.loadExample")}
            </button>
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-sm text-muted transition hover:text-foreground"
              >
                {t("common.clear")}
              </button>
            )}
          </div>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          placeholder={
            mode === "jsonToYaml"
              ? t("jsonYamlPage.placeholderJson")
              : t("jsonYamlPage.placeholderYaml")
          }
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      <ToolPanel
        label={
          mode === "jsonToYaml"
            ? t("jsonYamlPage.outputYaml")
            : t("jsonYamlPage.outputJson")
        }
        action={<CopyButton value={output} />}
      >
        {error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <textarea
            value={output}
            readOnly
            rows={10}
            placeholder={t("common.resultPlaceholder")}
            className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
          />
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
