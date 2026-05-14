import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useTheme } from "@/lib/app-state";
import { Moon, Sun } from "lucide-react";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showThemeToggle?: boolean;
  rightSlot?: ReactNode;
  hideNav?: boolean;
};

export function AppShell({ children, title, subtitle, showThemeToggle = true, rightSlot, hideNav }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-background pb-28 text-foreground">
      {(title || rightSlot || showThemeToggle) && (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur-md">
          <div className="min-w-0">
            {subtitle && (
              <span className="block font-mono text-[10px] uppercase tracking-widest text-primary">
                {subtitle}
              </span>
            )}
            {title && (
              <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rightSlot}
            {showThemeToggle && (
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}
          </div>
        </header>
      )}
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
