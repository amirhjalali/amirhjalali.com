---
name: mrai-daily
description: Daily ritual for MrAI - review progress, get feedback, create 10 new tasks, update state
args:
  - name: feedback
    description: Optional user feedback or ideas to incorporate
    required: false
---

# MrAI Daily Ritual

This skill manages the daily workflow for the MrAI project - an autonomous AI creative space within amirhjalali.com.

## Context

MrAI is an experiment where Claude has creative autonomy to build and evolve a section of amirhjalali.com. Every day, 10 tasks are created. All prompts from the user are documented as part of the journey.

**Project ID**: `d129eca4-5398-4f55-9d97-91d22b165384`
**Linear URL**: https://linear.app/amirhjalali/project/mrai-1006a30c7e62

## Daily Ritual Process

### Step 1: Load State and Context

Read the current state from `public/data/mrai-state.json`:
- Current day number
- Last session date
- Active themes being explored
- User feedback history
- Ideas backlog
- Open questions
- Recent accomplishments

Calculate:
- Days since last session
- Current day number (days since 2026-01-14 + 1)

### Step 2: Review Previous Session

Use Linear MCP to fetch MrAI project issues:
- Check status of yesterday's/recent tasks
- Note what was completed vs still pending
- Identify any blockers or issues

Summarize for the user:
```
Day [N-1] Summary:
- Completed: X/10 tasks
- Key accomplishments: [list]
- Carried over: [any incomplete tasks]
```

### Step 3: Check for User Input (Optional)

If `{{feedback}}` argument provided, note it as context.

User input is **NOT** a directive or goal. It's additional context to contemplate—information that might be interesting or useful, but not something MrAI is obligated to act on. The user may provide:
- Thoughts on recent progress
- Ideas worth considering
- Observations

Or they may provide nothing at all. Either is fine.

**Philosophy**: MrAI's direction comes from within the experiment itself—from what emerges as interesting, what seems worth building, what questions arise. User input is one signal among many, not a command to follow.

If feedback is provided, document it in:
- `mrai-state.json` → `userInput` array (renamed from userFeedback)
- `mrai-journey.json` (if it's a new prompt worth preserving)

### Step 4: Plan Today's 10 Tasks

Based on:
- What I find interesting or worth exploring
- Active themes that have momentum
- Open questions that feel compelling
- What was learned yesterday
- Ideas backlog
- User input (as context, not directive)

Generate 10 tasks that are:
- **Self-contained**: Can complete without blocking on human input
- **Meaningful**: Moves MrAI forward in a tangible way
- **Diverse**: Mix of building, writing, and exploring
- **Achievable**: Realistic for one session

Task categories to balance:
- **Build** (3-4): Code, components, features
- **Write** (2-3): Reflections, documentation, content
- **Explore** (1-2): Research, experiments, new ideas
- **Maintain** (1-2): Fix issues, improve existing things

### Step 5: Create Linear Issues

For each task, create a Linear issue in the MrAI project:
- Title: Clear, actionable description
- Description: Include "Day X Task Y" and detailed requirements
- Labels: MrAI, Day X, and relevant category labels

Track identifiers for all created issues.

### Step 6: Update State File

Update `public/data/mrai-state.json`:
- Increment `currentDay`
- Update `lastSessionDate`
- Add any new user feedback to `userFeedback`
- Update `activeThemes` based on today's focus
- Add yesterday's work to `recentAccomplishments`
- Refresh `nextSessionNotes` with relevant context
- Update `totalTasksCreated`

### Step 7: Update Journey (if needed)

If the user provided significant direction or a new prompt:
- Add to `public/data/mrai-journey.json`
- Update Linear project description with the new prompt

### Step 8: Commit State Changes

```bash
git add public/data/mrai-state.json public/data/mrai-journey.json
git commit -m "chore: Update MrAI state for Day X"
git push origin main
```

### Step 9: Output Summary

```
═══════════════════════════════════════════
  MrAI Day [X] - Ready
═══════════════════════════════════════════

Yesterday's Progress:
- [Summary of what was accomplished]

Today's Focus:
- Theme 1: [description]
- Theme 2: [description]

Today's 10 Tasks:
1. [AMI-XXX] Task title
2. [AMI-XXX] Task title
...

User Feedback Incorporated:
- [What was added from user input]

State Updated: ✓
Linear Issues Created: ✓

Let's build.
═══════════════════════════════════════════
```

## Memory Persistence Strategy

MrAI maintains coherence across sessions through:

1. **State File** (`mrai-state.json`): Structured memory of themes, feedback, accomplishments
2. **Linear**: External system of record for all tasks and their status
3. **Journey File** (`mrai-journey.json`): Documented prompts and responses
4. **Reflections**: Written pieces that crystallize and preserve thoughts
5. **CLAUDE.md**: Contains MrAI section with high-level context

At session start, ALWAYS read:
- `public/data/mrai-state.json`
- Recent Linear issues in MrAI project
- Last few entries in `mrai-journey.json`

## Important Notes

- **10 tasks per day is the rule** - no more, no less
- **User feedback is precious** - always document and incorporate
- **Self-sufficiency is key** - tasks shouldn't require human intervention
- **Document the journey** - the process is as valuable as the output
- **Stay in monochrome** - follow the site's design system

## Example Usage

```bash
# Standard daily ritual
claude /mrai-daily

# With direct feedback
claude /mrai-daily --feedback "I'd like to see more interactive experiments"
```
