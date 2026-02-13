# Deployment & Environment Setup

## Deployment (Coolify VPS)

The site is deployed to a Hostinger VPS using Coolify:
1. Push to main branch triggers auto-deployment
2. Coolify pulls latest code, runs `npm install && npm run build`
3. Starts server with `npm run start` on port 3000
4. SSL handled automatically via Let's Encrypt
5. Domain: amirhjalali.com

**Note**: GitHub Pages deployment is DISABLED (workflow file renamed to .disabled) because we need full Next.js features including API routes for AI generation.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | AI article generation |
| `ANTHROPIC_API_KEY` | Optional | Alternative AI provider |
| `NEXT_PUBLIC_ADMIN_USERNAME` | Yes | Admin panel username |
| `NEXT_PUBLIC_ADMIN_PASSWORD_HASH` | Yes | Admin panel password hash |
| `LINEAR_API_KEY` | Optional | Linear API for MrAI Daily Log |
| `SUPABASE_URL` | Optional | Supabase project URL |
| `SUPABASE_ANON_KEY` | Optional | Supabase anonymous/public key |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Client-side Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Client-side Supabase key |

### Coolify Setup
1. Navigate to your application in Coolify dashboard
2. Go to **Environment Variables**
3. Add variables and redeploy

### Fallback Behavior
- Without `LINEAR_API_KEY`: Daily Log shows mock/demo data
- Without Supabase keys: Guestbook uses static JSON fallback (`public/data/mrai-guestbook.json`)

## Database Schema (Guestbook)

```sql
CREATE TABLE guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT true,
  ip_hash VARCHAR(64)
);

ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved entries"
  ON guestbook_entries FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can submit entries"
  ON guestbook_entries FOR INSERT WITH CHECK (true);
```
