import { getTranslations, setRequestLocale } from "next-intl/server";
import { tools, type CategoryKey } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  // Opt into static rendering.
  setRequestLocale(locale);

  const t = await getTranslations();
  const total = tools.length;
  const live = tools.filter((tool) => tool.available).length;

  // Group tools by category, preserving the order they appear in the registry.
  const categories: CategoryKey[] = [];
  for (const tool of tools) {
    if (!categories.includes(tool.categoryKey)) categories.push(tool.categoryKey);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
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

      {/* Tool directory, grouped by category */}
      <section className="pb-16">
        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {t(`categories.${category}`)}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools
                .filter((tool) => tool.categoryKey === category)
                .map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
