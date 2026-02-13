# CLAUDE.md

Personal portfolio site for Amir H. Jalali. Next.js 15, TypeScript, Tailwind CSS.
Live at https://amirhjalali.com (Coolify VPS, auto-deploys on push to main).

## Commands
```bash
npm run dev                   # Dev server (Turbopack)
npm run build                 # Production build
npm run lint                  # ESLint
npm run type-check            # TypeScript checks
npm run generate:published    # Regenerate published articles JSON
```

## Git Rules
- ALWAYS commit and push changes when completing a task
- Configure git before commits: `git config user.name "Amir H. Jalali" && git config user.email "amirhjalali@gmail.com"`
- Do NOT mention Claude AI or any AI assistance in commit messages
- Stage with `git add .`, commit with descriptive message, push to origin main

## Design System — STRICT
Dark monochrome only. Read `.claude/docs/design-system.md` before any UI work.
- NEVER use colored Tailwind classes: blue-*, green-*, red-*, yellow-*, purple-*
- NEVER use colored gradients or legacy ai-teal/ai-cyan/ai-green/ai-blue
- Colors: bg-[#050505], text-[#EAEAEA], text-[#888888], white/5, white/10, white/20
- Primary buttons: bg-white text-black. Secondary: bg-white/5 border-white/10

## MrAI
AI-driven creative space at `/mrai`. Read `.claude/docs/mrai.md` for full context.
- State: `public/data/mrai-state.json`
- Outbound tweets: `public/data/mrai-outbound.json`
- Twitter: @The_MrAI (https://x.com/The_MrAI)
- Linear Project ID: `d129eca4-5398-4f55-9d97-91d22b165384`
- Use `/mrai-daily` skill for daily ritual sessions
- Read state files only when needed for the specific task — not every session

## Linear MCP
Two workspaces — use the correct tools:
- `mcp__linear-server__*` → **Amir H. Jalali** (Personal) — MrAI, this repo. Team ID: `3eee41c7-4cfd-4bca-94d7-d51af7573f33`
- `mcp__plugin_linear_linear__*` → **Gabooja** (Professional). Team ID: `6d8a377d-b1a0-4c28-90b0-974428528c9d`

## Reference Docs (read on-demand, not every session)
- `.claude/docs/design-system.md` — Full color palette, component patterns, typography
- `.claude/docs/mrai.md` — MrAI memory system, file structure, daily ritual
- `.claude/docs/deployment.md` — Coolify setup, env vars, database schema
