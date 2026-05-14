import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NEWS } from "@/lib/news-data";
import { Link } from "@tanstack/react-router";
import { Sun } from "lucide-react";

export const Route = createFileRoute("/briefing")({
  component: BriefingPage,
  head: () => ({
    meta: [
      { title: "Morning Briefing — Locus Intelligence" },
      { name: "description", content: "Your two-minute briefing on the stories shaping the business day." },
    ],
  }),
});

function BriefingPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const top = NEWS.slice(0, 5);

  return (
    <AppShell subtitle="Morning Briefing" title={today}>
      <div className="px-5 py-6">
        <div className="mb-8 flex items-start gap-3 border border-border bg-[var(--surface)] p-5">
          <Sun size={18} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="text-[15px] font-bold leading-snug">
              Five stories. Two minutes. Everything that moves your work today.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Generated at 6:00 AM, calibrated to your interests.
            </p>
          </div>
        </div>

        <ol className="space-y-7">
          {top.map((n, i) => (
            <li key={n.id} className="flex gap-4">
              <span className="font-mono text-2xl font-bold tracking-tighter text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {n.source} · {n.category}
                </span>
                <Link
                  to="/article/$id"
                  params={{ id: n.id }}
                  className="mt-1 block text-base font-bold leading-snug hover:text-primary"
                >
                  {n.headline}
                </Link>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {n.summary}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AppShell>
  );
}
