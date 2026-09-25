"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { drawPickerEntries, MAX_DRAW_COUNT, parsePickerEntries } from "@/lib/random-picker";

const EXAMPLE = "Ada\nGrace\nLin\nMargaret\nAda";

export default function RandomPickerPage() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [withoutReplacement, setWithoutReplacement] = useState(true);
  const [countText, setCountText] = useState("1");
  const [selection, setSelection] = useState<string[]>([]);
  const [drawNumber, setDrawNumber] = useState(0);

  const { inputCount, pool } = useMemo(
    () => parsePickerEntries(input, removeDuplicates),
    [input, removeDuplicates],
  );
  const count = Number(countText);
  const validCount = countText.trim() !== "" && Number.isInteger(count) && count >= 1 && count <= MAX_DRAW_COUNT;
  const tooMany = validCount && withoutReplacement && count > pool.length;
  const canDraw = pool.length > 0 && validCount && !tooMany;

  function clearResult() {
    setSelection([]);
    setDrawNumber(0);
  }

  function draw() {
    if (!canDraw) return;
    setSelection(drawPickerEntries(pool, count, withoutReplacement));
    setDrawNumber((previous) => previous + 1);
  }

  return (
    <ToolLayout title={t("tools.random-picker.name")} description={t("randomPickerPage.description")} icon="🎲">
      <ToolPanel label={t("randomPickerPage.entries")} action={<div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={() => { setInput(EXAMPLE); clearResult(); }} className="text-muted hover:text-foreground">{t("randomPickerPage.example")}</button>
        {input && <button type="button" onClick={() => { setInput(""); clearResult(); }} className="text-muted hover:text-foreground">{t("common.clear")}</button>}
      </div>}>
        <textarea value={input} onChange={(event) => { setInput(event.target.value); clearResult(); }} rows={9} spellCheck={false} aria-label={t("randomPickerPage.entries")} placeholder={t("randomPickerPage.placeholder")} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm outline-none focus:border-emerald-500" />
        <p className="mt-2 text-sm text-muted">{t("randomPickerPage.summary", { input: inputCount, eligible: pool.length })}</p>
      </ToolPanel>

      <ToolPanel>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-sm">
          <label className="flex items-center gap-2">{t("randomPickerPage.count")}
            <input type="number" min={1} max={MAX_DRAW_COUNT} step={1} value={countText} onChange={(event) => { setCountText(event.target.value); clearResult(); }} className="w-20 rounded-lg border border-border bg-background p-2 text-foreground outline-none focus:border-emerald-500" />
          </label>
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={removeDuplicates} onChange={(event) => { setRemoveDuplicates(event.target.checked); clearResult(); }} className="h-4 w-4 accent-emerald-500" />{t("randomPickerPage.removeDuplicates")}</label>
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={withoutReplacement} onChange={(event) => { setWithoutReplacement(event.target.checked); clearResult(); }} className="h-4 w-4 accent-emerald-500" />{t("randomPickerPage.withoutReplacement")}</label>
        </div>
        {!validCount && <p role="status" className="mt-3 text-sm text-red-600 dark:text-red-400">{t("randomPickerPage.invalidCount", { max: MAX_DRAW_COUNT })}</p>}
        {tooMany && pool.length > 0 && <p role="status" className="mt-3 text-sm text-red-600 dark:text-red-400">{t("randomPickerPage.tooMany", { max: pool.length })}</p>}
        <button type="button" onClick={draw} disabled={!canDraw} className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          {drawNumber ? t("randomPickerPage.drawAgain") : t("randomPickerPage.draw")}
        </button>
      </ToolPanel>

      {drawNumber > 0 && <ToolPanel label={t("randomPickerPage.drawNumber", { number: drawNumber })} action={<CopyButton value={selection.join("\n")} />}>
        <ol className="divide-y divide-border" aria-live="polite">
          {selection.map((entry, index) => <li key={index} className="flex gap-3 py-2 text-sm"><span className="w-7 shrink-0 text-right font-mono text-muted">{index + 1}.</span><span className="min-w-0 break-words">{entry}</span></li>)}
        </ol>
      </ToolPanel>}
      <p className="text-sm text-muted">{t("randomPickerPage.rule")}</p>
    </ToolLayout>
  );
}
