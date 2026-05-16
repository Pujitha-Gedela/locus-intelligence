import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSaved } from "@/lib/app-state";
import { newsQueryOptions, insightQueryOptions } from "@/lib/news-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/article/$id")({
  component: ArticlePage,
  head: () => ({
    meta: [{ title: "Article — Locus Intelligence" }],
  }),
});

function ArticlePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isSaved, toggle } = useSaved();
  const { data, isLoading } = useQuery(newsQueryOptions());
  const item = useMemo(() => (data?.items ?? []).find((n) => n.id === id), [data, id]);

  const [progress, setProgress] = useState(0);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [id]);

  // Detect frame block: many sites refuse embedding via X-Frame-Options.
  // If the iframe never fires "load" within 4s after opening, fall back.
  useEffect(() => {
    if (!embedOpen) return;
    setEmbedFailed(false);
    const t = setTimeout(() => setEmbedFailed(true), 4500);
    return () => clearTimeout(t);
  }, [embedOpen, item?.url]);

  const insight = useQuery({
    ...insightQueryOptions({
      id: item?.id ?? "_",
      headline: item?.headline ?? "",
      summary: item?.summary ?? "",
      category: item?.category ?? "",
    }),
    enabled: !!item,
  });

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen max-w-[480px] bg-background px-5 py-20">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-8 w-full" />
        <Skeleton className="mt-2 h-8 w-2/3" />
        <Skeleton className="mt-6 aspect-video w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto min-h-screen max-w-[480px] bg-background px-5 py-20 text-center">
        <p className="text-sm text-muted-foreground">Article not found or no longer available.</p>
        <Link to="/feed" className="mt-4 inline-block text-sm font-bold text-primary">
          Back to feed
        </Link>
      </div>
    );
  }

  const saved = isSaved(item.id);
  const itemId = item.id;
  const handleToggle = () => {
    const wasSaved = saved;
    toggle(itemId);
    toast(wasSaved ? "Removed from briefing" : "Saved to briefing", { duration: 1800 });
  };

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-3">
          <button
            onClick={() => navigate({ to: "/feed" })}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium hover:bg-secondary"
            aria-label="Back to feed"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggle}
              aria-label={saved ? "Remove bookmark" : "Save"}
              className="grid size-9 place-items-center rounded-full hover:bg-secondary"
            >
              {saved ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
            </button>
            <button
              aria-label="Share"
              className="grid size-9 place-items-center rounded-full hover:bg-secondary"
              onClick={() => {
                if (typeof navigator !== "undefined" && "share" in navigator) {
                  navigator.share({ title: item.headline, text: item.summary, url: item.url }).catch(() => {});
                }
              }}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
        <div className="h-0.5 w-full bg-transparent">
          <div
            className="h-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
      </header>

      <article className="px-5 pt-6">
        <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="font-bold text-primary">{item.category}</span>
          <span>·</span>
          <span>{item.source}</span>
          <span>·</span>
          <span>{item.readTime}m read</span>
        </div>

        <h1 className="text-balance text-2xl font-bold leading-tight">{item.headline}</h1>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Published {item.publishedAt}
        </p>

        {item.thumbnail && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg ring-1 ring-black/5">
            <img src={item.thumbnail} alt="" className="size-full object-cover" />
          </div>
        )}

        {/* AI Summary */}
        <section className="mt-6 border border-border bg-[var(--surface)] p-5">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            AI Summary
          </span>
          <p className="text-[15px] leading-relaxed text-foreground">{item.summary}</p>
        </section>

        {/* Key takeaway (AI generated) */}
        {insight.data?.keyTakeaway && (
          <section className="mt-4 flex gap-3 border border-dashed border-primary/40 bg-[var(--surface)] p-4">
            <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              Key<br/>takeaway
            </span>
            <p className="border-l border-primary/30 pl-3 text-[14px] font-medium leading-relaxed text-foreground">
              {insight.data.keyTakeaway}
            </p>
          </section>
        )}

        {/* Why it matters (AI generated) */}
        {(insight.isLoading || insight.data?.whyItMatters) && (
          <section className="mt-4 border-l-2 border-primary bg-[var(--surface)] p-5">
            <span className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              <span className="size-1 rounded-full bg-primary" />
              AI insight · Why this matters
            </span>
            {insight.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ) : (
              <p className="text-[15px] italic leading-relaxed text-foreground/80">
                {insight.data?.whyItMatters}
              </p>
            )}
          </section>
        )}

        {/* Body excerpt */}
        {item.body.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              From the report — {item.source}
            </h2>
            <div className="space-y-5 text-[16px] leading-[1.75] tracking-[-0.003em] text-foreground/90">
              {item.body.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold first-letter:leading-none"
                      : ""
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Read full article — embedded */}
        <section className="mt-10">
          {!embedOpen ? (
            <button
              onClick={() => setEmbedOpen(true)}
              className="flex w-full items-center justify-between border border-border bg-foreground px-5 py-4 text-background transition-opacity hover:opacity-90"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Read full article</span>
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-75">
                {item.source}
              </span>
            </button>
          ) : (
            <div className="overflow-hidden border border-border">
              <div className="flex items-center justify-between border-b border-border bg-[var(--surface)] px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Reading on {item.source}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary"
                >
                  Open <ExternalLink size={11} />
                </a>
              </div>
              {!embedFailed ? (
                <iframe
                  ref={iframeRef}
                  src={item.url}
                  title={item.headline}
                  onLoad={() => setEmbedFailed(false)}
                  className="h-[78vh] w-full bg-background"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : (
                <div className="space-y-4 px-5 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {item.source} doesn't allow embedded reading.
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-border bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background hover:opacity-90"
                  >
                    Open original <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            End of article
          </p>
          <Link
            to="/feed"
            className="mt-4 inline-block border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
          >
            Back to feed
          </Link>
        </div>
      </article>
    </div>
  );
}
