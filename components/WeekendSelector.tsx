"use client";

import { useTranslations } from "next-intl";

const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function WeekendSelector({
  value,
  onChange,
}: {
  value: number[];
  onChange: (value: number[]) => void;
}) {
  const t = useTranslations("businessDaysCommon");

  function toggle(day: number) {
    if (value.includes(day)) {
      onChange(value.filter((item) => item !== day));
    } else if (value.length < 6) {
      onChange([...value, day].sort((a, b) => a - b));
    }
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{t("weekendLabel")}</legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {weekdayKeys.map((key, day) => {
          const selected = value.includes(day);
          return (
            <button
              key={key}
              type="button"
              aria-label={t(`days.${key}.long`)}
              aria-pressed={selected}
              onClick={() => toggle(day)}
              className={`min-h-10 rounded-lg border px-2 text-sm font-medium transition ${
                selected
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-border hover:bg-foreground/5"
              }`}
            >
              {t(`days.${key}.short`)}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">{t("weekendHint")}</p>
    </fieldset>
  );
}
