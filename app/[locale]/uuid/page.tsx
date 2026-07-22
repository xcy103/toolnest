"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Options = {
  count: number;
  uppercase: boolean;
  noHyphens: boolean;
};

function makeUuids(opts: Options): string[] {
  const out: string[] = [];
  for (let i = 0; i < opts.count; i++) {
    let u = crypto.randomUUID();
    if (opts.noHyphens) u = u.replace(/-/g, "");
    if (opts.uppercase) u = u.toUpperCase();
    out.push(u);
  }
  return out;
}

export default function UuidPage() {
  const t = useTranslations();
  const [opts, setOpts] = useState<Options>({
    count: 5,
    uppercase: false,
    noHyphens: false,
  });
  const [uuids, setUuids] = useState<string[]>([]);

  function regenerate() {
    setUuids(makeUuids(opts));
  }

  // Generate on mount and whenever the options change. Random output must be
  // produced on the client only, or SSR and hydration would disagree.
  useEffect(() => {
    function run() {
      setUuids(makeUuids(opts));
    }
    run();
  }, [opts]);

  function toggle(key: "uppercase" | "noHyphens") {
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  }

  return (
    <ToolLayout
      title={t("tools.uuid.name")}
      description={t("uuidPage.description")}
      icon="🆔"
    >
      {/* Output */}
      <ToolPanel
        label={t("uuidPage.outputLabel")}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={regenerate}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              🔄 {t("uuidPage.regenerate")}
            </button>
            <CopyButton value={uuids.join("\n")} />
          </div>
        }
      >
        <textarea
          value={uuids.join("\n")}
          readOnly
          rows={Math.min(Math.max(opts.count, 3), 12)}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground/90 outline-none"
        />
      </ToolPanel>

      {/* Options */}
      <ToolPanel>
        <label className="mb-1.5 block text-sm font-semibold text-foreground/80">
          {t("uuidPage.countLabel", { n: opts.count })}
        </label>
        <input
          type="range"
          min={1}
          max={50}
          value={opts.count}
          onChange={(e) =>
            setOpts((o) => ({ ...o, count: Number(e.target.value) }))
          }
          className="w-full accent-emerald-500"
        />

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["uppercase", t("uuidPage.optUppercase")],
              ["noHyphens", t("uuidPage.optNoHyphens")],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition hover:bg-foreground/5"
            >
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={() => toggle(key)}
                className="h-4 w-4 accent-emerald-500"
              />
              {label}
            </label>
          ))}
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
