"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/tools";

/**
 * Navbar dropdown listing the tool categories (plus an "all tools" link back to
 * the home directory). Closes on outside click or Escape.
 */
export default function CategoryMenu() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const itemClass =
    "block rounded-md px-3 py-2 text-sm text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
      >
        {t("nav.categories")}
        <span
          aria-hidden
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-48 rounded-xl border border-border bg-background p-1 shadow-lg sm:left-auto sm:right-0"
        >
          <Link
            href="/tools"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`${itemClass} font-medium`}
          >
            {t("nav.allTools")}
          </Link>
          <div className="my-1 border-t border-border" />
          {categories.map((category) => (
            <Link
              key={category}
              href={`/c/${category}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {t(`categories.${category}`)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
