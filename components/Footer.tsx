import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/about" className="transition hover:text-foreground">
            {t("footer.about")}
          </Link>
          <Link href="/privacy" className="transition hover:text-foreground">
            {t("footer.privacy")}
          </Link>
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
