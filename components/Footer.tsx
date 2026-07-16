import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/tools";

export default function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          © {year}{" "}
          <span className="font-medium text-foreground">{siteConfig.name}</span>{" "}
          · {t("site.tagline")}
        </p>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-foreground"
          >
            GitHub
          </a>
          <span className="text-border">|</span>
          <span>{t("footer.note")}</span>
        </div>
      </div>
    </footer>
  );
}
