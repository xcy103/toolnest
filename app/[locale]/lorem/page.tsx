"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Unit = "paragraphs" | "sentences" | "words";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

const LEAD = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
const rand = (n: number) => Math.floor(Math.random() * n);
const word = () => WORDS[rand(WORDS.length)];

function makeSentence(): string {
  const n = 6 + rand(9);
  const words = Array.from({ length: n }, word);
  // A comma somewhere in the middle for rhythm.
  if (n > 8) words[Math.floor(n / 2)] += ",";
  const s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function makeParagraph(): string {
  const n = 3 + rand(4);
  return Array.from({ length: n }, makeSentence).join(" ");
}

function generate(unit: Unit, amount: number, startWith: boolean): string {
  let text: string;
  if (unit === "words") {
    text = Array.from({ length: amount }, word).join(" ");
    text = text.charAt(0).toUpperCase() + text.slice(1) + ".";
  } else if (unit === "sentences") {
    text = Array.from({ length: amount }, makeSentence).join(" ");
  } else {
    text = Array.from({ length: amount }, makeParagraph).join("\n\n");
  }
  if (startWith) {
    // Ensure the classic opening. Replace up to the first sentence's period.
    const rest = text.replace(/^[^.]*\.\s*/, "");
    text = `${LEAD}. ${rest}`;
  }
  return text;
}

export default function LoremPage() {
  const t = useTranslations();
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [amount, setAmount] = useState(3);
  const [startWith, setStartWith] = useState(true);
  const [output, setOutput] = useState("");

  // Random text must be generated client-side, or SSR and hydration disagree.
  useEffect(() => {
    function run() {
      setOutput(generate(unit, Math.max(1, amount), startWith));
    }
    run();
  }, [unit, amount, startWith]);

  return (
    <ToolLayout
      title={t("tools.lorem.name")}
      description={t("loremPage.description")}
      icon="📄"
    >
      {/* Controls */}
      <ToolPanel>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
              {t("loremPage.amountLabel")}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={amount}
              onChange={(e) =>
                setAmount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
              }
              className="w-24 rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="inline-flex rounded-lg border border-border p-1">
            {(
              [
                ["paragraphs", t("loremPage.unitParagraphs")],
                ["sentences", t("loremPage.unitSentences")],
                ["words", t("loremPage.unitWords")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setUnit(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  unit === value
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-foreground/70 hover:bg-foreground/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={startWith}
              onChange={() => setStartWith((v) => !v)}
              className="h-4 w-4 accent-emerald-500"
            />
            {t("loremPage.startWith")}
          </label>
        </div>
      </ToolPanel>

      {/* Output */}
      <ToolPanel
        label={t("loremPage.outputLabel")}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setOutput(generate(unit, Math.max(1, amount), startWith))
              }
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              🔄 {t("loremPage.regenerate")}
            </button>
            <CopyButton value={output} />
          </div>
        }
      >
        <textarea
          value={output}
          readOnly
          rows={12}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm leading-relaxed text-foreground/90 outline-none"
        />
      </ToolPanel>
    </ToolLayout>
  );
}
