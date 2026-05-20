import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ALL_CATEGORIES, type Category } from "@/lib/news-data";
import { useInterests, isOnboarded } from "@/lib/app-state";
import { ArrowRight, Check, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Onboarding,
  head: () => ({
    meta: [
      { title: "Locus Intelligence — AI business news, distilled" },
      {
        name: "description",
        content:
          "Pick your interests and get a calm, premium feed of AI-summarized business and tech news.",
      },
    ],
  }),
});

function Onboarding() {
  const navigate = useNavigate();
  const { save } = useInterests();
  const [selected, setSelected] = useState<Category[]>(["Markets", "AI", "Startups"]);
  const [step, setStep] = useState<"splash" | "auth" | "interests">("splash");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isOnboarded()) navigate({ to: "/feed", replace: true });
  }, [navigate]);

  useEffect(() => {
    if (step !== "splash") return;
    const t = setTimeout(() => setStep("auth"), 1300);
    return () => clearTimeout(t);
  }, [step]);

  function toggle(c: Category) {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function continueToFeed(asGuest: boolean) {
    save(asGuest && selected.length === 0 ? ["Markets", "Business", "AI"] : selected);
    navigate({ to: "/feed" });
  }

  if (step === "splash") {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center bg-background px-6 text-foreground">
        <div className="animate-reveal text-center">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
            Locus
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Intelligence.</h1>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            AI-distilled business news for people who don't have time to read it all.
          </p>
        </div>
      </div>
    );
  }

  if (step === "auth") {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-background px-6 pb-10 pt-14 text-foreground">
        <div className="animate-reveal">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            Locus Intelligence
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything shaping markets and technology — in brief.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("interests");
          }}
          className="mt-10 space-y-3"
        >
          <label className="flex items-center gap-3 border border-border bg-secondary/40 px-4 py-3.5">
            <Mail size={14} className="text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label className="flex items-center gap-3 border border-border bg-secondary/40 px-4 py-3.5">
            <Lock size={14} className="text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 bg-foreground py-4 text-xs font-bold uppercase tracking-widest text-background"
          >
            Continue <ArrowRight size={14} />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={() => setStep("interests")}
          className="flex w-full items-center justify-center gap-2 border border-border bg-background py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.9 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43c5 0 9.6-1.9 13-5l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 38.7 16.3 43 24 43z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6 5.1c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? (
              <>New here? <span className="font-semibold text-foreground">Create account</span></>
            ) : (
              <>Already have an account? <span className="font-semibold text-foreground">Sign in</span></>
            )}
          </button>
          <button
            onClick={() => setStep("interests")}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Explore Demo →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-background px-6 pb-12 pt-14 text-foreground">
      <div className="animate-reveal">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
          Step 1 of 1
        </span>
        <h2 className="mt-3 text-3xl font-bold leading-tight">
          What moves your work?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a few topics. Your feed adapts the moment you tap one.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((c) => {
          const on = selected.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-medium transition-all ${
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:border-foreground/40"
              }`}
            >
              {on && <Check size={12} strokeWidth={3} />}
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-12 space-y-3">
        <button
          disabled={selected.length === 0}
          onClick={() => continueToFeed(false)}
          className="flex w-full items-center justify-center gap-2 bg-foreground py-4 text-xs font-bold uppercase tracking-widest text-background transition-opacity disabled:opacity-30"
        >
          Continue <ArrowRight size={14} />
        </button>
        <button
          onClick={() => continueToFeed(true)}
          className="w-full py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Continue as Guest
        </button>
      </div>

      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        No signup. No friction.
      </p>
    </div>
  );
}
