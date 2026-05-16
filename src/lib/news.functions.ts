import { createServerFn } from "@tanstack/react-start";
import { ALL_CATEGORIES, type Category, type NewsItem } from "./news-data";

type GnewsArticle = {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
};

type CacheEntry = { at: number; items: NewsItem[] };
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: CacheEntry | null = null;

// Per-category intelligent search queries. Primary is the rich OR query;
// fallback is a broader query used only when the primary returns too few items.
const CATEGORY_QUERIES: Array<{ category: Category; primary: string; fallback: string }> = [
  {
    category: "AI",
    primary: '"artificial intelligence" OR OpenAI OR Anthropic OR Nvidia OR "generative AI" OR LLM',
    fallback: "AI model OR chatbot OR machine learning",
  },
  {
    category: "Startups",
    primary: 'startup OR "venture capital" OR "Series A" OR "Series B" OR "Y Combinator" OR founder OR funding',
    fallback: "startup raises OR seed round",
  },
  {
    category: "Markets",
    primary: '"stock market" OR Nasdaq OR Sensex OR "S&P 500" OR Dow OR Nifty OR investing OR equities',
    fallback: "stocks OR shares OR market rally",
  },
  {
    category: "Technology",
    primary: 'technology OR chips OR semiconductors OR software OR cloud OR Apple OR Google OR Microsoft',
    fallback: "tech company OR product launch",
  },
  {
    category: "Business",
    primary: 'business OR economy OR corporate OR earnings OR CEO OR merger',
    fallback: "company OR revenue OR profit",
  },
  {
    category: "Economy",
    primary: 'economy OR inflation OR "Federal Reserve" OR GDP OR "interest rates" OR recession',
    fallback: "economic growth OR central bank",
  },
];

// Trusted business/tech sources — used to rank, not to hard-filter.
const TRUSTED_SOURCES = new Set(
  [
    "bloomberg", "reuters", "techcrunch", "financial times", "ft",
    "economic times", "cnbc", "wall street journal", "wsj",
    "the information", "the verge", "wired", "ars technica",
    "business insider", "forbes", "fortune", "barron's", "marketwatch",
    "axios", "the economist", "nikkei", "bbc", "associated press", "ap news",
    "mint", "moneycontrol", "livemint",
  ].map((s) => s.toLowerCase()),
);

// Drop obvious entertainment / clickbait sources.
const SOURCE_BLOCKLIST = [
  "tmz", "daily mail", "buzzfeed", "people.com", "eonline", "perez",
];

function isBlockedSource(name: string | undefined): boolean {
  if (!name) return false;
  const n = name.toLowerCase();
  return SOURCE_BLOCKLIST.some((b) => n.includes(b));
}

function sourceRank(name: string | undefined): number {
  if (!name) return 1;
  return TRUSTED_SOURCES.has(name.toLowerCase()) ? 0 : 1;
}

function urlToId(url: string): string {
  // URL-safe base64
  const b64 = (typeof btoa === "function" ? btoa(url) : Buffer.from(url).toString("base64"));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function idToUrl(id: string): string {
  let b64 = id.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("utf-8");
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recent";
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.min(9, Math.round(words / 180) || 3));
}

function bodyFromArticle(a: GnewsArticle): string[] {
  const raw = (a.content ?? a.description ?? "").replace(/\s*\[\+\d+ chars\]\s*$/, "").trim();
  if (!raw) return [];
  return raw.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).reduce<string[]>((acc, sentence) => {
    const last = acc[acc.length - 1];
    if (!last || last.length > 240) acc.push(sentence);
    else acc[acc.length - 1] = `${last} ${sentence}`;
    return acc;
  }, []);
}

function mapArticle(a: GnewsArticle, category: Category, trending: boolean): NewsItem | null {
  if (!a?.url || !a?.title) return null;
  const summary = (a.description ?? a.content ?? "").replace(/\s*\[\+\d+ chars\]\s*$/, "").trim();
  if (!summary) return null;
  return {
    id: urlToId(a.url),
    headline: a.title,
    summary,
    source: a.source?.name ?? "Source",
    category,
    readTime: estimateReadTime(summary + " ".repeat(400)),
    thumbnail: a.image ?? undefined,
    publishedAt: timeAgo(a.publishedAt),
    url: a.url,
    body: bodyFromArticle(a),
    trending,
  };
}

async function fetchGnews(params: Record<string, string>, apiKey: string): Promise<GnewsArticle[]> {
  const u = new URL("https://gnews.io/api/v4/" + (params.q ? "search" : "top-headlines"));
  Object.entries({ lang: "en", max: "10", ...params, apikey: apiKey }).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetch(u.toString());
  if (!res.ok) {
    console.error(`GNews ${res.status}: ${await res.text().catch(() => "")}`);
    return [];
  }
  const json = (await res.json()) as { articles?: GnewsArticle[] };
  return json.articles ?? [];
}

async function loadAllNews(): Promise<NewsItem[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error("GNEWS_API_KEY is not configured");
    return [];
  }

  const topicResults = await Promise.all(
    TOPIC_MAP.map((t) => fetchGnews({ category: t.topic, max: "10" }, apiKey).then((arts) => ({ ...t, arts }))),
  );
  const searchResults = await Promise.all(
    SEARCH_QUERIES.map((s) => fetchGnews({ q: s.q, max: "6", in: "title,description", sortby: "publishedAt" }, apiKey).then((arts) => ({ ...s, arts }))),
  );

  const all: NewsItem[] = [];
  const seen = new Set<string>();
  const pushAll = (arts: GnewsArticle[], category: Category, trendCount: number) => {
    arts.forEach((a, i) => {
      const mapped = mapArticle(a, category, i < trendCount);
      if (!mapped || seen.has(mapped.id)) return;
      seen.add(mapped.id);
      all.push(mapped);
    });
  };
  topicResults.forEach((r) => pushAll(r.arts, r.category, 3));
  searchResults.forEach((r) => pushAll(r.arts, r.category, 2));

  // Sort by recency hint (publishedAt was overwritten to relative; keep insertion order — topic headlines first)
  return all;
}

export const getNewsFn = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS && cache.items.length > 0) {
    return { items: cache.items, cachedAt: cache.at };
  }
  const items = await loadAllNews();
  if (items.length > 0) cache = { at: now, items };
  return { items: cache?.items ?? items, cachedAt: cache?.at ?? now };
});

export const getArticleInsightFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; headline: string; summary: string; category: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { whyItMatters: null, keyTakeaway: null };

    const prompt = `You are a senior business analyst writing for time-poor executives reading "${data.category}" news.

Headline: ${data.headline}
Summary: ${data.summary}

Return JSON with two fields:
- "whyItMatters": one sentence (max 30 words) explaining the broader business or market implication.
- "keyTakeaway": one short imperative action (max 18 words) a business leader should consider.

Be specific. Avoid hedging. No preamble.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        console.error(`AI insight ${res.status}`);
        return { whyItMatters: null, keyTakeaway: null };
      }
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content) as { whyItMatters?: string; keyTakeaway?: string };
      return {
        whyItMatters: parsed.whyItMatters ?? null,
        keyTakeaway: parsed.keyTakeaway ?? null,
      };
    } catch (err) {
      console.error("AI insight error:", err);
      return { whyItMatters: null, keyTakeaway: null };
    }
  });

export const ALL_CATEGORIES_RE = ALL_CATEGORIES; // re-export for convenience
