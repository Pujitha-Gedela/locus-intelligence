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
