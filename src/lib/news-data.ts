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
  body: string[];
  trending?: boolean;
};

const img = (id: string, w = 800, h = 450) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const NEWS: NewsItem[] = [
  {
    id: "rbi-repo-rate",
    headline: "RBI maintains repo rate at 6.5%, signals focus on inflation targets",
    summary:
      "The Monetary Policy Committee voted 5-1 to keep the policy repo rate unchanged, continuing its stance on withdrawal of accommodation to ensure inflation aligns with the 4% target.",
    source: "Bloomberg",
    category: "Economy",
    readTime: 4,
    thumbnail: img("photo-1554224155-6726b3ff858f"),
    whyItMatters:
      "Stable rates suggest cautious optimism for Indian corporate earnings, though borrowing costs for expansion remain elevated for the next quarter.",
    keyTakeaway:
      "Rate cuts unlikely before Q2 FY26. Plan capex and treasury at current cost of funds.",
    publishedAt: "2h ago",
    trending: true,
    body: [
      "Mumbai — The Reserve Bank of India's six-member Monetary Policy Committee (MPC) on Thursday voted to maintain the policy repo rate at 6.5%, marking the eleventh consecutive meeting at which the benchmark has been held steady.",
      "Governor Shaktikanta Das, in his post-policy address, reiterated that the committee remains 'unambiguously focused' on bringing headline inflation durably to the 4% target, citing persistent food-price pressures and uneven monsoon patterns as primary risks.",
      "Markets reacted modestly, with the Nifty 50 closing flat and the 10-year G-Sec yield easing two basis points to 6.84%. Economists at Nomura and Goldman Sachs pushed back their first rate cut call to the second quarter of FY26.",
      "'The MPC is buying time,' said Sonal Varma, chief economist at Nomura. 'They want to see Q4 inflation print under 5% before pivoting.' Banks, meanwhile, will likely continue passing on tight liquidity conditions to corporate borrowers.",
    ],
  },
  {
    id: "openai-funding",
    headline: "OpenAI eyes $100B valuation in new funding round led by Thrive Capital",
    summary:
      "Altman's AI powerhouse continues to defy market gravity, seeking capital to fund massive compute requirements for next-generation reasoning models.",
    source: "The Information",
    category: "AI",
    readTime: 6,
    thumbnail: img("photo-1677442136019-21780ecad995"),
    whyItMatters:
      "This valuation benchmarks the entire AI sector and pressures competitors like Anthropic and Google to maintain aggressive deployment cycles.",
    keyTakeaway:
      "Expect a fresh wave of enterprise AI pricing pressure as funded incumbents race to deploy.",
    publishedAt: "4h ago",
    trending: true,
    body: [
      "OpenAI is in advanced talks to raise a new funding round at a valuation north of $100 billion, according to people familiar with the discussions, with Thrive Capital expected to lead a tranche of approximately $1 billion.",
      "The round would more than triple the company's last reported valuation and place it among the most highly valued private companies in history, behind only ByteDance and SpaceX.",
      "Proceeds are expected to fund a multi-year buildout of training infrastructure, including a previously reported partnership with Microsoft and Oracle on a 5-gigawatt data center campus.",
    ],
  },
  {
    id: "nvidia-earnings",
    headline: "Nvidia earnings preview: Wall Street braces for high-stakes quarterly update",
    summary:
      "Analysts expect data-center revenue to top $30B as hyperscalers continue accelerating GPU deployments for generative AI workloads.",
    source: "Financial Times",
    category: "Technology",
    readTime: 3,
    thumbnail: img("photo-1518770660439-4636190af475"),
    publishedAt: "6h ago",
    trending: true,
    body: [
      "Nvidia is set to report fiscal third-quarter results after the bell on Wednesday, in what is widely viewed as the single most important earnings event of the season.",
      "Consensus expectations call for revenue of $33.1 billion, up roughly 82% year-over-year, with data-center revenue accounting for approximately 88% of the total.",
      "Investors will be watching closely for commentary on Blackwell shipment timing, which CEO Jensen Huang previously characterized as 'in full production.'",
    ],
  },
  {
    id: "sensex-record",
    headline: "Sensex closes at fresh record as IT and banking stocks rally",
    summary:
      "BSE Sensex gained 482 points to settle above 82,000 for the first time, led by Infosys, TCS and HDFC Bank on hopes of a soft global landing.",
    source: "Economic Times",
    category: "Markets",
    readTime: 2,
    thumbnail: img("photo-1611974789855-9c2a0a7236a3"),
    whyItMatters:
      "Continued institutional inflows into Indian equities suggest FII sentiment is turning constructive ahead of Q3 results season.",
    publishedAt: "1h ago",
    body: [
      "Indian benchmark indices closed at fresh lifetime highs on Thursday, with the BSE Sensex crossing the 82,000 mark for the first time and the broader Nifty 50 settling above 25,100.",
      "IT majors led the charge after a positive read on US enterprise software spending, while private banks rallied on reduced concerns about unsecured lending stress.",
    ],
  },
  {
    id: "stripe-india",
    headline: "Stripe quietly expands India operations with new Bengaluru engineering hub",
    summary:
      "The payments giant is hiring across infrastructure, fraud and developer experience teams as it doubles down on emerging markets.",
    source: "TechCrunch",
    category: "Startups",
    readTime: 4,
    thumbnail: img("photo-1556742049-0cfed4f6a45d"),
    publishedAt: "8h ago",
    body: [
      "Stripe has signed a long-term lease for a 200,000 sq ft engineering campus in Bengaluru's Outer Ring Road corridor, signaling the company's largest-ever investment in India.",
      "The hub will house roughly 800 engineers by end of 2026, with focus areas including payments infrastructure, fraud detection and developer-facing APIs.",
    ],
  },
  {
    id: "eu-ai-act",
    headline: "EU AI Act enforcement begins: what business leaders need to know",
    summary:
      "First-tier obligations on prohibited AI practices took effect this week. Penalties for non-compliance can reach 7% of global annual revenue.",
    source: "Reuters",
    category: "Policy",
    readTime: 5,
    thumbnail: img("photo-1521737604893-d14cc237f11d"),
    whyItMatters:
      "Any company offering AI-enabled products to EU users — including non-EU firms — must now demonstrate compliance or face severe penalties.",
    keyTakeaway:
      "Audit your AI use cases against the prohibited list this quarter — penalties scale with revenue.",
    publishedAt: "10h ago",
    body: [
      "The European Union's landmark AI Act began phased enforcement this week, with the first set of obligations focusing on outright prohibitions of certain AI practices.",
      "Banned use cases include social scoring by public authorities, real-time biometric identification in public spaces (with narrow exceptions) and AI systems that exploit vulnerabilities of specific groups.",
    ],
  },
  {
    id: "boardroom-shifts",
    headline: "Wave of CEO transitions reshapes Fortune 500 leadership pipeline",
    summary:
      "A record 1,914 CEO exits were announced in the past 12 months, with internal successors winning 73% of seats — the highest share in a decade.",
    source: "Wall Street Journal",
    category: "Leadership",
    readTime: 4,
    publishedAt: "12h ago",
    body: [
      "Boards across the Fortune 500 are increasingly turning to internal candidates as they navigate generational transitions at the C-suite level.",
    ],
  },
];

export const TRENDING = NEWS.filter((n) => n.trending);

export const getNewsById = (id: string) => NEWS.find((n) => n.id === id);

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
