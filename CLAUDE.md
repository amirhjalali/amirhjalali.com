# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a modern personal portfolio website for Amir H. Jalali, built with Next.js 15, TypeScript, and Tailwind CSS. The site features AI-generated articles, project showcases, and professional experience highlights.

**Live Site:** https://amirhjalali.com (deployed on Coolify VPS)

## Project Structure

```
amirhjalali.com/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage with animated hero
│   ├── projects/            # Projects showcase
│   ├── thoughts/            # Blog articles
│   │   └── [id]/           # Dynamic article pages
│   ├── resume/             # Interactive resume
│   ├── contact/            # Contact form
│   ├── admin/              # Admin panel for articles
│   └── api/                # API routes
│       └── generate-article/ # AI article generation endpoint
├── components/              # React components
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── HeroEnhanced.tsx   # Homepage hero section
│   └── NavigationEnhanced.tsx
├── lib/                    # Utilities and helpers
│   ├── articles.ts        # Article management
│   └── utils/             # Helper functions
├── public/                # Static assets
│   ├── data/              # JSON data files
│   │   ├── published.json # Published articles
│   │   └── drafts.json    # Draft articles
│   └── images/            # Image assets
├── scripts/               # Build and automation scripts
│   └── generate-article-static.js  # AI article generator
└── .github/workflows/     # GitHub Actions
    ├── ai-article-generator.yml    # Daily AI content generation
    └── fetch-trending-topics.yml   # Topic queue updater
```

## Development Commands

### Local Development
```bash
npm run dev              # Start development server (with Turbopack)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### Content Management
```bash
npm run generate:published    # Generate published articles JSON
```

## Key Technical Details

1. **Next.js App Router**: Using Next.js 15 with full SSR/API route support (NOT static export)

2. **Deployment**: Coolify VPS at amirhjalali.com
   - Full Next.js features enabled (API routes, ISR, SSR)
   - Auto-deployment on push to main branch
   - Environment variables stored in Coolify

3. **AI Features**:
   - Server-side API route for article generation (`/api/generate-article`)
   - GitHub Actions workflow for automated daily article generation
   - Uses OpenAI GPT-4o-mini and DALL-E 3
   - Admin panel at `/admin` for managing drafts and publishing

4. **Tech Stack**:
   - Framework: Next.js 15.4.1
   - Language: TypeScript
   - Styling: Tailwind CSS
   - Animations: Framer Motion
   - UI: Radix UI (shadcn/ui)

5. **Environment Variables**:
   - `OPENAI_API_KEY` - Required for AI article generation
   - `ANTHROPIC_API_KEY` - Alternative AI provider
   - `NEXT_PUBLIC_ADMIN_USERNAME` - Admin panel username
   - `NEXT_PUBLIC_ADMIN_PASSWORD_HASH` - Admin panel password hash

## Working with the Codebase

- Articles are stored in `public/data/published.json` and `public/data/drafts.json`
- Images are in `public/images/` organized by section (projects, thoughts, etc.)
- The admin panel (`/admin`) allows managing article drafts and publishing
- AI-generated articles are created via API route or GitHub Actions workflow
- All pages use Next.js App Router with server components where possible

## Deployment (Coolify VPS)

The site is deployed to a Hostinger VPS using Coolify:
1. Push to main branch triggers auto-deployment
2. Coolify pulls latest code, runs `npm install && npm run build`
3. Starts server with `npm run start` on port 3000
4. SSL handled automatically via Let's Encrypt
5. Domain: amirhjalali.com

**Note**: GitHub Pages deployment is DISABLED (workflow file renamed to .disabled) because we need full Next.js features including API routes for AI generation.

## Git Workflow

Standard git workflow:
1. Make changes on feature branches or main branch
2. Commit with descriptive messages
3. Push to main branch for automatic deployment via Coolify

## Important Rules

### Always Commit and Push Changes
**ALWAYS commit any changes made to the repository with a descriptive message AND push to the remote repository.** When completing any task:
1. Stage all modified files using `git add .`
2. Commit with a concise but descriptive message summarizing the changes
3. Push the changes to the remote repository
4. Example:
   ```bash
   git add .
   git commit -m "Update projects page with new portfolio item"
   git push origin main
   ```
5. Do not leave changes uncommitted or unpushed

### Git Configuration
**IMPORTANT: Always configure git before making commits:**
```bash
git config user.name "Amir H. Jalali"
git config user.email "amirhjalali@gmail.com"
```

### Commit Message Guidelines
- Do NOT mention Claude AI, Claude Code, or any AI assistance in commit messages
- Use standard, professional commit messages without AI attribution
- Focus on describing the changes made, not the tool used to make them
- All commits should be attributed to the repository owner

## Design System & Style Guidelines

This site uses a **dark monochrome design system**. ALL UI components must follow these guidelines strictly.

### Color Palette (CRITICAL)
```
Background:     #050505 (near-black)
Primary Text:   #EAEAEA (off-white)
Muted Text:     #888888 (medium gray)
Borders:        white/10, white/20 (10-20% white opacity)
Backgrounds:    white/5, white/10 (5-10% white opacity)
Primary Button: bg-white text-black (inverted)
```

### NEVER Use These Colors
The following colors are **LEGACY** and must **NEVER** be used:
- ❌ `blue-*` (e.g., `text-blue-500`, `bg-blue-600`)
- ❌ `green-*` (e.g., `text-green-400`, `bg-green-500`)
- ❌ `red-*` (e.g., `text-red-500`, `bg-red-500`)
- ❌ `yellow-*` (e.g., `text-yellow-500`, `bg-yellow-400`)
- ❌ `purple-*` (e.g., `from-purple-600`, `to-purple-500`)
- ❌ `ai-teal`, `ai-cyan`, `ai-green`, `ai-blue` (legacy custom colors)
- ❌ Any gradient with colored endpoints (e.g., `from-blue-500 to-purple-600`)

### Use These Instead
Replace legacy colors with monochrome equivalents:
```
Success/Complete:  text-[#EAEAEA], bg-white/10, border-white/20
Error/Warning:     text-[#888888], bg-white/5, border-white/10
Processing:        text-[#EAEAEA], animate-spin for loaders
Primary Buttons:   bg-white text-black hover:bg-[#EAEAEA]
Secondary Buttons: bg-white/5 border-white/10 hover:bg-white/10
Icons:             text-[#888888] or text-[#EAEAEA]
Progress Bars:     bg-white (solid, no gradients)
```

### Typography
- **Headings**: `font-serif font-light` (elegant, minimal)
- **Body Text**: Default sans-serif
- **UI Labels**: `font-mono text-xs uppercase tracking-widest`
- **Code/Technical**: `font-mono text-sm`

### Component Patterns
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

### Before Submitting Code
Always verify:
1. No colored Tailwind classes (blue, green, red, yellow, purple)
2. No gradient backgrounds with colors
3. Icons use `text-[#888888]` or `text-[#EAEAEA]`
4. Buttons follow the primary/secondary patterns above
5. Progress indicators are solid white, not gradients