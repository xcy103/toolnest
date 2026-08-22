import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { categories, siteConfig, tools } from "@/lib/tools";
import { sectionMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  return sectionMetadata({
    titleKey: "aboutPage.metaTitle",
    descriptionKey: "aboutPage.description",
    path: "/about",
    locale,
  });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");

  const principles = ["local", "free", "fast", "bilingual"] as const;

  return (
    <ToolLayout title={t("title")} description={t("description")} icon="🪺">
      <ToolPanel label={t("whatTitle")}>
        <p className="text-sm leading-relaxed text-foreground/80">
          {t("whatBody", { tools: tools.length, categories: categories.length })}
        </p>
      </ToolPanel>

      <ToolPanel label={t("principlesTitle")}>
        <ul className="space-y-3">
          {principles.map((key) => (
            <li key={key} className="text-sm leading-relaxed text-foreground/80">
              <span className="font-semibold text-foreground">
                {t(`principles.${key}.title`)}
              </span>
              {" — "}
              {t(`principles.${key}.body`)}
            </li>
          ))}
        </ul>
      </ToolPanel>

      <ToolPanel label={t("howTitle")}>
        <p className="text-sm leading-relaxed text-foreground/80">{t("howBody")}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {t("sourceBody")}{" "}
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            {siteConfig.githubUrl.replace("https://", "")}
          </a>
        </p>
      </ToolPanel>
    </ToolLayout>
  );
}
