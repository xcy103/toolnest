import Link from "next/link";
import type { Tool } from "@/lib/tools";

/** A single tool card on the home page. Renders as a link when available,
 *  otherwise as a dimmed "即将上线" placeholder. */
export default function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 font-mono text-xl text-emerald-600 dark:text-emerald-400">
          {tool.icon}
        </span>
        {!tool.available && (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
            即将上线
          </span>
        )}
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted">{tool.description}</p>
    </>
  );

  const base =
    "block rounded-2xl border border-border bg-card p-5 shadow-sm transition";

  if (!tool.available) {
    return (
      <div className={`${base} cursor-not-allowed opacity-60`} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={tool.href}
      className={`${base} hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md`}
    >
      {inner}
    </Link>
  );
}
