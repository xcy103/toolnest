"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/CopyButton";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { calculateTip, MAX_PEOPLE, type TipField, type TipInput } from "@/lib/tip";

const INITIAL_INPUT: TipInput = { bill: "100", rate: "15", people: "2" };
const CURRENCIES = ["USD", "EUR", "GBP", "CNY", "CAD", "AUD"] as const;
const PRESETS = [0, 10, 15, 18, 20, 25];
const INPUT_CLASS = "w-full min-w-0 rounded-lg border border-border bg-background p-3 text-base tabular-nums outline-none focus:border-emerald-500";

export default function TipCalculatorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [input, setInput] = useState<TipInput>(INITIAL_INPUT);
  const [currency, setCurrency] = useState<string>("USD");
  const result = calculateTip(input);
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency", currency, currencyDisplay: "code",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  const money = (cents: number) => formatter.format(cents / 100);
  const splitLines = result.ok ? result.groups.map((group) => t("tipCalculatorPage.share", {
    count: group.people, amount: money(group.cents),
  })) : [];
  const summary = result.ok ? [
    `${t("tipCalculatorPage.bill")}: ${money(result.billCents)}`,
    `${t("tipCalculatorPage.tip")}: ${money(result.tipCents)}`,
    `${t("tipCalculatorPage.total")}: ${money(result.totalCents)}`,
    ...splitLines,
  ].join("\n") : "";

  function update(field: TipField, value: string) {
    setInput((previous) => ({ ...previous, [field]: value }));
  }

  function invalid(field: TipField) {
    return !result.ok && result.errors.includes(field) && input[field].trim() !== "";
  }

  return (
    <ToolLayout title={t("tools.tip-calculator.name")} description={t("tipCalculatorPage.description")} icon="%">
      <ToolPanel>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <label htmlFor="tip-bill" className="block text-sm font-medium">{t("tipCalculatorPage.bill")}</label>
            <input id="tip-bill" type="text" inputMode="decimal" value={input.bill}
              onChange={(event) => update("bill", event.target.value)} className={INPUT_CLASS}
              aria-invalid={invalid("bill")} aria-describedby={invalid("bill") ? "tip-bill-error" : undefined} />
            {invalid("bill") && <p id="tip-bill-error" className="text-sm text-red-600 dark:text-red-400">{t("tipCalculatorPage.errors.bill")}</p>}
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor="tip-currency" className="block text-sm font-medium">{t("tipCalculatorPage.currency")}</label>
            <select id="tip-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={INPUT_CLASS}>
              {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
            </select>
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor="tip-rate" className="block text-sm font-medium">{t("tipCalculatorPage.rate")}</label>
            <input id="tip-rate" type="text" inputMode="decimal" value={input.rate}
              onChange={(event) => update("rate", event.target.value)} className={INPUT_CLASS}
              aria-invalid={invalid("rate")} aria-describedby={invalid("rate") ? "tip-rate-error" : undefined} />
            {invalid("rate") && <p id="tip-rate-error" className="text-sm text-red-600 dark:text-red-400">{t("tipCalculatorPage.errors.rate")}</p>}
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor="tip-people" className="block text-sm font-medium">{t("tipCalculatorPage.people")}</label>
            <input id="tip-people" type="number" inputMode="numeric" min="1" max={MAX_PEOPLE} step="1" value={input.people}
              onChange={(event) => update("people", event.target.value)} className={INPUT_CLASS}
              aria-invalid={invalid("people")} aria-describedby={invalid("people") ? "tip-people-error" : undefined} />
            {invalid("people") && <p id="tip-people-error" className="text-sm text-red-600 dark:text-red-400">{t("tipCalculatorPage.errors.people")}</p>}
          </div>
        </div>
        <div role="group" aria-label={t("tipCalculatorPage.presets")} className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PRESETS.map((rate) => (
            <button type="button" key={rate} aria-pressed={input.rate.trim() !== "" && Number(input.rate) === rate}
              onClick={() => update("rate", String(rate))}
              className="rounded-md border border-border px-2 py-2 text-sm font-medium transition hover:bg-foreground/5 aria-pressed:border-emerald-500 aria-pressed:bg-emerald-500/10 aria-pressed:text-emerald-700 dark:aria-pressed:text-emerald-300">
              {rate}%
            </button>
          ))}
        </div>
      </ToolPanel>

      <section aria-label={t("common.result")} className="border-t border-border pt-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t("common.result")}</h2>
          <CopyButton value={summary} />
        </div>
        <div aria-live="polite" aria-atomic="true" className="min-h-64">
          {result.ok ? (
            <>
              <dl className="space-y-3">
                {([
                  ["bill", result.billCents], ["tip", result.tipCents], ["total", result.totalCents],
                ] as const).map(([key, cents]) => (
                  <div key={key} className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${key === "total" ? "border-t border-border pt-3 font-semibold" : "text-sm"}`}>
                    <dt>{t(`tipCalculatorPage.${key}`)}</dt>
                    <dd className="break-all tabular-nums">{money(cents)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="mb-2 text-sm text-muted">{t("tipCalculatorPage.split")}</h3>
                <ul className="space-y-2">
                  {splitLines.map((line, index) => <li key={index} className="break-words text-base font-semibold text-emerald-700 dark:text-emerald-300">{line}</li>)}
                </ul>
              </div>
            </>
          ) : <p className="text-sm text-muted">{t("tipCalculatorPage.empty")}</p>}
        </div>
      </section>
    </ToolLayout>
  );
}
