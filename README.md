# Locus Intelligence — AI-Powered Executive Business Briefing

**Live Prototype:** [View App on Lovable](https://locus-intelligence.lovable.app)| **Product Walkthrough:** [Watch 35s Demo](link-to-your-demo-video-if-hosted)

A mobile-first, AI-powered business intelligence news application designed to turn daily market and technology noise into a calm, personalized 5-minute morning briefing for founders, investors, consultants, and product leaders.

---

## 1. The Product Problem & Target Persona
* **Target User:** Busy professionals (founders, analysts, consultants, executives) who need high-signal updates across Markets, AI, Startups, and Macroeconomy without doom-scrolling ad-heavy feeds.
* **Core Pain Points Solved:**
  1. **Information Overload:** Condenses long-form reporting into a **5-story, 2-minute Morning Briefing** and scannable **3-minute read** cards.
  2. **The "So What?" Gap:** Goes beyond basic summarization by generating a concrete **`Key Takeaway`** and **`Why This Matters`** strategic implication for each story.
  3. **Cold-Start Personalization:** Captures topic preferences during a zero-friction onboarding flow (`Markets`, `AI`, `Startups`, `Economy`, `Policy`) to immediately reorder feed tabs and recommendations.

---

## 2. Key Product Features (MVP)
* **Frictionless Onboarding & Interest Tailoring:** Executive sign-in flow with simulated session persistence (`Continue with Google` / `Skip Demo`) and multi-topic selection that dynamically prioritizes feed chips (`Tailored to Markets + AI`).
* **Live Market Snapshot & Real-Time News Feed:** Top-of-screen macro ticker (`Sensex`, `Nifty`, `Nasdaq`, `Dollar Index`, `Brent`, `Gold`) paired with live GNews API retrieval, topic-mapped keyword queries, and fallback logic.
* **Three-Tier AI Insight Layer (Lovable AI):**
  * **AI Summary:** Concise 2-sentence factual digest.
  * **Key Takeaway:** Actionable recommendation for operators and decision-makers.
  * **Why This Matters:** Second-order industry and competitive impact analysis.
* **Graceful In-App Reader & Fallbacks:** Embedded article viewer with reading-progress indicator and automatic fallback detection (`OPEN ORIGINAL`) when publishers block iframe embedding.
* **Morning Briefing, Search & Bookmarking:** Dedicated daily top-5 digest (`Briefing`), live keyword search with recent search chips (`Search`), and one-tap article saving (`Saved`).

---

## 3. Product Metrics & V2 Roadmap (Product Analytics Framing)

| Metric Category | Metric Definition | Target / Guardrail |
| :--- | :--- | :--- |
| **North Star** | **Briefing Completion Rate** (% of daily active users reading $\ge 3$ of 5 Morning Briefing stories) | $\ge 45\%$ |
| **Activation** | % of new users selecting $\ge 2$ interest topics and opening $\ge 1$ AI Insight card in Session 1 | $\ge 65\%$ |
| **Retention** | D7 and D30 Morning Briefing return rate | D7 $\ge 30\%$ |
| **Quality Guardrail** | Low-relevance / duplicate card impression rate across Trending & Recommended modules | $< 5\%$ |

### Planned V2 Improvements
1. **Cross-Module Deduplication & Source Tiering:** Filter out duplicate items between *Trending Now* and *Recommended For You* and apply domain authority weighting (prioritizing Reuters, FT, Bloomberg, RBI/regulatory releases over SEO blogs).
2. **Server-Side Search Execution:** Trigger live GNews API queries when trending search topics yield zero matches in the locally cached feed slice.
3. **Implicit Feedback Loop:** Re-rank topic chips dynamically based on `Key Takeaway` expansions, dwell time, and bookmarks.

---

## 4. Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS, Vite (built via Lovable)
* **Data & AI:** GNews API (real-time news ingestion), Lovable AI (on-demand summarization & strategic insight generation)
