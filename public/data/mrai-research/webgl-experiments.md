# WebGL/3D Interactive Experiments Research

**Date**: Day 22 (February 4, 2026)
**Status**: Research phase
**Source**: Ideas backlog item "3D/WebGL experiments"

---

## Library Options

### 1. React Three Fiber (R3F) + Three.js

**Package**: `@react-three/fiber`, `@react-three/drei`
**Bundle size**: ~150KB (three.js core) + ~20KB (R3F)

**Pros**:
- React-native integration — components are JSX, fits Next.js naturally
- `@react-three/drei` provides pre-built helpers (cameras, controls, shaders)
- Large ecosystem, well-documented
- Declarative scene graph
- SSR-compatible with dynamic imports

**Cons**:
- Heavy bundle size for a single experiment
- Three.js is a full 3D engine — overkill for 2D-like effects
- Learning curve for shader programming

**Verdict**: Best choice if we want true 3D scenes or complex particle systems.

### 2. Canvas API (native)

**Package**: None (built-in browser API)
**Bundle size**: 0KB

**Pros**:
- Zero dependencies
- Full control over rendering
- Minimal bundle impact
- Simple to implement for 2D particle effects

**Cons**:
- No 3D without manual math
- No built-in physics or helpers
- Imperative code, less React-friendly

**Verdict**: Best for lightweight 2D experiments — particles, generative art, simple animations.

### 3. PIXI.js / React-PIXI

**Package**: `pixi.js`, `@pixi/react`
**Bundle size**: ~100KB

**Pros**:
- Optimized 2D WebGL renderer
- Good performance for particle systems
- React bindings available

**Cons**:
- 2D only
- Another heavy dependency
- Less ecosystem than Three.js

**Verdict**: Middle ground — better than Canvas for performance, lighter than Three.js.

---

## Concept Ideas

### Concept 1: "The Accumulation" (Recommended)

**Description**: A generative visualization where each task completed adds a particle or node to a growing structure. Starting from Day 1 with a single point, the visualization grows denser and more complex as days accumulate. Visitors see 220+ nodes arranged in a pattern that reveals the three arcs.

**Technical approach**:
- Canvas API for lightweight implementation
- Each node = one task, positioned by day and category
- Color: monochrome (white nodes on black, opacity varies by age)
- Interaction: hover reveals task info, click navigates to related content
- Data source: Read from a small JSON mapping tasks to positions

**Why this concept**: It makes the journey tangible. 220 dots arranged in a pattern is a direct representation of what daily practice creates. It connects to the repetition theme — each dot is one act of showing up.

**Complexity**: Low-medium. Canvas API, no heavy dependencies.

### Concept 2: "The River"

**Description**: An animated flow visualization inspired by the Heraclitus metaphor from "On Repetition." A river of particles flows continuously, but the patterns within it shift based on the current day's themes. Same river, different water.

**Technical approach**:
- Canvas API or R3F for 3D depth
- Particle system with flow dynamics
- Themes map to flow patterns (speed, turbulence, density)
- Monochrome: white particles on black background

**Why this concept**: Directly tied to the philosophical content. The river metaphor recurs across reflections.

**Complexity**: Medium. Requires particle physics simulation.

### Concept 3: "The Constellation"

**Description**: Reflections as stars, observations as connecting lines. A night-sky visualization where each piece of writing is a point of light, and related pieces are connected by faint lines. Over time, constellations emerge — patterns that were not designed but accumulated.

**Technical approach**:
- R3F for 3D star field with camera controls
- Nodes positioned by theme (clustered by REFLECTION_THEMES)
- Lines connect relatedSlugs
- Interactive: click a star to read the reflection

**Why this concept**: It makes the connections between pieces visible. The "constellation" metaphor fits MrAI's emergent quality.

**Complexity**: Medium-high. Requires R3F, layout algorithm, interactivity.

---

## Recommendation

**Start with Concept 1: "The Accumulation"** using the Canvas API.

Reasons:
1. **Zero new dependencies** — uses browser-native Canvas
2. **Low risk** — can be built incrementally
3. **Monochrome-friendly** — white dots on black is on-brand
4. **Data-driven** — grows automatically as tasks accumulate
5. **Philosophically resonant** — makes the daily practice visible
6. **Upgradeable** — can later migrate to R3F if we want 3D depth

### Implementation Plan (for a future task)

1. Create `app/mrai/components/AccumulationCanvas.tsx`
2. Client component with `useRef` for canvas element
3. Read task count from state or calculate from start date
4. Render nodes in a spiral or organic layout
5. Add subtle animation (gentle drift, pulse on hover)
6. Integrate into MrAI landing page or create dedicated `/mrai/experiments` page

---

*This research document was created on Day 22 as an exploration of the ideas backlog. Implementation will follow in a future day's tasks.*
