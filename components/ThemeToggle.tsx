"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Toggles the `dark` class on <html> and persists the choice in localStorage.
 * The initial class is applied by an inline script in the root layout to avoid
 * a flash of the wrong theme before hydration.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore storage errors (e.g. private mode) */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg text-foreground/80 transition hover:bg-foreground/5"
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch. */}
      <span suppressHydrationWarning>
        {mounted ? (theme === "dark" ? "🌙" : "☀️") : "🌗"}
      </span>
    </button>
  );
}
