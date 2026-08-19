import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories, toolsInCategory } from "@/lib/tools";
import { localeAlternates, openGraphFor } from "@/lib/metadata";
import ToolCard from "@/components/ToolCard";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("nav.allTools"),
    description: t("site.description"),
    alternates: localeAlternates("/tools", locale),
    openGraph: openGraphFor("/tools", locale),
  };
}

export default async function ToolsPage({
  params,
}: PageProps<"/[locale]/tools">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("nav.allTools")}
        </h1>
      </header>

      {categories.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            <a
              id={category}
              href={`#${category}`}
              className="transition hover:text-foreground"
            >
              {t(`categories.${category}`)}
            </a>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsInCategory(category).map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
