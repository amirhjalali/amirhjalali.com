---
name: review-pr
description: Review a GitHub PR with Linear context and automated checks
args:
  - name: pr
    description: PR number or URL (e.g., 123 or https://github.com/org/repo/pull/123)
    required: true
  - name: focus
    description: Optional review focus area (security, performance, tests, all)
    required: false
    default: "all"
---

# Review PR Skill

Review GitHub PR **{{pr}}** with Linear context and automated analysis.

## Process

### 1. Fetch PR Details

Use GitHub CLI to get:
- PR title, description, and author
- Changed files and diff stats
- CI/CD status
- Existing reviews and comments
- Linked issues (from PR body or branch name)

```bash
gh pr view {{pr}} --json title,body,author,files,additions,deletions,baseRefName,headRefName,statusCheckRollup,reviews
gh pr diff {{pr}}
```

### 2. Extract Linear Issue Context

Parse PR title/branch for Linear issue ID (e.g., `AMI-42`).

If found, fetch from Linear:
- Original issue description and requirements
- Acceptance criteria
- Priority and labels
- Investigation comments (what was discovered)

This provides **context for what the PR should accomplish**.

### 3. Analyze the Diff

#### Code Quality Checks

**Syntax & Style:**
- Consistent formatting
- No debug statements (`console.log`, `print`, `debugger`)
- No commented-out code blocks
- Proper error handling

**Security Checks:**
- No hardcoded secrets/credentials
- No SQL injection vulnerabilities
- Proper input validation
- Secure authentication patterns
- No exposed sensitive data in logs

**Performance Checks:**
- No N+1 query patterns
- Efficient loops (no unnecessary iterations)
- Proper async/await usage
- No memory leaks (event listeners, subscriptions)

**Testing:**
- Tests added for new functionality
- Tests updated for changed behavior
- No skipped tests added
- Adequate coverage for critical paths

#### Dependency Check

If package files changed:
- List new dependencies
- Flag for security review
- Note if dev vs. production dependency

### 4. Compare Against Issue Requirements

Using Linear issue context:
- Does the PR address the reported problem?
- Are all acceptance criteria covered?
- Any scope creep (work beyond the issue)?
- Any missing pieces?

### 5. Generate Review Report

Post as a comment on the PR:

```markdown
## Automated PR Review

**Reviewed by:** Claude Code Agent
**Date:** [Today's date]
**Linear Issue:** [AMI-XX](link) - [Title]

---

### Summary

[1-2 sentence summary of what this PR does]

### Issue Alignment

| Requirement | Status |
|-------------|--------|
| [From issue description] | Addressed / Partial / Missing |

### Code Review Findings

#### Looks Good
- [Positive observations]

#### Suggestions
- **[file:line]** - [suggestion]

#### Issues Found
- **[file:line]** - [issue description]

### Security Review

[Pass / Concerns Found]
- [Any security observations]

### Test Coverage

[Adequate / Needs Improvement]
- [Test observations]

### New Dependencies

[None / List with notes]

---

### Recommendation

**[APPROVE / REQUEST_CHANGES / COMMENT]**

[Reasoning for recommendation]

---
*Agent-Driven Development Workflow - Automated Review*
```

### 6. Update Linear Issue

Add comment to linked Linear issue:
```markdown
## PR Review Completed

**PR:** #[number] - [title]
**Recommendation:** [APPROVE/REQUEST_CHANGES/COMMENT]

[Brief summary of findings]

[Link to full review on GitHub]
```

## Review Focus Modes

### `--focus security`
Prioritize:
- Authentication/authorization code
- Input validation
- Data sanitization
- Credential handling
- API security

### `--focus performance`
Prioritize:
- Database queries
- Loop efficiency
- Memory usage
- Caching opportunities
- Async patterns

### `--focus tests`
Prioritize:
- Test coverage
- Test quality
- Edge cases
- Mocking patterns
- Integration tests

### `--focus all` (default)
Full review across all areas.

## Example Usage

```bash
# Review by PR number
claude /review-pr --pr 123

# Review by URL
claude /review-pr --pr https://github.com/amirhjalali/amirhjalali.com/pull/123

# Security-focused review
claude /review-pr --pr 123 --focus security

# Performance-focused review
claude /review-pr --pr 123 --focus performance
```

## Review Guidelines

### Approve When:
- Code works as intended
- Tests are adequate
- No security concerns
- Minor suggestions only (can be addressed later)

### Request Changes When:
- Security vulnerabilities found
- Tests missing for critical paths
- Does not address the issue requirements
- Breaking changes without migration path
- Performance issues that will impact production

### Comment When:
- Suggestions for improvement (non-blocking)
- Questions about implementation choices
- Ideas for future enhancement
- Needs clarification before full review

## Key Principles

1. **Context matters** - Always check the Linear issue first
2. **Be constructive** - Explain why, not just what
3. **Prioritize** - Security > Correctness > Performance > Style
4. **Be specific** - Include file:line references
5. **Acknowledge good work** - Note what's done well

## Error Handling

- If PR not found: "PR #{{pr}} not found or no access"
- If no Linear issue linked: Proceed but note "No Linear issue linked"
- If gh not authenticated: "Please run `gh auth login` first"
- If large diff (>1000 lines): "Large PR - focusing on critical files"

---
*Part of the Agent-Driven Development Workflow - Stage 11*
