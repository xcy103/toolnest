import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig, tools } from "@/lib/tools";
import { localeAlternates, openGraphFor, siteJsonLd } from "@/lib/metadata";
import ToolDirectory from "@/components/ToolDirectory";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  // `absolute` keeps the home title free of the "%s · ToolNest" template.
  return {
    title: { absolute: `${siteConfig.name} · ${t("tagline")}` },
    alternates: localeAlternates("", locale),
    openGraph: openGraphFor("", locale),
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  // Opt into static rendering.
  setRequestLocale(locale);

  const t = await getTranslations();
  const total = tools.length;
  const live = tools.filter((tool) => tool.available).length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <JsonLd data={await siteJsonLd(locale)} />

      {/* Hero */}
      <section className="py-14 text-center sm:py-20">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl shadow-lg shadow-emerald-500/20">
          🪺
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Tool<span className="text-emerald-500">Nest</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          {t("site.description")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <span>{t("home.badgeFree")}</span>
          <span>{t("home.badgeLocal")}</span>
          <span>{t("home.badgeNoSignup")}</span>
        </div>
        <p className="mt-6 text-sm text-muted">
          {live > 0
            ? t.rich("home.statsLive", {
                total,
                live,
                strong: (chunks) => (
                  <span className="font-semibold text-foreground">{chunks}</span>
                ),
                em: (chunks) => (
                  <span className="font-semibold text-emerald-500">{chunks}</span>
                ),
              })
            : t("home.statsNone")}
        </p>
      </section>

      {/* Search + category overview */}
      <section className="pb-16">
        <ToolDirectory />
      </section>
    </div>
  );
}
