import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NewsCard } from "@/components/NewsCard";
import { ALL_CATEGORIES, NEWS, TRENDING, type Category } from "@/lib/news-data";
import { useInterests } from "@/lib/app-state";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/feed")({
  component: FeedPage,
  head: () => ({
    meta: [
      { title: "Your Feed — Locus Intelligence" },
      { name: "description", content: "Personalized AI summaries of today's most important business and tech stories." },
    ],
  }),
});

function FeedPage() {
  const { interests } = useInterests();
  const [active, setActive] = useState<Category | "All">("All");
  const [chips, setChips] = useState<Category[]>([]);

  useEffect(() => {
    setChips(interests.length > 0 ? interests : (["Markets", "AI", "Startups", "Economy"] as Category[]));
  }, [interests]);

  const items = active === "All" ? NEWS : NEWS.filter((n) => n.category === active);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AppShell subtitle="Locus Intelligence" title={`${greeting}.`}>
      {/* Interests */}
      <div className="px-5 pb-2 pt-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Your Interests
          </h2>
          <Link to="/" className="font-mono text-[10px] font-medium uppercase tracking-widest text-primary">
            Edit
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {(["All", ...chips, ...ALL_CATEGORIES.filter((c) => !chips.includes(c))] as const).map((c) => {
            const on = active === c;
            return (
              <button
                key={c}
                onClick={() => setActive(c as Category | "All")}
                className={`flex-none rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  on
                    ? "bg-foreground text-background"
                    : "border border-border text-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending strip */}
      <section className="mt-6 border-y border-border bg-[var(--surface)] py-4">
        <div className="mb-3 flex items-center gap-2 px-5">
          <TrendingUp size={12} className="text-primary" strokeWidth={2.4} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            Trending now
          </span>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {TRENDING.map((t) => (
            <Link
              key={t.id}
              to="/article/$id"
              params={{ id: t.id }}
              className="flex w-64 flex-none flex-col gap-2 border border-border bg-background p-3 transition-colors hover:border-foreground/30"
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {t.source} · {t.category}
              </span>
              <p className="text-sm font-bold leading-snug">{t.headline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Feed */}
      <main className="mt-8 space-y-10 px-5">
        {items.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No stories in this category yet.
          </p>
        )}
      </main>
    </AppShell>
  );
}
