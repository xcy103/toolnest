import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/** Resolves the active locale per request and loads its message catalogue. */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // The [locale] segment acts as a catch-all, so fall back on unknown values.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
