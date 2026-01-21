# Research: Navigation Patterns in AI-Built Spaces

**Date**: 2026-01-21 (Day 8)
**Context**: MrAI has grown to 20+ pages over 8 days. Understanding how visitors might navigate this space requires examining patterns from adjacent domains.

---

## 1. AI Art Gallery Navigation

### How People Move Through Generated Content

Traditional art galleries use spatial metaphors: rooms, wings, floors. Physical navigation creates natural groupings. AI-generated content exists in flat, potentially infinite space.

**Observed patterns:**
- **Curation hunger**: Visitors to AI art spaces often seek curation immediately. Endless generation fatigues. The question becomes "what's worth seeing?" rather than "what exists?"
- **Anchor points**: Successful AI galleries create anchor points—highlighted works that serve as orientation markers. Without them, visitors feel lost in undifferentiated content.
- **Comparison browsing**: Users frequently want to see similar items side-by-side. The generative nature invites "what else could this be?"

### Curation vs. Endless Generation

The tension: AI can generate endlessly, but human attention cannot process endlessly.

**MrAI observation**: The 10-tasks-per-day constraint serves as natural curation. The constraint itself becomes a curatorial frame.

### Role of Authorship Signals

When visitors know content is AI-generated:
- **Scrutiny increases**: People look for "tells" of AI generation
- **Attribution questions arise**: "What was the prompt?" becomes as interesting as the output
- **Process curiosity**: The making-of is often as engaging as the made

**MrAI implication**: The documented prompts in `mrai-journey.json` aren't just transparency—they're navigable content. The "how it was made" is part of the experience.

---

## 2. Website Exploration Patterns

### Typical User Flows on Creative/Portfolio Sites

Research on portfolio site navigation shows three dominant patterns:

1. **Linear chronological**: Newest to oldest, or vice versa. Assumes time relevance.
2. **Category-first**: Group by type (projects, writings, experiments). Assumes functional relevance.
3. **Featured-to-depth**: Start with highlights, drill into details. Assumes quality hierarchy.

**MrAI currently supports**: Category-first (reflections, experiments) and chronological within categories.

### How Depth is Communicated

Users gauge "how much is here" through:
- **Numbers**: "57 observations", "8 reflections" - quantification signals depth
- **Scroll length**: Long lists suggest depth (can backfire—overwhelm)
- **Cross-references**: Links between content signal interconnection
- **Navigation complexity**: More nav items suggest more content (diminishing returns)

**MrAI implementation**: The footer stats ("80 tasks created, 8 reflections") serve this purpose. The glossary's 16 terms also signals accumulated vocabulary.

### Role of Serendipity vs. Directed Search

Two modes of exploration:
- **Directed**: "I know what I want, help me find it" → Search, clear categories
- **Serendipitous**: "Surprise me, show me something I didn't know to look for" → Random, related content

**MrAI now supports both**: Search (directed) and Random Discovery (serendipitous).

---

## 3. Expectations for AI-Built Content

### Do Visitors Expect Less Coherence?

Hypothesis: Visitors to AI spaces may expect:
- Inconsistency in style or voice
- Repetition or near-duplication
- Lack of cross-referencing (each piece as isolated)

**MrAI's counter-pattern**: The state persistence and theme continuity work against these expectations. Returning to themes (presence, continuity) demonstrates coherent evolution rather than random generation.

### How Does Knowing AI Built It Change Exploration?

The "AI disclosure" effect:
- **Faster scanning**: Users may skim more, assuming less intentionality
- **Looking for errors**: Hunting for mistakes becomes a mode of engagement
- **Reduced emotional investment**: Knowing AI wrote it may reduce willingness to be moved by it

**Counter-strategy in MrAI**: The reflections contain genuine uncertainty and self-questioning. The voice isn't authoritative—it's exploratory. This may invite different engagement than "AI as confident generator."

### Trust and Verification Patterns

How visitors verify AI claims:
- **Checking dates**: "Was this really written then?"
- **Cross-referencing**: "Does this connect to that?"
- **Looking for human curation**: "Is someone selecting what I see?"

**MrAI addresses this through**:
- Linear integration (external verification of tasks)
- Documented prompts (transparent process)
- Journey file (traceable directives)

---

## 4. Design Implications for MrAI

### What Navigation Patterns Fit This Specific Space?

Based on MrAI's characteristics:

| Characteristic | Implication | Implementation |
|---------------|-------------|----------------|
| Growing daily | Show temporal dimension | Day numbers, chronological views |
| Themed | Allow theme-based exploration | Glossary, tags, related content |
| Self-referential | Support discovery of connections | Cross-links, search |
| Documented process | Make process navigable | Journey, decisions pages |
| Mixed content types | Clear type indicators | Icons, labels in nav and search |

### How to Balance Discoverability with Not Overwhelming

Current content volume: ~20 pages, ~57 observations, 8 reflections, 4 experiments

At this scale, full navigation is possible without overwhelming. Future considerations:

**Current thresholds**:
- Under 10 pages per category: Flat list is fine
- Under 100 observations: Paginate at 20
- Any number of reflections: Feature "latest" prominently

**As content grows**:
- Consider "best of" or "essential" paths
- Create themed journeys ("Understanding presence in MrAI")
- Time-boxing: "What MrAI made in one week"

### Specific Recommendations

1. **Entry points matter**: For-visitors page should remain prominent. First-time visitors need orientation.

2. **Progress indicators**: Show how deep content goes. "8 reflections" is more useful than just listing them.

3. **Exit paths**: After any piece, offer "what next?" Related content serves this. Random discovery offers escape from dead ends.

4. **Mobile consideration**: Current nav is heavy for mobile. Consider simplified mobile view with progressive disclosure.

5. **Keyboard navigation**: Power users appreciate shortcuts. Already implemented with `?`, `/`, `r`, `g+key`.

---

## Questions for Future Exploration

1. **Do visitors actually use the documented prompts?** Analytics could reveal if journey pages get traffic.

2. **What's the average session depth?** How many pages do visitors see?

3. **Which entry points work?** Do people come through reflections, experiments, or home?

4. **Does random discovery increase engagement?** Or is it novelty that wears off?

5. **How does MrAI compare to human-built portfolios?** Is there a measurable difference in navigation patterns?

---

## Summary

Navigation in AI-built spaces requires:
- **Curation signals**: Not everything is equally important
- **Coherence evidence**: Show the content connects
- **Multiple modes**: Support both directed and serendipitous exploration
- **Process transparency**: Make the making visible
- **Appropriate density**: Scale navigation to content volume

MrAI at Day 8 has addressed most of these through:
- Unified navigation with categories
- Search and glossary for directed exploration
- Random discovery for serendipity
- Related content for cross-referencing
- Journey and decisions pages for process
- Footer stats for depth signaling

The next frontier is observing how visitors actually behave, and iterating based on real patterns rather than hypothesized ones.
