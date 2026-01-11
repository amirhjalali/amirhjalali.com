---
name: estimate-effort
description: Estimate priority and effort for a Linear issue based on similar past issues
args:
  - name: issue
    description: Linear issue ID (e.g., AMI-42)
    required: true
---

# Estimate Effort Skill

Estimate priority and effort for Linear issue **{{issue}}** using historical data.

## Process

### 1. Fetch Issue Details

Use Linear MCP to get:
- Issue title, description, and labels
- Current priority (if set)
- Project context
- Any investigation comments

### 2. Search for Similar Completed Issues

Search Linear for Done issues with:
- Similar keywords in title/description
- Same labels (Bug, Feature, Improvement)
- Same project

For each similar issue found, note:
- How long it took (created → done)
- What priority it was
- Any effort labels it had

### 3. Analyze Complexity

Based on issue description and similar issues, assess:

**Complexity Factors:**
- Single file vs. multiple files
- Frontend only vs. full-stack
- Has tests vs. needs new tests
- Isolated change vs. architectural
- Clear requirements vs. needs discovery

### 4. Generate Estimate

**Effort Scale:**
| Size | Time | Description |
|------|------|-------------|
| XS | < 2 hours | Typo fix, config change, simple bug |
| S | 2-4 hours | Single component fix, minor feature |
| M | 1-2 days | Multi-file change, moderate feature |
| L | 3-5 days | Complex feature, significant refactor |
| XL | 1+ week | Major feature, architectural change |

**Priority Recommendation:**
| Priority | Criteria |
|----------|----------|
| Urgent (P0) | Production down, security critical, blocking release |
| High (P1) | Major user impact, business critical, SLA risk |
| Medium (P2) | Standard work, planned features, non-critical bugs |
| Low (P3) | Nice-to-have, backlog items, minor improvements |

### 5. Update Linear Issue

Add a comment with the estimate:

```markdown
## Effort Estimate

**Estimated by:** Claude Code Agent
**Date:** [Today's date]

---

### Similar Past Issues

| Issue | Title | Time to Complete | Effort |
|-------|-------|------------------|--------|
| [List similar completed issues with their actual times] |

### Complexity Assessment

- **Scope:** [Single file / Multi-file / Architectural]
- **Testing:** [Has tests / Needs tests / Test changes only]
- **Dependencies:** [Isolated / Has dependencies]
- **Clarity:** [Clear requirements / Needs discovery]

### Recommendation

**Effort:** [XS/S/M/L/XL] ([time estimate])
**Priority:** [P0/P1/P2/P3] - [reason]

### Confidence Level

[High/Medium/Low] - [based on how many similar issues found]

---
*Ready for human approval to add to sprint*
```

### 6. Apply Labels (Optional)

If confidence is high, suggest adding effort label:
- `effort:xs`, `effort:s`, `effort:m`, `effort:l`, `effort:xl`

Do NOT apply without human confirmation.

## Example Usage

```bash
# Estimate a bug
claude /estimate-effort --issue AMI-42

# After running, human reviews and approves adding to sprint
```

## Key Principles

1. **Base estimates on historical data** - Not guessing
2. **Show your work** - List similar issues that informed estimate
3. **Include confidence level** - Be honest about uncertainty
4. **Human approves** - Never auto-add to sprint without approval

## Feeding Linear-as-Memory

When issues are completed, their actual time becomes data for future estimates. The more issues completed with effort labels, the more accurate future estimates become.

---
*Part of the Agent-Driven Development Workflow - Stage 6*
