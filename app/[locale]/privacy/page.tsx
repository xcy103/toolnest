import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { sectionMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  return sectionMetadata({
    titleKey: "privacyPage.title",
    descriptionKey: "privacyPage.description",
    path: "/privacy",
    locale,
  });
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacyPage");

  // Every claim here is checked against what the site actually does.
  const sections = ["data", "storage", "hosting", "analytics", "changes"] as const;

  return (
    <ToolLayout title={t("title")} description={t("description")} icon="🔒">
      <ToolPanel>
        <p className="text-sm font-medium leading-relaxed text-foreground">
          {t("summary")}
        </p>
      </ToolPanel>

      {sections.map((key) => (
        <ToolPanel key={key} label={t(`sections.${key}.title`)}>
          <p className="text-sm leading-relaxed text-foreground/80">
            {t(`sections.${key}.body`)}
          </p>
        </ToolPanel>
      ))}

      <p className="text-sm text-muted">{t("updated")}</p>
    </ToolLayout>
  );
}
