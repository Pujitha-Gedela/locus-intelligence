import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NEWS, ALL_CATEGORIES } from "@/lib/news-data";
import { Search as SearchIcon, X } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({
    meta: [{ title: "Search — Locus Intelligence" }],
  }),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query
    ? NEWS.filter(
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
        <div className="flex items-center gap-3 border border-border bg-[var(--surface)] px-4 py-3">
          <SearchIcon size={16} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Search headlines, sources, topics…"
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {!query && (
          <div className="mt-8">
            <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Browse by topic
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setQ(c)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
                >
                  {c}
                </button>
              ))}
            </div>
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
