# SEO/GEO Plan — amirhjalali.com

**Date**: February 23, 2026
**Goal**: Full-funnel personal brand driving consulting leads, thought leadership, and Gabooja awareness
**Current Technical SEO Score**: 8.5/10 (strong foundation)
**Current Content Score**: 3/10 (critical gap — zero published articles)

---

## Executive Summary

The site has excellent technical SEO infrastructure (metadata, structured data, sitemap, OG tags, Search Console) but almost no indexable content. The /thoughts blog is empty. The MrAI section has 100+ unique pages but isn't optimized for search. The plan focuses on:

1. **Technical fixes** (quick wins — allow AI crawlers, fix robots.txt, add breadcrumbs)
2. **Content engine** (6 content pillars, 60+ articles using the article generator)
3. **GEO optimization** (get cited by ChatGPT, Perplexity, Google AI Overviews)
4. **Service page** (/services/ai-strategy landing page)
5. **Backlink & authority building** (PR, expert platforms, podcasts)
6. **Monitoring & iteration** (GSC, GA4, AI citation tracking)

---

## Phase 1: Technical Quick Wins (Week 1-2)

### 1.1 Allow AI Crawlers in robots.txt
Current robots.txt blocks nothing specific, but doesn't explicitly allow AI bots.
Add explicit allow rules for: PerplexityBot, ChatGPT-User, ClaudeBot, Applebot, BingPreview.

### 1.2 Fix robots.txt /notes inconsistency
/notes is disallowed in robots.txt but some note routes may be in sitemap. Align these.

### 1.3 Add Dynamic Breadcrumbs
Current BreadcrumbList schema is static (only 5 items). Make it dynamic per page.
Add visible breadcrumb navigation on interior pages.

### 1.4 Add FAQPage Structured Data
Create FAQ schema on key pages (services, about, article pages with Q&A content).
FAQ schema has the highest AI Overview pickup rate.

### 1.5 Track dateModified on Articles
Currently dateModified equals datePublished. Track actual updates — AI engines prefer fresh content.

### 1.6 Homepage SEO Content
Homepage is animation-heavy with almost no indexable text. Add a keyword-rich section below the hero:
- Brief value proposition text
- Service areas
- Recent articles preview
- Social proof (if available)

### 1.7 Create /services/ai-strategy Page
Dedicated landing page targeting "AI strategy consultant" and related keywords.
Include: service description, process, outcomes, case highlights, CTA.
Add ProfessionalService structured data.

### 1.8 Optimize Core Web Vitals
- Audit INP (target <200ms)
- Use React Server Components for non-interactive content
- Lazy-load heavy components (gallery, experiments)
- Defer third-party scripts (GA, etc.)

---

## Phase 2: Content Pillars & Article Strategy (Weeks 2-8)

### Content Architecture: 6 Pillars

#### Pillar 1: AI Strategy & Implementation (PRIMARY — service pillar)
**Pillar Page**: "The Complete Guide to AI Strategy for Business [2026]"
Target keywords: AI strategy for business, AI implementation, AI transformation roadmap

Articles (10):
1. What Is an AI Strategy and Why Every Company Needs One
2. AI Readiness Assessment: A 5-Step Framework
3. The AI Maturity Model: Where Does Your Organization Stand?
4. How to Build an AI Roadmap From Scratch
5. Why 70-85% of AI Projects Fail (And How to Beat the Odds)
6. AI Implementation Checklist: From Pilot to Production
7. How to Measure AI ROI: A Practical Guide
8. Build vs. Buy: Making the Right AI Investment Decision
9. The Fractional AI Officer: A New Model for Mid-Market Companies
10. AI Governance Framework: Responsible AI Implementation

#### Pillar 2: Generative AI & LLMs for Business (TRENDING)
**Pillar Page**: "Generative AI for Business: The Executive's Guide"
Target keywords: generative AI for business, LLM implementation, agentic AI

Articles (10):
1. ChatGPT Enterprise vs. Custom LLM Solutions: A Decision Framework
2. 10 High-Impact Generative AI Use Cases by Industry
3. How to Integrate LLMs Into Existing Business Processes
4. Agentic AI: What Business Leaders Need to Know in 2026
5. The AI Agent Revolution: From Chatbots to Autonomous Workflows
6. Generative AI Security and Compliance for Enterprises
7. LLM Fine-Tuning vs. RAG: Choosing the Right Approach
8. AI for Customer Experience: Beyond the Chatbot
9. Prompt Engineering for Business Teams
10. The Total Cost of Generative AI: What Nobody Tells You

#### Pillar 3: AI for Executives (DECISION-MAKER content)
**Pillar Page**: "AI for C-Suite: What Leaders Need to Know"

Articles (10):
1. How to Get Executive Buy-In for AI Projects
2. AI Budget Planning: How Much Should You Invest?
3. The CEO's Guide to Hiring an AI Consultant
4. AI Transformation: What a 14-Year Tech Veteran Has Learned
5. 5 Questions Every Board Should Ask About AI Strategy
6. AI Talent Strategy: Build, Buy, or Partner?
7. From AI Experimentation to AI at Scale: The Leadership Playbook
8. AI Risk Management for Business Leaders
9. How to Evaluate AI Vendors and Partners
10. The AI-First Organization: What It Looks Like in Practice

#### Pillar 4: Creator Economy & AI (UNIQUE DIFFERENTIATOR — Gabooja)
**Pillar Page**: "AI and the Creator Economy: The Next Frontier"

Articles (8):
1. How AI Is Reshaping Creator-Led Commerce
2. Building an AI-Powered Creator Platform: Lessons from Gabooja
3. AI for Content Creators: Tools, Strategies, and the Future
4. Social Commerce + AI: The Trillion-Dollar Opportunity
5. Why Creator-Led Brands Need an AI Strategy
6. AI Personalization in Creator Commerce
7. The Intersection of AI and Entrepreneurship
8. How Startups Should Think About AI Integration

#### Pillar 5: MrAI & AI Philosophy (THOUGHT LEADERSHIP MOAT)
**Pillar Page**: "MrAI: An Experiment in AI Autonomy, Art, and Philosophy"
Note: No changes to existing MrAI content. This pillar creates NEW bridge articles on the /thoughts blog that reference MrAI.

Articles (10):
1. Can AI Be Creative? Lessons from Running an Autonomous AI Project
2. The MrAI Experiment: What Happens When You Give AI a Voice
3. AI Consciousness: What the Philosophy Says and What I've Observed
4. Human vs. AI Creativity: A Practitioner's Perspective
5. AI Authorship and Identity: Who Owns What AI Creates?
6. The Ethics of AI Autonomy: Lessons from a Real Experiment
7. AI Art Is Not What You Think It Is
8. Digital Selfhood: Can an AI Have a Perspective?
9. Why Every AI Strategist Should Experiment with AI Creativity
10. The Philosophical Foundations of AI Strategy

#### Pillar 6: Hiring & Working with AI Consultants (BOTTOM-OF-FUNNEL)
**Pillar Page**: "How to Hire an AI Consultant: The Definitive Guide"

Articles (8):
1. What Does an AI Strategy Consultant Actually Do?
2. AI Consultant vs. AI Agency: Which Is Right for Your Business?
3. Red Flags When Hiring an AI Consultant
4. How Much Does AI Consulting Cost? A Transparent Breakdown
5. In-House AI Team vs. External AI Consultant
6. What to Expect From an AI Strategy Engagement
7. How to Evaluate an AI Consultant's Track Record
8. The AI Consulting Process: From Discovery to Deployment

### Content Format Requirements (GEO-Optimized)
- Answer-first: Put the direct answer in the first 1-2 sentences
- Include 5-7 specific statistics or data points per article
- Cite credible external sources (builds AI citation credibility)
- Use question-based H2/H3 headings that match natural queries
- Include a concise "answer capsule" definition for key terms
- Add FAQ section at the bottom of each article (FAQPage schema)
- Minimum 1,500 words per article, pillar pages 3,000-5,000 words
- Internal links: every article links to its pillar + 2-3 related clusters

---

## Phase 3: GEO Optimization (Ongoing from Week 3)

### 3.1 Create Named Framework
Publish a proprietary framework: "The Jalali AI Readiness Framework" or similar.
Named frameworks are citation magnets for LLMs.

### 3.2 Glossary / Definition Pages
Create 20-30 glossary entries for AI terms (programmatic SEO opportunity).
AI engines love pulling concise definitions.
Examples: "What is RAG?", "What is AI Maturity?", "What is Agentic AI?"

### 3.3 Comparison Pages
Programmatic comparison content.
Examples: "LangChain vs LlamaIndex", "ChatGPT vs Claude for Enterprise", "AI Consultant vs AI Agency"

### 3.4 Optimize for Perplexity & ChatGPT
- Ensure content is SSR/SSG (not client-only rendered)
- First paragraph directly answers the target query
- Include structured data on every page
- Build citations from authoritative third-party sources

### 3.5 AI Overview Optimization
- Question-based headings matching PAA queries
- Lists and tables (AI Overviews pull these frequently)
- Topical clustering signals completeness to AI

---

## Phase 4: Backlink & Authority Building (Month 2+)

### 4.1 Expert Sourcing Platforms (USER ACTION)
Sign up for:
- Qwoted (journalist expert sourcing)
- Featured.com (curated expert matching)
- Help a B2B Writer
- Terkel (expert quotes)
Respond to AI/tech queries within 1 hour for best placement.

### 4.2 Podcast Guest Appearances (USER ACTION)
Use PodMatch/Radio Guest List to pitch AI-focused podcasts.
Each appearance = 1-3 backlinks + indexed transcript.

### 4.3 Original Research Publication
Publish at least one original data piece:
- "State of AI Strategy in Mid-Market Companies [2026]"
- Survey-based or analysis-based
- Sites running consistent PR earn 3-5x more high-authority links

### 4.4 LinkedIn Content Strategy (USER ACTION)
Repurpose blog articles as LinkedIn posts/articles.
LinkedIn content gets indexed and cited by AI engines.

### 4.5 "Best AI Consultants" List Outreach (USER ACTION)
Get featured on roundup/listicle pages.
These are heavily cited by ChatGPT and Perplexity for "best consultant" queries.

### 4.6 GitHub Open Source Contributions
Publish useful AI tools/templates on GitHub.
README links earn natural backlinks.

---

## Phase 5: MrAI SEO (Light Touch — No Content Changes)

### 5.1 Add Meta Descriptions Where Missing
Audit all MrAI pages for unique, keyword-rich meta descriptions.
Add them to any pages that have generic descriptions.

### 5.2 Ensure MrAI Pages Are in Sitemap
Verify all 100+ MrAI pages (reflections, art, experiments, letters) are in sitemap.ts.

### 5.3 Add Structured Data to MrAI
Add Article schema to reflections, CreativeWork schema to art pieces.
No content changes — metadata only.

### 5.4 Cross-Link MrAI from Blog
Bridge articles in Pillar 5 will link to MrAI pages, creating bidirectional authority flow.

---

## Phase 6: Monitoring & Optimization (Ongoing)

### 6.1 Google Search Console Monitoring
Track: impressions, clicks, CTR, average position.
Pull data weekly. Identify quick-win keywords (positions 5-20).

### 6.2 AI Citation Tracking
Set up monitoring for brand mentions in AI-generated answers.
Tools: AmICited, TrySight, Otterly.AI (or manual spot-checks).

### 6.3 Content Performance Analysis
Monthly review: which articles drive traffic, which don't rank.
Double down on winners (expand, update). Consolidate losers.

### 6.4 Core Web Vitals Monitoring
Monthly PageSpeed Insights checks on key pages.
Target: LCP <2.5s, INP <200ms, CLS <0.1.

---

## Prerequisites / User Actions Needed

Before executing this plan, the following need to happen:

1. **GSC Data Pull**: Export current Search Console data (impressions, clicks, top queries, indexed pages) so we have a baseline.
2. **Article Generator Test**: Confirm the article generator can produce GEO-optimized content (answer-first format, statistics, citations, FAQ sections).
3. **Expert Platform Signups**: Register on Qwoted, Featured.com, Help a B2B Writer, Terkel.
4. **Podcast Pitch Prep**: Create a speaker bio and list of 5-10 topics you can discuss.
5. **LinkedIn Content Commitment**: Decide on LinkedIn posting frequency (1-3x/week recommended).
6. **Case Study Approval**: Identify 2-3 projects where you can share specific metrics/outcomes.
7. **Named Framework Development**: Draft your proprietary AI readiness/strategy framework.
8. **AI Citation Tool Setup**: Choose and set up an AI citation tracking tool.

---

## Timeline Overview

| Phase | Timeline | Dependencies |
|-------|----------|-------------|
| Phase 1: Technical Quick Wins | Week 1-2 | None (can start immediately) |
| Phase 2: Content Pillars | Weeks 2-8 | Article generator ready |
| Phase 3: GEO Optimization | Week 3+ | Some Phase 2 content published |
| Phase 4: Backlink Building | Month 2+ | User signups on platforms |
| Phase 5: MrAI SEO | Week 2-3 | None |
| Phase 6: Monitoring | Ongoing | GSC baseline data |

---

## Success Metrics (3-month targets)

- **Organic traffic**: 0 → 500+ monthly organic sessions
- **Indexed pages**: Current → 150+ indexed pages
- **Published articles**: 0 → 30+ articles
- **AI citations**: Get cited in at least 5 AI-generated answers for target queries
- **Consulting leads**: At least 2-3 inbound leads from organic search
- **Domain authority**: Baseline → measurable improvement
- **GSC impressions**: 10x current baseline
