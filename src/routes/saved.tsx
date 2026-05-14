import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NewsCard } from "@/components/NewsCard";
import { NEWS } from "@/lib/news-data";
import { useSaved } from "@/lib/app-state";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
  head: () => ({
    meta: [{ title: "Saved — Locus Intelligence" }],
  }),
});

function SavedPage() {
  const { saved } = useSaved();
  const items = NEWS.filter((n) => saved.includes(n.id));
  return (
    <AppShell subtitle="Library" title="Saved">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <Bookmark size={28} className="text-muted-foreground" strokeWidth={1.5} />
          <h2 className="mt-5 text-lg font-bold">Nothing saved yet</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Tap the bookmark on any story to keep it here for later.
          </p>
          <Link
            to="/feed"
            className="mt-6 border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
          >
            Browse Feed
          </Link>
        </div>
      ) : (
        <main className="mt-6 space-y-10 px-5">
          {items.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} />
          ))}
        </main>
      )}
    </AppShell>
  );
}
