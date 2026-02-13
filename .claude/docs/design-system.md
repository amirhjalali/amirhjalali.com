# Design System & Style Guidelines

This site uses a **dark monochrome design system**. ALL UI components must follow these guidelines strictly.

## Color Palette (CRITICAL)
```
Background:     #050505 (near-black)
Primary Text:   #EAEAEA (off-white)
Muted Text:     #888888 (medium gray)
Borders:        white/10, white/20 (10-20% white opacity)
Backgrounds:    white/5, white/10 (5-10% white opacity)
Primary Button: bg-white text-black (inverted)
```

## NEVER Use These Colors
The following colors are **LEGACY** and must **NEVER** be used:
- `blue-*`, `green-*`, `red-*`, `yellow-*`, `purple-*`
- `ai-teal`, `ai-cyan`, `ai-green`, `ai-blue` (legacy custom colors)
- Any gradient with colored endpoints (e.g., `from-blue-500 to-purple-600`)

## Monochrome Replacements
```
Success/Complete:  text-[#EAEAEA], bg-white/10, border-white/20
Error/Warning:     text-[#888888], bg-white/5, border-white/10
Processing:        text-[#EAEAEA], animate-spin for loaders
Primary Buttons:   bg-white text-black hover:bg-[#EAEAEA]
Secondary Buttons: bg-white/5 border-white/10 hover:bg-white/10
Icons:             text-[#888888] or text-[#EAEAEA]
Progress Bars:     bg-white (solid, no gradients)
```

## Typography
- **Headings**: `font-serif font-light` (elegant, minimal)
- **Body Text**: Default sans-serif
- **UI Labels**: `font-mono text-xs uppercase tracking-widest`
- **Code/Technical**: `font-mono text-sm`

## Component Patterns
```tsx
// Primary Button
<button className="px-4 py-2 bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-all font-mono text-xs uppercase tracking-widest">
  Button Text
</button>

// Secondary Button
<button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all font-mono text-xs uppercase tracking-widest">
  Button Text
</button>

// Modal/Card Background
<div className="glass border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md rounded-2xl">

// Progress Bar (no gradients!)
<div className="h-1 bg-white/10 rounded-full overflow-hidden">
  <div className="h-full bg-white" style={{width: `${progress}%`}} />
</div>

// Status Indicators (all monochrome)
const statusStyles = {
  pending: 'text-[#888888] bg-white/5 border-white/10',
  processing: 'text-[#EAEAEA] bg-white/5 border-white/20',
  completed: 'text-[#EAEAEA] bg-white/10 border-white/20',
  error: 'text-[#888888] bg-white/5 border-white/10',
}
```

## Before Submitting Code
Always verify:
1. No colored Tailwind classes (blue, green, red, yellow, purple)
2. No gradient backgrounds with colors
3. Icons use `text-[#888888]` or `text-[#EAEAEA]`
4. Buttons follow the primary/secondary patterns above
5. Progress indicators are solid white, not gradients
