---
name: close-issue
description: Close a Linear issue with standard resolution documentation
args:
  - name: issue
    description: Linear issue ID (e.g., AMI-42)
    required: true
  - name: verified
    description: Comma-separated environments where fix was verified (e.g., "DEV,PRD" or "DEV" or "PRD")
    required: false
    default: "DEV,PRD"
  - name: description
    description: Optional brief description of what was fixed
    required: false
---

# Close Issue Skill

Close Linear issue **{{issue}}** with standard resolution documentation.

## Process

### 1. Fetch Issue Details

Use Linear MCP to get the current issue:
- Verify the issue exists
- Check current status (should be "In Progress" or "In Review")
- Get issue title for confirmation

### 2. Build Verification Checkmarks

Parse the `--verified` argument (default: "DEV,PRD"):
- DEV -> "DEV ✓"
- PRD -> "PRD ✓"
- STAGING -> "STAGING ✓"

Format as: `DEV ✓ | PRD ✓`

### 3. Create Resolution Comment

Add a comment with this format:

```markdown
## Resolution

**Status:** Fixed and Verified
**Verified in:** [environments with checkmarks]
**Verified by:** [Get from Linear user context or use "Team"]
**Date:** [Today's date in YYYY-MM-DD format]

[If description provided: Include the fix description here]

[If no description: "Fix confirmed working in verified environments."]
```

### 4. Update Issue Status

Move the issue status to "Done".

### 5. Confirm Closure

Output a summary:
- Issue identifier and title
- Previous status -> Done
- Link to the issue

## Example Usage

```bash
# Quick close (verified in DEV and PRD)
claude /close-issue --issue AMI-42

# Specify environments
claude /close-issue --issue AMI-42 --verified "DEV"

# With description
claude /close-issue --issue AMI-42 --description "Fixed null pointer in analytics calculation"

# Full options
claude /close-issue --issue AMI-42 --verified "DEV,STAGING,PRD" --description "Refactored date parsing logic"
```

## Error Handling

- If issue not found: Report error and stop
- If issue already Done: Report "Issue already closed" and stop
- If issue is Canceled: Report "Cannot close canceled issue" and stop
- If Linear MCP unavailable: Report connection error

## Linear-as-Memory Integration

When closing an issue, consider:
- Are there related issues that should also be checked/closed?
- Is this part of a pattern that was detected earlier?
- Should the resolution be linked to related issues?

If related issues exist, mention them in the resolution comment.

---
*Part of the Agent-Driven Development Workflow*
