import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ALL_CATEGORIES } from "@/lib/news-data";
import { newsQueryOptions } from "@/lib/news-query";
import { Search as SearchIcon, X, Clock, TrendingUp, Hash } from "lucide-react";

const RECENT_KEY = "locus.recent-searches.v1";
const TRENDING_TOPICS = [
  "Artificial intelligence",
  "Stock market",
  "Startup funding",
  "Inflation",
  "Earnings",
];

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({
    meta: [{ title: "Search — Locus Intelligence" }],
  }),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const { data } = useQuery(newsQueryOptions());
  const news = data?.items ?? [];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  function pushRecent(term: string) {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearRecent() {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }

  const query = q.trim().toLowerCase();
  const results = query
    ? news.filter(
        (n) =>
          n.headline.toLowerCase().includes(query) ||
          n.summary.toLowerCase().includes(query) ||
          n.source.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query),
      )
    : [];

  return (
    <AppShell subtitle="Discover" title="Search">
      <div className="px-5 pt-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushRecent(q);
          }}
          className="flex items-center gap-3 border border-border bg-[var(--surface)] px-4 py-3"
        >
          <SearchIcon size={16} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Search headlines, sources, topics…"
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </form>

        {!query && (
          <div className="mt-8 space-y-8">
            {recent.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    <Clock size={10} /> Recent searches
                  </h3>
                  <button
                    onClick={clearRecent}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setQ(r);
                        pushRecent(r);
                      }}
                      className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-primary">
                <TrendingUp size={10} /> Trending topics
              </h3>
              <ul className="divide-y divide-border border-y border-border">
                {TRENDING_TOPICS.map((t, i) => (
                  <li key={t}>
                    <button
                      onClick={() => {
                        setQ(t);
                        pushRecent(t);
                      }}
                      className="flex w-full items-center gap-3 py-3 text-left hover:bg-secondary/40"
                    >
                      <span className="w-5 font-mono text-[11px] font-bold text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium">{t}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                <Hash size={10} /> Suggested categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setQ(c);
                      pushRecent(c);
                    }}
                    className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {query && (
          <div className="mt-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
            <ul className="mt-4 divide-y divide-border">
              {results.map((n) => (
                <li key={n.id}>
                  <Link
                    to="/article/$id"
                    params={{ id: n.id }}
                    onClick={() => pushRecent(q)}
                    className="block py-4 hover:bg-secondary/40"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {n.source} · {n.category}
                    </span>
                    <p className="mt-1 text-[15px] font-bold leading-snug">{n.headline}</p>
                  </Link>
                </li>
              ))}
              {results.length === 0 && (
                <li className="py-12 text-center text-sm text-muted-foreground">
                  No matches. Try another keyword.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
