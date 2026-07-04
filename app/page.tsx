import { tools, siteConfig } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

export default function Home() {
  const total = tools.length;
  const live = tools.filter((t) => t.available).length;

  // Group tools by category, preserving the order they appear in the registry.
  const categories: string[] = [];
  for (const t of tools) {
    if (!categories.includes(t.category)) categories.push(t.category);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-14 text-center sm:py-20">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl shadow-lg shadow-emerald-500/20">
          🪺
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Tool<span className="text-emerald-500">Nest</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          {siteConfig.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <span>✅ 免费使用</span>
          <span>🔒 数据不出本地</span>
          <span>⚡ 无需注册</span>
        </div>
        <p className="mt-6 text-sm text-muted">
          已规划 <span className="font-semibold text-foreground">{total}</span>{" "}
          个工具,
          {live > 0 ? (
            <>
              已上线{" "}
              <span className="font-semibold text-emerald-500">{live}</span> 个,
              持续更新中。
            </>
          ) : (
            <>正在陆续上线,敬请期待。</>
          )}
        </p>
      </section>

      {/* Tool directory, grouped by category */}
      <section className="pb-16">
        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {category}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools
                .filter((t) => t.category === category)
                .map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
