---
name: create-pr
description: Create a GitHub PR with Linear issue linking and risk assessment
args:
  - name: issue
    description: Linear issue ID to link (e.g., AMI-42)
    required: true
  - name: base
    description: Base branch (default: main)
    required: false
    default: "main"
  - name: draft
    description: Create as draft PR (default: false)
    required: false
    default: "false"
---

# Create PR Skill

Create a GitHub PR for Linear issue **{{issue}}** with proper linking and risk assessment.

## Prerequisites

- Git repository with changes committed
- GitHub CLI (`gh`) authenticated
- Current branch has commits ready for PR

## Process

### 1. Fetch Linear Issue Details

Use Linear MCP to get:
- Issue identifier, title, and description
- Priority and labels
- Acceptance criteria (from description)
- Related issues

### 2. Verify Git State

Check:
- Current branch is not main/master
- There are commits to push
- Branch is up to date with remote (or needs push)

Expected branch naming: `[type]/[issue-id]-[description]`
Example: `fix/AMI-42-profile-picture-upload`

### 3. Analyze Changes for Risk Assessment

Run git diff against base branch to identify:

**Standard Changes (Low Risk):**
- Bug fixes in existing functions
- Test updates
- Documentation changes
- Style/formatting changes

**Notable Changes (Medium Risk):**
- New functions or components
- Modified API contracts
- Database schema changes
- Configuration changes

**High Risk Changes:**
- Security-sensitive code (auth, payments, encryption)
- Core business logic
- Shared utilities used by multiple features
- Breaking changes to public APIs

### 4. Check for New Dependencies

Scan for changes to:
- `package.json` / `package-lock.json`
- `composer.json` / `composer.lock`
- `requirements.txt` / `Pipfile`
- `go.mod` / `go.sum`

If new dependencies found, flag with: `NEW DEPENDENCIES`

### 5. Generate PR Content

**PR Title Format:**
```
[AMI-XX] Brief description of change
```

**PR Body Template:**
```markdown
## Summary

[2-3 bullet points describing what this PR does]

Fixes AMI-XX

## Risk Assessment

**Risk Level:** [Low / Medium / High]

**Standard Changes:**
- [List low-risk changes]

**Notable Changes:**
- [List medium-risk changes, if any]

**Review Focus Areas:**
- [Specific files/lines that need careful review]

## Test Plan

- [ ] [How to test this change]
- [ ] [Additional test scenarios]

## Checklist

- [ ] Tests pass locally
- [ ] No new warnings
- [ ] Self-reviewed the diff
- [ ] [If applicable] Documentation updated

---
Generated with Claude Code Agent
```

### 6. Create the PR

```bash
# Push branch if needed
git push -u origin [branch-name]

# Create PR
gh pr create \
  --title "[AMI-XX] Title" \
  --body "..." \
  --base {{base}} \
  [--draft if specified]
```

### 7. Update Linear Issue

- Add PR link as attachment to Linear issue
- Add comment: "PR created: [link]"
- Move issue status to "In Review"

### 8. Output Summary

```
PR Created Successfully

Title: [AMI-XX] Description
URL: https://github.com/org/repo/pull/123
Risk Level: [Low/Medium/High]
Linear Issue: Updated to "In Review"

Next Steps:
- Request review from team
- Monitor CI/CD pipeline
- Address review feedback
```

## Example Usage

```bash
# Standard PR
claude /create-pr --issue AMI-42

# Draft PR
claude /create-pr --issue AMI-42 --draft true

# PR against different base
claude /create-pr --issue AMI-42 --base develop
```

## Risk Assessment Guidelines

### Low Risk
- Single file changes
- Test-only changes
- Documentation updates
- Typo/style fixes
- Isolated bug fixes

### Medium Risk
- Multi-file changes
- New features (isolated)
- Refactoring existing code
- Configuration changes
- API additions (non-breaking)

### High Risk
- Security-related code
- Payment/billing logic
- Authentication/authorization
- Database migrations
- Breaking API changes
- Core algorithm changes
- Changes to shared utilities

## Error Handling

- If no commits: "No changes to create PR for"
- If on main branch: "Cannot create PR from main branch"
- If gh not authenticated: "Please run `gh auth login` first"
- If Linear issue not found: Proceed but warn about missing link

---
*Part of the Agent-Driven Development Workflow - Stage 10*
