---
description: Neural Noir Design System Guidelines
---

# Neural Noir Design System

This document outlines the design principles and tokens for the "Neural Noir" aesthetic used in the Amir H. Jalali portfolio.

## Core Philosophy
- **Editorial Elegance:** High-contrast serif typography, generous whitespace.
- **Dark Mode Luxury:** Deep charcoal backgrounds, not pure black.
- **Glassmorphism:** Subtle translucency, blurred backdrops.
- **Neural/Data:** Noise textures, technical monospace accents.

## Design Tokens

### Colors ("Void" Theme)
- **Background:** `#050505` (Deep Charcoal)
- **Foreground (Text):** `#EAEAEA` (Vapor White)
- **Muted Text:** `#888888` (Neutral Grey)
- **Borders:** `rgba(255, 255, 255, 0.08)`
- **Surface/Cards:** `rgba(255, 255, 255, 0.03)` (Ultra-low opacity)
- **Hover Surface:** `rgba(255, 255, 255, 0.05)`

### Typography
- **Headlines (Serif):** `Cormorant Garamond`
  - Weights: 300 (Light), 400 (Regular), 600 (SemiBold)
  - Tracking: `-0.02em` (Tight)
  - Class: `font-serif`
- **Technical/Meta (Mono):** `JetBrains Mono`
  - Weights: 400 (Regular)
  - Tracking: `0.1em` (Wide)
  - Transform: Uppercase
  - Class: `font-mono`
- **Body (Sans):** `Inter`
  - Class: `font-sans`

### Visual Effects
- **Noise Overlay:** `.noise-overlay` (Fixed position, 3% opacity)
- **Spotlight:** `<Spotlight />` component (Mouse-following radial gradient)
- **Glassmorphism:** `backdrop-blur-md bg-white/5 border border-white/10`

### Components
- **GhostCard:** Minimalist card with hover glow and reveal effects.
- **Navigation:** Minimalist text links, hidden on homepage, top bar on inner pages.

## Usage Guidelines
1. **Always** use the `Spotlight` component and `.noise-overlay` on every page.
2. **Never** use colorful gradients for backgrounds; use them sparingly for text accents or subtle glows.
3. **Prioritize** `Cormorant Garamond` for all major headings.
4. **Use** `JetBrains Mono` for dates, tags, authors, and small labels.
