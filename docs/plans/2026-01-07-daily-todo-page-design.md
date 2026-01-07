# Daily Todo Page Design

## Overview

A simple, beautiful daily todo page at `/today` for personal task management. Admin-only access, max 10 tasks, mobile-optimized.

## Data Model

### Database Schema

```sql
CREATE TABLE daily_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text          TEXT NOT NULL,
  position      INTEGER NOT NULL,        -- 0-9 for ordering
  completed_at  TIMESTAMP,               -- NULL if active, set when done
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()  -- Reset on any interaction
);
```

### Staleness Logic

Calculated on render based on `updated_at`:
- **Fresh** (touched today): Full brightness `text-[#EAEAEA]`
- **1 day old**: Slightly faded `text-[#BBBBBB]`
- **2-3 days old**: More faded `text-[#888888]`
- **4+ days old**: Very faded `text-[#555555]`

Any interaction (edit, reorder, bump) resets `updated_at` and restores freshness.

## Routes

| Route | Purpose |
|-------|---------|
| `/today` | Main todo page (protected) |
| `/today/archive` | Completed tasks history with analytics (protected) |
| `/api/tasks` | GET all active, POST new task |
| `/api/tasks?archived=true` | GET completed tasks |
| `/api/tasks/[id]` | PATCH update, DELETE task |

## Authentication

Reuse existing `getSession()` from `app/actions/auth.ts`. No session redirects to `/admin/login?redirectTo=/today`.

## Main Page UI (`/today`)

### Layout

- Clean header: "Today" in `font-serif font-light`
- Current date below in `text-[#888888] font-mono text-xs`
- Task list centered, max-width ~500px
- Small "Archive" link to access history

### Task Item

Single row per task:
- Drag handle (6 dots) on left for reordering
- Task text in middle (inline editable)
- Checkbox on right to mark complete

Text color indicates staleness - no extra UI clutter.

### Interactions

| Action | Behavior |
|--------|----------|
| Add task | Text input at bottom, Enter to add. Disabled at 10 tasks. |
| Edit task | Tap text to edit inline. Auto-saves on blur/Enter. |
| Reorder | Drag and drop. Updates position and resets staleness. |
| Complete | Tap checkbox. Animates out, moves to archive. |
| Delete | Swipe left (mobile) or X on hover (desktop). |

### Mobile Optimization

- Large touch targets (min 44px)
- Swipe gestures for delete
- Full viewport height
- Input fixed at bottom for thumb reach

## Archive Page (`/today/archive`)

### Stats Header

Three cards at top:

```
┌─────────────────────────────────────────┐
│  THIS WEEK        THIS MONTH      ALL   │
│     12               47           183   │
│  tasks done       tasks done    total   │
│                                         │
│  Avg: 2.4/day     Avg: 1.9/day         │
└─────────────────────────────────────────┘
```

Styled with `bg-white/5 border border-white/10` cards.

### Task History

Grouped by completion date (most recent first):

```
TODAY
────────────────────────────
✓ Review pull request          2:34 PM
✓ Reply to client email        11:15 AM

YESTERDAY
────────────────────────────
✓ Fix login bug                4:22 PM
```

Read-only display with strikethrough styling.

## File Structure

```
app/
├── today/
│   ├── page.tsx              # Server component, auth check
│   ├── TodayClient.tsx       # Client component with drag-drop
│   └── archive/
│       └── page.tsx          # Archive with stats
├── api/
│   └── tasks/
│       ├── route.ts          # GET all, POST new
│       └── [id]/
│           └── route.ts      # PATCH, DELETE
lib/
└── db/
    └── tasks.ts              # Database queries
```

## Dependencies

- `@dnd-kit/core` + `@dnd-kit/sortable` - Drag-and-drop with mobile support

## API Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/tasks` | Fetch active tasks (ordered by position) |
| GET | `/api/tasks?archived=true` | Fetch completed tasks |
| POST | `/api/tasks` | Create task (auto-assigns position) |
| PATCH | `/api/tasks/[id]` | Update text, position, or mark complete |
| DELETE | `/api/tasks/[id]` | Hard delete a task |

## Design System

Follows site's dark monochrome palette:
- Background: `#050505`
- Primary text: `#EAEAEA`
- Muted text: `#888888`
- Borders: `white/10`, `white/20`
- Cards: `bg-white/5 border border-white/10`
- Primary button: `bg-white text-black`

## Future Enhancements

Schema supports adding:
- Streaks
- Best day of week analytics
- Completion rate trends
- Clear old archives option
