import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { NewsItem } from "@/lib/news-data";
import { useSaved } from "@/lib/app-state";

type Props = { item: NewsItem; index: number };

export function NewsCard({ item, index }: Props) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(item.id);
  return (
    <article
      className="animate-reveal"
      style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
    >
      <div className="mb-3 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span className="font-bold tracking-tighter text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="uppercase tracking-wider">
          {item.source} · {item.readTime}m read
        </span>
        <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-[9px] uppercase">
          {item.category}
        </span>
      </div>

      <Link
        to="/article/$id"
        params={{ id: item.id }}
        className="group block"
      >
        <h3 className="mb-3 text-balance text-xl font-bold leading-tight transition-colors group-hover:text-primary">
          {item.headline}
        </h3>

        {item.thumbnail && (
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg ring-1 ring-black/5">
            <img
              src={item.thumbnail}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        )}

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {item.summary}
        </p>
      </Link>

      {item.whyItMatters && (
        <div className="mb-4 border-l-2 border-primary bg-[var(--surface)] p-4">
          <span className="mb-1 block font-mono text-[10px] font-bold uppercase text-primary">
            Why this matters
          </span>
          <p className="text-sm italic text-foreground/80">{item.whyItMatters}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          to="/article/$id"
          params={{ id: item.id }}
          className="flex-1 border border-border py-3 text-center text-xs font-bold uppercase tracking-widest transition-colors hover:bg-secondary"
        >
          Read Full Article
        </Link>
        <button
          onClick={() => toggle(item.id)}
          aria-label={saved ? "Remove bookmark" : "Save article"}
          className="grid size-12 place-items-center border border-border transition-colors hover:bg-secondary"
        >
          {saved ? (
            <BookmarkCheck size={16} className="text-primary" />
          ) : (
            <Bookmark size={16} />
          )}
        </button>
      </div>
    </article>
  );
}
