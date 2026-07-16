import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

type Props = {
  /** Tool title, already translated by the caller. */
  title: string;
  /** Short one-line description shown under the title. */
  description: string;
  /** Emoji / glyph icon. */
  icon?: string;
  children: ReactNode;
};

/** Shared page scaffold for every tool: breadcrumb, header, and content area. */
export default function ToolLayout({ title, description, icon, children }: Props) {
  const t = useTranslations("toolLayout");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="transition hover:text-foreground">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h1>
        <p className="mt-2 text-muted">{description}</p>
      </header>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

/** A titled section card used inside tool pages (input / output blocks). */
export function ToolPanel({
  label,
  action,
  children,
}: {
  label?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      {(label || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {label && (
            <h2 className="text-sm font-semibold text-foreground/80">{label}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
