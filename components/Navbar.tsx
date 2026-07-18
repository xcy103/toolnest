import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/tools";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
            🪺
          </span>
          <span className="text-lg tracking-tight">
            Tool<span className="text-emerald-500">Nest</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
          >
            {t("allTools")}
          </Link>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground sm:inline-block"
          >
            GitHub
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
