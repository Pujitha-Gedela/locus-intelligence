import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { getNewsById } from "@/lib/news-data";
import { useSaved } from "@/lib/app-state";

export const Route = createFileRoute("/article/$id")({
  component: ArticlePage,
  head: ({ params }) => {
    const item = getNewsById(params.id);
    return {
      meta: [
        { title: item ? `${item.headline} — Locus` : "Article — Locus" },
        { name: "description", content: item?.summary ?? "Read the full article on Locus." },
      ],
    };
  },
});

function ArticlePage() {
  const { id } = Route.useParams();
  const item = getNewsById(id);
  const navigate = useNavigate();
  const { isSaved, toggle } = useSaved();

  if (!item) {
    return (
      <div className="mx-auto min-h-screen max-w-[480px] bg-background px-5 py-20 text-center">
        <p className="text-sm text-muted-foreground">Article not found.</p>
        <Link to="/feed" className="mt-4 inline-block text-sm font-bold text-primary">
          Back to feed
        </Link>
      </div>
    );
  }

  const saved = isSaved(item.id);

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-3 py-3 backdrop-blur-md">
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
            onClick={() => toggle(item.id)}
            aria-label={saved ? "Remove bookmark" : "Save"}
            className="grid size-9 place-items-center rounded-full hover:bg-secondary"
          >
            {saved ? (
              <BookmarkCheck size={16} className="text-primary" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
          <button
            aria-label="Share"
            className="grid size-9 place-items-center rounded-full hover:bg-secondary"
            onClick={() => {
              if (typeof navigator !== "undefined" && "share" in navigator) {
                navigator
                  .share({ title: item.headline, text: item.summary })
                  .catch(() => {});
              }
            }}
          >
            <Share2 size={16} />
          </button>
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

        <h1 className="text-balance text-2xl font-bold leading-tight">
          {item.headline}
        </h1>
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

        {item.whyItMatters && (
          <section className="mt-4 border-l-2 border-primary bg-[var(--surface)] p-5">
            <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              Why this matters
            </span>
            <p className="text-[15px] italic leading-relaxed text-foreground/80">
              {item.whyItMatters}
            </p>
          </section>
        )}

        {/* Full article */}
        <section className="mt-8">
          <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Full article — {item.source}
          </h2>
          <div className="space-y-5 text-[16px] leading-[1.7] text-foreground">
            {item.body.map((p, i) => (
              <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold first-letter:leading-none" : ""}>
                {p}
              </p>
            ))}
          </div>
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
