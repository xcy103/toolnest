import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import { Link } from "@/i18n/navigation";
import { sectionMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/tools";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  return sectionMetadata({
    titleKey: "termsPage.title",
    descriptionKey: "termsPage.description",
    path: "/terms",
    locale,
  });
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("termsPage");
  const sections = [
    "acceptance",
    "service",
    "responsibility",
    "acceptableUse",
    "source",
    "availability",
    "liability",
    "thirdParty",
    "changes",
  ] as const;

  return (
    <ToolLayout title={t("title")} description={t("description")} icon="§">
      <ToolPanel>
        <p className="text-sm font-medium leading-relaxed text-foreground">{t("summary")}</p>
      </ToolPanel>

      {sections.map((key) => (
        <ToolPanel key={key} label={t(`sections.${key}.title`)}>
          <p className="text-sm leading-relaxed text-foreground/80">{t(`sections.${key}.body`)}</p>
        </ToolPanel>
      ))}

      <ToolPanel label={t("privacy.title")}>
        <p className="text-sm leading-relaxed text-foreground/80">
          {t("privacy.body")}{" "}
          <Link href="/privacy" className="font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400">
            {t("privacy.link")}
          </Link>
        </p>
      </ToolPanel>

      <ToolPanel label={t("contact.title")}>
        <p className="text-sm leading-relaxed text-foreground/80">
          {t("contact.body")}{" "}
          <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400">
            {t("contact.link")}
          </a>
        </p>
      </ToolPanel>

      <p className="text-sm text-muted">{t("updated")}</p>
    </ToolLayout>
  );
}
