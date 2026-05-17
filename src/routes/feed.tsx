import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { NewsCard } from "@/components/NewsCard";
import { ALL_CATEGORIES, MARKET_SNAPSHOT, type Category } from "@/lib/news-data";
import { newsQueryOptions } from "@/lib/news-query";
import { useInterests } from "@/lib/app-state";
import { TrendingUp, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const queryClient = useQueryClient();

  const chips = interests.length > 0 ? interests : (["Markets", "AI", "Startups", "Economy"] as Category[]);
  const orderedCategories = useMemo(
    () => ["All", ...chips, ...ALL_CATEGORIES.filter((category) => !chips.includes(category))] as const,
    [chips],
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery(newsQueryOptions(active));
  const { data: overviewData } = useQuery(newsQueryOptions("All"));

  useEffect(() => {
    const firstInterest = orderedCategories.find((category): category is Category => category !== "All");
    if (firstInterest) {
      queryClient.prefetchQuery(newsQueryOptions(firstInterest));
    }
  }, [orderedCategories, queryClient]);

  const news = data?.items ?? [];
  const overviewNews = overviewData?.items ?? [];
  const fallbackItems = active === "All"
    ? []
    : (() => {
        const categoryMatches = overviewNews.filter((item) => item.category === active).slice(0, 6);
        return categoryMatches.length > 0 ? categoryMatches : overviewNews.slice(0, 6);
      })();
  const items = news.length > 0 ? news : fallbackItems;
  const trending = useMemo(() => overviewNews.filter((item) => item.trending).slice(0, 6), [overviewNews]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AppShell subtitle="Locus Intelligence" title={`${greeting}.`}>
      <section aria-label="Today's market snapshot" className="border-b border-border px-5 pb-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Today's market snapshot
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Live
          </span>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5">
          {MARKET_SNAPSHOT.map((m) => {
            const up = m.changePct >= 0;
            return (
              <div key={m.symbol} className="flex flex-none flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </span>
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${up ? "text-primary" : "text-destructive"}`}
                >
                  {up ? "+" : ""}
                  {m.changePct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="px-5 pb-2 pt-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            <Sparkles size={10} className="text-primary" />
            {chips.length > 0
              ? `Tailored to ${chips.slice(0, 2).join(" + ")}${chips.length > 2 ? " +" + (chips.length - 2) : ""}`
              : "Your interests"}
          </h2>
          <Link to="/" className="font-mono text-[10px] font-medium uppercase tracking-widest text-primary">
            Edit
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {orderedCategories.map((category) => {
            const on = active === category;
            return (
              <button
                key={category}
                onClick={() => setActive(category as Category | "All")}
                className={`flex-none rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  on ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-secondary"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {trending.length > 0 && (
        <section className="mt-6 border-y border-border bg-[var(--surface)] py-4">
          <div className="mb-3 flex items-center gap-2 px-5">
            <TrendingUp size={12} className="text-primary" strokeWidth={2.4} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              Trending now
            </span>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
            {trending.map((t) => (
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
      )}

      <main className="mt-8 space-y-10 px-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles size={10} className="text-primary" />
          <span>{active === "All" ? "Recommended for you" : `${active} for you`}</span>
          {isFetching && !isLoading ? <span className="text-primary">Updating…</span> : null}
          <span className="ml-auto">{items.length} stories</span>
        </div>

        {isLoading && (
          <div className="space-y-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Couldn't load today's stories.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && items.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}

        {!isLoading && !isError && items.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            We’re fetching more {active === "All" ? "stories" : active.toLowerCase()} coverage. Try again in a moment.
          </p>
        )}
      </main>
    </AppShell>
  );
}
