export type Category =
  | "Markets"
  | "Business"
  | "AI"
  | "Startups"
  | "Technology"
  | "Economy"
  | "Policy"
  | "Leadership"
  | "Global";

export const ALL_CATEGORIES: Category[] = [
  "Markets",
  "Business",
  "AI",
  "Startups",
  "Technology",
  "Economy",
  "Policy",
  "Leadership",
  "Global",
];

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  category: Category;
  readTime: number;
  thumbnail?: string;
  whyItMatters?: string;
  keyTakeaway?: string;
  publishedAt: string;
  url: string;
  body: string[];
  trending?: boolean;
};

export type MarketTick = {
  symbol: string;
  label: string;
  changePct: number;
};

export const MARKET_SNAPSHOT: MarketTick[] = [
  { symbol: "SENSEX", label: "Sensex", changePct: 0.8 },
  { symbol: "NIFTY", label: "Nifty 50", changePct: 0.6 },
  { symbol: "NASDAQ", label: "Nasdaq", changePct: 1.1 },
  { symbol: "DXY", label: "Dollar Idx", changePct: -0.2 },
  { symbol: "OIL", label: "Brent", changePct: -0.4 },
  { symbol: "GOLD", label: "Gold", changePct: 0.3 },
];
