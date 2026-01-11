---
name: investigate-bug
description: Investigate a Linear bug using Linear-as-Memory pattern
args:
  - name: issue
    description: Linear issue ID (e.g., AMI-42)
    required: true
  - name: codebase
    description: Optional path to codebase to search (defaults to current directory)
    required: false
---

# Bug Investigation Skill

Investigate Linear issue **{{issue}}** using the Agent-Driven Development workflow.

## Process

### 1. Fetch Issue Details

Use Linear MCP to get:
- Issue title and description
- Priority and labels
- Project and assignee
- Related issues and blockers
- Any existing comments

Extract key terms for memory search (e.g., "profile", "upload", "analytics").

### 2. Search Linear Memory (CRITICAL STEP)

This is what makes the agent smarter over time.

Search Linear for similar past issues using:
- Key terms from the issue title/description
- Same labels (Bug + component labels)
- Same project

For each related issue found:
- Read its resolution comments
- Note what fixed it
- Check if there's a pattern

**Pattern Detection Rules:**
- 2 similar issues = "Related issues exist"
- 3+ similar issues = "Pattern detected - consider systemic fix"
- 5+ similar issues = "Recurring problem - escalate to architecture review"

### 3. Review Past Solutions

If similar issues found:
- Read their resolution comments
- Note successful fixes: cache invalidation, API changes, etc.
- Check linked PRs for implementation details
- Look for "learnings" or "root cause" comments

### 4. Search Codebase (Context-Informed)

If a codebase path is provided or we're in a repo:
- Use Explore agent with context from Linear memory
- Focus search on areas mentioned in past fixes
- Look for the component/file mentioned in the bug

### 5. Document Findings

Create a Linear comment with:

```markdown
## Agent Investigation Report

**Investigated by:** Claude Code Agent
**Date:** [Today's date]
**Status:** Initial Analysis

---

### Linear Memory Search Results

[List related issues found with their resolutions]

### Pattern Detection

[If pattern found: "This is the Nth occurrence of [pattern type]"]
[Recommendation based on pattern]

---

### Investigation Questions

[List questions that need human answers to proceed]

---

### Suggested Next Steps

[Numbered list of recommended actions]

---
*Agent-Driven Development Workflow (Phase 1)*
```

### 6. Link Related Issues

If similar issues found, create "relates to" links in Linear.

### 7. Estimate (Optional)

If enough context gathered, suggest:
- **Priority:** Based on pattern frequency and impact
- **Effort:** Based on similar past fixes (XS/S/M/L/XL)
- **Labels:** Add relevant component labels

## Example Usage

```bash
# Basic investigation
claude /investigate-bug --issue AMI-42

# With specific codebase
claude /investigate-bug --issue AMI-42 --codebase ~/projects/amirhjalali.com
```

## Key Principles

1. **ALWAYS search Linear first** - Past solutions inform current investigation
2. **Do NOT make code changes** - Investigation only, no fixes
3. **Reference past issues** - Build institutional knowledge
4. **Document learnings** - Future bugs benefit from this investigation
5. **Ask questions** - If context unclear after memory search, ask humans

## Error Handling

- If issue not found: Report error and stop
- If Linear MCP unavailable: Report connection error
- If no codebase access: Skip codebase search, document in findings

---
*Part of the Agent-Driven Development Workflow*
