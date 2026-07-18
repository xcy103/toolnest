"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Switches locale while staying on the current page — `/zh/calculator` → EN goes
 * to `/en/calculator`, not back to the home page. next-intl's `usePathname`
 * returns the locale-less path, and `router.replace(path, { locale })` re-renders
 * it under the chosen locale (and updates the locale cookie).
 */
export default function LanguageToggle() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const labels: Record<string, string> = {
    en: t("langEn"),
    zh: t("langZh"),
  };

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className="inline-flex rounded-lg border border-border p-0.5"
      role="group"
      aria-label={t("switchLanguage")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          disabled={isPending}
          aria-current={loc === locale}
          className={`rounded-md px-2 py-1 text-xs font-medium transition disabled:opacity-60 ${
            loc === locale
              ? "bg-foreground/10 text-foreground"
              : "text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
