"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, tools, toolsInCategory } from "@/lib/tools";
import ToolCard from "./ToolCard";

/**
 * The home-page tool directory: a search box that filters every tool by its
 * localized name/description, falling back to a category overview when the
 * query is empty. Client-side so search is instant and needs no backend.
 */
export default function ToolDirectory() {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return tools.filter((tool) => {
      const name = t(`tools.${tool.slug}.name`).toLowerCase();
      const desc = t(`tools.${tool.slug}.description`).toLowerCase();
      return name.includes(q) || desc.includes(q) || tool.slug.includes(q);
    });
  }, [q, t]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("home.searchPlaceholder")}
          aria-label={t("home.searchPlaceholder")}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {results === null ? (
        /* Category overview */
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("home.browseByCategory")}
            </h2>
            <Link
              href="/tools"
              className="text-sm text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
            >
              {t("home.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const list = toolsInCategory(category);
              return (
                <Link
                  key={category}
                  href={`/c/${category}`}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div className="flex gap-1.5 text-xl">
                    {list.slice(0, 4).map((tool) => (
                      <span key={tool.slug} aria-hidden className="font-mono">
                        {tool.icon}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {t(`categories.${category}`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {t("categoryPage.count", { n: list.length })}
                  </p>
                </Link>
              );
            })}
          </div>
        </>
      ) : results.length === 0 ? (
        <p className="py-8 text-center text-muted">
          {t("home.noResults", { query: query.trim() })}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
