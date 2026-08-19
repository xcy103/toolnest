"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { ConvertError, csvToJson, jsonToCsv, type Delimiter } from "@/lib/csv";

type Mode = "jsonToCsv" | "csvToJson";

const DELIMITERS: { value: Delimiter; labelKey: string }[] = [
  { value: ",", labelKey: "delimiterComma" },
  { value: ";", labelKey: "delimiterSemicolon" },
  { value: "\t", labelKey: "delimiterTab" },
];

const JSON_EXAMPLE = `[
  { "name": "Ada", "role": "engineer" },
  { "name": "Bob", "role": "designer" }
]`;

const CSV_EXAMPLE = `name,role
Ada,engineer
Bob,designer`;

export default function JsonCsvPage() {
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("jsonToCsv");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [header, setHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const result =
        mode === "jsonToCsv"
          ? jsonToCsv(input, delimiter)
          : JSON.stringify(
              csvToJson(input, { delimiter, header, inferTypes }),
              null,
              2,
            );
      return { output: result, error: "" };
    } catch (err) {
      // The library reports an identifier; the wording lives in the messages.
      const key = err instanceof ConvertError ? err.key : "unknown";
      const values = err instanceof ConvertError ? err.values : {};
      return { output: "", error: t(`jsonCsvPage.errors.${key}`, values) };
    }
  }, [input, mode, delimiter, header, inferTypes, t]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // Feed the result back in, so a conversion can be checked by reversing it.
    if (output) setInput(output);
  }

  const rowCount = useMemo(() => {
    if (!output || error) return 0;
    return mode === "jsonToCsv"
      ? Math.max(0, output.split("\n").length - 1)
      : (JSON.parse(output) as unknown[]).length;
  }, [output, error, mode]);

  return (
    <ToolLayout
      title={t("tools.json-csv.name")}
      description={t("jsonCsvPage.description")}
      icon="🧾"
    >
      {/* Direction + options */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              ["jsonToCsv", t("jsonCsvPage.jsonToCsv")],
              ["csvToJson", t("jsonCsvPage.csvToJson")],
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

        <label className="flex items-center gap-2 text-sm text-muted">
          {t("jsonCsvPage.delimiter")}
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className="rounded-lg border border-border bg-background p-2 text-sm text-foreground outline-none focus:border-emerald-500"
          >
            {DELIMITERS.map((d) => (
              <option key={d.value} value={d.value}>
                {t(`jsonCsvPage.${d.labelKey}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* CSV-side options only matter when reading CSV */}
      {mode === "csvToJson" && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={header}
              onChange={(e) => setHeader(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("jsonCsvPage.firstRowHeader")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inferTypes}
              onChange={(e) => setInferTypes(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("jsonCsvPage.inferTypes")}
          </label>
        </div>
      )}

      {/* Input */}
      <ToolPanel
        label={
          mode === "jsonToCsv"
            ? t("jsonCsvPage.inputJson")
            : t("jsonCsvPage.inputCsv")
        }
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setInput(mode === "jsonToCsv" ? JSON_EXAMPLE : CSV_EXAMPLE)
              }
              className="text-sm text-muted transition hover:text-foreground"
            >
              {t("jsonCsvPage.loadExample")}
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
          rows={9}
          placeholder={
            mode === "jsonToCsv"
              ? t("jsonCsvPage.placeholderJson")
              : t("jsonCsvPage.placeholderCsv")
          }
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
      </ToolPanel>

      {/* Output */}
      <ToolPanel
        label={
          mode === "jsonToCsv"
            ? t("jsonCsvPage.outputCsv")
            : t("jsonCsvPage.outputJson")
        }
        action={<CopyButton value={output} />}
      >
        {error ? (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        ) : (
          <>
            <textarea
              value={output}
              readOnly
              rows={9}
              placeholder={t("common.resultPlaceholder")}
              className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
            />
            {output && (
              <p className="mt-2 text-sm text-muted">
                {t("jsonCsvPage.rowCount", { n: rowCount })}
              </p>
            )}
          </>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
