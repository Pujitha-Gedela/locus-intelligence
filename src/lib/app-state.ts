import { useEffect, useState, useCallback } from "react";
import type { Category } from "./news-data";

const SAVED_KEY = "locus.saved.v1";
const INTERESTS_KEY = "locus.interests.v1";
const ONBOARDED_KEY = "locus.onboarded.v1";
const THEME_KEY = "locus.theme.v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => setSaved(readJSON<string[]>(SAVED_KEY, [])), []);
  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);
  return { saved, toggle, isSaved };
}

export function useInterests() {
  const [interests, setInterests] = useState<Category[]>([]);
  useEffect(() => setInterests(readJSON<Category[]>(INTERESTS_KEY, [])), []);
  const save = useCallback((next: Category[]) => {
    setInterests(next);
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(next));
    localStorage.setItem(ONBOARDED_KEY, "1");
  }, []);
  return { interests, save };
}

export function isOnboarded() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDED_KEY) === "1";
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as "light" | "dark" | null) ?? "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);
  return { theme, toggle };
}
