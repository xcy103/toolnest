import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getTool, siteConfig } from "@/lib/tools";

/**
 * kebab-case slug → the page's messages namespace, e.g.
 * "word-counter" → "wordCounterPage".
 */
export function pageNamespace(slug: string): string {
  return `${slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}Page`;
}

/**
 * Canonical URL plus hreflang alternates for a locale-less path ("" = home).
 * Paths are relative — Next resolves them against `metadataBase`.
 */
export function localeAlternates(path: string, locale: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

/** Locale codes as used by Open Graph (`en_US` style). */
const ogLocales: Record<string, string> = { en: "en_US", zh: "zh_CN" };

/**
 * Open Graph block for a page. Next replaces (not merges) the parent's
 * `openGraph`, so every page that sets one has to restate the shared fields.
 */
export function openGraphFor(path: string, locale: string) {
  return {
    type: "website" as const,
    siteName: siteConfig.name,
    url: `/${locale}${path}`,
    locale: ogLocales[locale] ?? locale,
  };
}

/** Shared Open Graph / canonical block for any page. */
function pageMeta(
  { title, description, path, locale }:
  { title: string; description: string; path: string; locale: string },
): Metadata {
  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: {
      ...openGraphFor(path, locale),
      title: `${title} · ${siteConfig.name}`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${title} · ${siteConfig.name}`,
      description,
    },
  };
}

/**
 * Title / description / canonical / Open Graph for a tool page. The title is the
 * tool's registry name; the description is the page's own longer blurb, which
 * reads better as a search result snippet than the short card text.
 */
export async function toolMetadata(slug: string, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return pageMeta({
    title: t(`tools.${slug}.name`),
    description: t(`${pageNamespace(slug)}.description`),
    path: getTool(slug)?.href ?? `/${slug}`,
    locale,
  });
}

/** Same, for the non-tool pages (home, /tools, category pages). */
export async function sectionMetadata(
  { titleKey, descriptionKey, path, locale }:
  { titleKey: string; descriptionKey: string; path: string; locale: string },
): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return pageMeta({
    title: t(titleKey),
    description: t(descriptionKey),
    path,
    locale,
  });
}

/** Absolute URL for a locale-less path. */
export function absoluteUrl(path: string, locale: string): string {
  return `${siteConfig.url}/${locale}${path}`;
}

/** schema.org `SoftwareApplication` describing one browser-based tool. */
export async function toolJsonLd(slug: string, locale: string) {
  const t = await getTranslations({ locale });
  const href = getTool(slug)?.href ?? `/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t(`tools.${slug}.name`),
    description: t(`${pageNamespace(slug)}.description`),
    url: absoluteUrl(href, locale),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    inLanguage: locale,
    isAccessibleForFree: true,
    // Free, and it runs client-side — no purchase, no account.
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}

/** schema.org `WebSite` for the home page. */
export async function siteJsonLd(locale: string) {
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: `${siteConfig.name} — ${t("tagline")}`,
    description: t("description"),
    url: absoluteUrl("", locale),
    inLanguage: locale,
  };
}
