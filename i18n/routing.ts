import { defineRouting } from "next-intl/routing";

/**
 * Locale routing for ToolNest.
 *
 * English is the default so that `/` lands on the international version, while
 * every locale keeps an explicit prefix (`/en/...`, `/zh/...`) — each language
 * gets its own indexable URL.
 */
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
