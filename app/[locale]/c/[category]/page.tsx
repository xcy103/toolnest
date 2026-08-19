import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categories, isCategory, toolsInCategory } from "@/lib/tools";
import { localeAlternates, openGraphFor } from "@/lib/metadata";
import ToolCard from "@/components/ToolCard";

/** Pre-render every category, for every locale (locale comes from the parent). */
export function generateStaticParams() {
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/c/[category]">): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isCategory(category)) return {};
  const t = await getTranslations({ locale });
  const name = t(`categories.${category}`);
  return {
    title: name,
    description: t("categoryPage.metaDescription", {
      category: name,
      n: toolsInCategory(category).length,
    }),
    alternates: localeAlternates(`/c/${category}`, locale),
    openGraph: openGraphFor(`/c/${category}`, locale),
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[locale]/c/[category]">) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  if (!isCategory(category)) notFound();

  const t = await getTranslations();
  const list = toolsInCategory(category);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="transition hover:text-foreground">
          {t("toolLayout.home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t(`categories.${category}`)}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t(`categories.${category}`)}
        </h1>
        <p className="mt-2 text-muted">
          {t("categoryPage.count", { n: list.length })}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
