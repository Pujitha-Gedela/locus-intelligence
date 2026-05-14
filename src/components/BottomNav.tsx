import { Link, useLocation } from "@tanstack/react-router";
import { Home, Sparkles, Bookmark, Search } from "lucide-react";

const items = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/briefing", label: "Briefing", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/search", label: "Search", icon: Search },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[480px] border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to === "/feed" && pathname === "/");
          return (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-center gap-1.5"
              aria-label={label}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.4 : 1.6}
                className={active ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] uppercase tracking-tighter ${
                  active ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
