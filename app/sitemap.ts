import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig, tools } from "@/lib/tools";

/**
 * Bilingual sitemap. Every page appears once (keyed by the default locale) with
 * `alternates.languages` listing each locale's URL, so search engines index the
 * English and Chinese variants as translations of one another.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  // Home plus every tool, as locale-less paths ("" is the home page).
  const paths = ["", ...tools.map((tool) => tool.href)];

  const url = (locale: string, path: string) => `${base}/${locale}${path}`;

  return paths.map((path) => ({
    url: url(routing.defaultLocale, path),
    lastModified: new Date(),
    alternates: {
      languages: {
        ...Object.fromEntries(
          routing.locales.map((locale) => [locale, url(locale, path)]),
        ),
        "x-default": url(routing.defaultLocale, path),
      },
    },
  }));
}
