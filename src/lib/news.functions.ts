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

type QueryConfig = {
  primary: string;
  fallback: string;
  keywords: string[];
};

type CacheEntry = { at: number; items: NewsItem[] };
export type NewsScope = Category | "All";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_RESULTS = 5;
const MAX_RESULTS = 10;
const REQUEST_COOLDOWN_MS = 45 * 1000;
const cache = new Map<NewsScope, CacheEntry>();
const inflight = new Map<NewsScope, Promise<NewsItem[]>>();

const CATEGORY_CONFIG: Record<Category, QueryConfig> = {
  Markets: {
    primary: '"stock market" OR Sensex OR Nasdaq OR investing OR "Wall Street" OR equities OR "S&P 500"',
    fallback: 'markets OR shares OR stocks OR trading OR indexes',
    keywords: ["stock market", "sensex", "nasdaq", "wall street", "investing", "equities", "s&p 500", "dow", "nifty", "stocks"],
  },
  Technology: {
    primary: 'technology OR software OR chips OR cloud OR Apple OR Google OR Microsoft OR semiconductors',
    fallback: 'tech industry OR enterprise software OR devices OR cloud computing',
    keywords: ["technology", "software", "chips", "cloud", "apple", "google", "microsoft", "semiconductor", "ai chip", "device"],
  },
  Economy: {
    primary: 'economy OR inflation OR GDP OR RBI OR "Federal Reserve" OR "interest rates" OR recession',
    fallback: 'economic growth OR central bank OR macro OR jobs report',
    keywords: ["economy", "inflation", "gdp", "rbi", "federal reserve", "interest rates", "recession", "central bank", "macroeconomic", "jobs"],
  },
  Business: {
    primary: 'business OR corporate OR earnings OR companies OR ceo OR merger OR acquisition',
    fallback: 'company results OR corporate strategy OR enterprise business',
    keywords: ["business", "corporate", "earnings", "companies", "ceo", "merger", "acquisition", "profit", "revenue", "enterprise"],
  },
  AI: {
    primary: 'AI OR OpenAI OR Nvidia OR "generative AI" OR Anthropic OR LLM OR "artificial intelligence"',
    fallback: 'machine learning OR chatbot OR ai model OR inference',
    keywords: ["ai", "openai", "nvidia", "generative ai", "anthropic", "llm", "artificial intelligence", "machine learning", "chatbot", "inference"],
  },
  Startups: {
    primary: 'startup OR "venture capital" OR funding OR founder OR "Series A" OR "Series B" OR incubator',
    fallback: 'startup raises OR seed round OR investor-backed company',
    keywords: ["startup", "venture capital", "funding", "founder", "series a", "series b", "seed round", "unicorn", "accelerator", "incubator"],
  },
  Policy: {
    primary: 'regulation OR policy OR lawmakers OR antitrust OR tariff OR compliance OR ministry',
    fallback: 'government policy OR regulators OR legislation OR policy reform',
    keywords: ["regulation", "policy", "lawmakers", "antitrust", "tariff", "compliance", "regulator", "legislation", "ministry", "government"],
  },
  Leadership: {
    primary: 'leadership OR CEO strategy OR management OR workplace OR executive OR boardroom',
    fallback: 'chief executive OR company culture OR leadership strategy',
    keywords: ["leadership", "ceo", "management", "workplace", "executive", "board", "culture", "productivity", "talent", "strategy"],
  },
  Global: {
    primary: 'global economy OR geopolitics OR trade OR supply chain OR international business OR exports',
    fallback: 'global markets OR foreign policy business OR world economy',
    keywords: ["global", "geopolitics", "trade", "supply chain", "international", "exports", "imports", "world economy", "cross-border", "foreign"],
  },
};

const OVERVIEW_QUERY: QueryConfig = {
  primary: 'business OR technology OR markets OR economy OR AI OR startup OR earnings',
  fallback: 'reuters OR bloomberg OR cnbc OR techcrunch OR "financial times" business',
  keywords: ["business", "technology", "markets", "economy", "ai", "startup", "earnings"],
};

const GENERAL_FALLBACK_QUERY = 'business news OR market news OR technology news OR economy news';

const TRUSTED_SOURCES = new Set(
  [
    "bloomberg",
    "reuters",
    "techcrunch",
    "financial times",
    "ft",
    "economic times",
    "cnbc",
    "wall street journal",
    "wsj",
    "the information",
    "the verge",
    "wired",
    "ars technica",
    "business insider",
    "forbes",
    "fortune",
    "barron's",
    "marketwatch",
    "axios",
    "the economist",
    "nikkei",
    "bbc",
    "associated press",
    "ap news",
    "mint",
    "moneycontrol",
    "livemint",
  ].map((s) => s.toLowerCase()),
);

const SOURCE_BLOCKLIST = ["tmz", "daily mail", "buzzfeed", "people.com", "eonline", "perez"];

function isBlockedSource(name: string | undefined): boolean {
  if (!name) return false;
  const normalized = name.toLowerCase();
  return SOURCE_BLOCKLIST.some((entry) => normalized.includes(entry));
}

function sourceRank(name: string | undefined): number {
  if (!name) return 1;
  return TRUSTED_SOURCES.has(name.toLowerCase()) ? 0 : 1;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function keywordScore(article: GnewsArticle, keywords: string[]): number {
  const title = normalizeText(article.title);
  const body = normalizeText(`${article.description ?? ""} ${article.content ?? ""}`);

  return keywords.reduce((score, keyword) => {
    const inTitle = title.includes(keyword);
    const inBody = body.includes(keyword);
    if (inTitle) return score + 4;
    if (inBody) return score + 2;
    return score;
  }, 0);
}

function classifyCategory(article: GnewsArticle): Category {
  let bestCategory: Category = "Business";
  let bestScore = 0;

  ALL_CATEGORIES.forEach((category) => {
    const score = keywordScore(article, CATEGORY_CONFIG[category].keywords);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestCategory;
}

function urlToId(url: string): string {
  const b64 = typeof btoa === "function" ? btoa(url) : Buffer.from(url).toString("base64");
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

function bodyFromArticle(article: GnewsArticle): string[] {
  const raw = (article.content ?? article.description ?? "")
    .replace(/\s*\[\+\d+ chars\]\s*$/, "")
    .trim();
  if (!raw) return [];

  return raw.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).reduce<string[]>((acc, sentence) => {
    const last = acc[acc.length - 1];
    if (!last || last.length > 240) acc.push(sentence);
    else acc[acc.length - 1] = `${last} ${sentence}`;
    return acc;
  }, []);
}

function mapArticle(article: GnewsArticle, category: Category, trending: boolean): NewsItem | null {
  if (!article?.url || !article?.title) return null;
  const summary = (article.description ?? article.content ?? "")
    .replace(/\s*\[\+\d+ chars\]\s*$/, "")
    .trim();
  if (!summary) return null;

  return {
    id: urlToId(article.url),
    headline: article.title,
    summary,
    source: article.source?.name ?? "Source",
    category,
    readTime: estimateReadTime(summary + " ".repeat(400)),
    thumbnail: article.image ?? undefined,
    publishedAt: timeAgo(article.publishedAt),
    url: article.url,
    body: bodyFromArticle(article),
    trending,
  };
}

async function fetchGnews(params: Record<string, string>, apiKey: string): Promise<GnewsArticle[]> {
  const url = new URL("https://gnews.io/api/v4/" + (params.q ? "search" : "top-headlines"));
  Object.entries({ lang: "en", max: String(MAX_RESULTS), ...params, apikey: apiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`GNews ${res.status}: ${await res.text().catch(() => "")}`);
    return [];
  }

  const json = (await res.json()) as { articles?: GnewsArticle[] };
  return json.articles ?? [];
}

function buildRankedItems(
  articles: GnewsArticle[],
  category: Category,
  keywords: string[],
  minimumScore: number,
  trendCount: number,
): NewsItem[] {
  const seen = new Set<string>();

  return articles
    .filter((article) => !isBlockedSource(article.source?.name))
    .map((article) => ({ article, score: keywordScore(article, keywords) }))
    .filter(({ article, score }) => {
      if (!article.title || !article.url) return false;
      return score >= minimumScore || sourceRank(article.source?.name) === 0;
    })
    .sort((a, b) => {
      const rankDiff = sourceRank(a.article.source?.name) - sourceRank(b.article.source?.name);
      if (rankDiff !== 0) return rankDiff;
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime();
    })
    .map(({ article }, index) => mapArticle(article, category, index < trendCount))
    .filter((item): item is NewsItem => Boolean(item))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_RESULTS);
}

function buildOverviewItems(articles: GnewsArticle[]): NewsItem[] {
  const seen = new Set<string>();

  return articles
    .filter((article) => !isBlockedSource(article.source?.name))
    .sort((a, b) => {
      const rankDiff = sourceRank(a.source?.name) - sourceRank(b.source?.name);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .map((article, index) => mapArticle(article, classifyCategory(article), index < 4))
    .filter((item): item is NewsItem => Boolean(item))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 18);
}

async function fetchCategoryNews(category: Category, apiKey: string): Promise<NewsItem[]> {
  const config = CATEGORY_CONFIG[category];

  console.info(`[news] category=${category} stage=primary query=${config.primary}`);
  const primaryArticles = await fetchGnews(
    { q: config.primary, in: "title,description", sortby: "publishedAt", max: String(MAX_RESULTS) },
    apiKey,
  );

  let items = buildRankedItems(primaryArticles, category, config.keywords, 2, 2);
  if (items.length >= MIN_RESULTS) return items;

  const mergedArticles = [...primaryArticles];
  console.info(`[news] category=${category} stage=fallback query=${config.fallback}`);
  mergedArticles.push(
    ...await fetchGnews(
      { q: config.fallback, in: "title,description", sortby: "publishedAt", max: String(MAX_RESULTS) },
      apiKey,
    ),
  );

  items = buildRankedItems(mergedArticles, category, config.keywords, 1, 2);
  if (items.length >= MIN_RESULTS) return items;

  const overviewFallback = cache.get("All")?.items ?? [];
  if (overviewFallback.length > 0) {
    console.info(`[news] category=${category} stage=cache-fallback source=All`);
    const categoryFallback = overviewFallback.filter((item) => item.category === category);
    if (categoryFallback.length >= MIN_RESULTS) {
      return categoryFallback.slice(0, MAX_RESULTS);
    }
    if (overviewFallback.length >= MIN_RESULTS) {
      return overviewFallback.slice(0, MAX_RESULTS).map((item, index) => ({
        ...item,
        category,
        trending: index < 2,
      }));
    }
  }

  return items;
}

async function fetchOverviewNews(apiKey: string): Promise<NewsItem[]> {
  const collected: GnewsArticle[] = [];

  console.info(`[news] category=All stage=primary query=${OVERVIEW_QUERY.primary}`);
  collected.push(
    ...await fetchGnews(
      { q: OVERVIEW_QUERY.primary, in: "title,description", sortby: "publishedAt", max: "18" },
      apiKey,
    ),
  );

  let items = buildOverviewItems(collected);
  if (items.length >= MAX_RESULTS) return items;

  console.info(`[news] category=All stage=fallback query=${OVERVIEW_QUERY.fallback}`);
  collected.push(
    ...await fetchGnews(
      { q: OVERVIEW_QUERY.fallback, in: "title,description", sortby: "publishedAt", max: "18" },
      apiKey,
    ),
  );

  items = buildOverviewItems(collected);
  if (items.length > 0) return items;

  console.info(`[news] category=All stage=topoff query=${GENERAL_FALLBACK_QUERY}`);
  collected.push(
    ...await fetchGnews(
      { q: GENERAL_FALLBACK_QUERY, in: "title,description", sortby: "publishedAt", max: "18" },
      apiKey,
    ),
  );

  return buildOverviewItems(collected);
}

export async function fetchNewsForScope(scope: NewsScope = "All"): Promise<NewsItem[]> {
  const cached = cache.get(scope);
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS && cached.items.length > 0) {
    return cached.items;
  }

  if (cached && now - cached.at < REQUEST_COOLDOWN_MS && cached.items.length > 0) {
    return cached.items;
  }

  const pending = inflight.get(scope);
  if (pending) {
    return pending;
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error("GNEWS_API_KEY is not configured");
    return cached?.items ?? cache.get("All")?.items ?? [];
  }

  const request = (scope === "All" ? fetchOverviewNews(apiKey) : fetchCategoryNews(scope, apiKey))
    .then((items) => {
      if (items.length > 0) {
        cache.set(scope, { at: Date.now(), items });
        return items;
      }
      return cached?.items ?? cache.get("All")?.items ?? [];
    })
    .finally(() => {
      inflight.delete(scope);
    });

  inflight.set(scope, request);
  return request;
}

export const getNewsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: NewsScope } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    const scope = data.category && (data.category === "All" || ALL_CATEGORIES.includes(data.category))
      ? data.category
      : "All";
    const items = await fetchNewsForScope(scope);
    return { items, cachedAt: Date.now(), category: scope };
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

export const ALL_CATEGORIES_RE = ALL_CATEGORIES;
