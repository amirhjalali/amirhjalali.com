# Notes Agent Team Runbook

## Objective
Build a personal notes system that is:
- Easy to reference quickly
- Easy to summarize accurately
- Easy to consume in short and long forms

This runbook assumes a **single-user** system (you are the only user).

## Team Roles
Use the notes-focused agents defined in `/Users/amirjalali/amirhjalali.com/AGENTS.md`:
1. `notes-goal-architect`
2. `notes-ingestion-auditor`
3. `notes-retrieval-auditor`
4. `notes-synthesis-editor`
5. `notes-reference-ux-reviewer`
6. `notes-single-user-optimizer`
7. `notes-team-orchestrator`

## Execution Order
Run the team in this order:
1. Goal definition
2. Ingestion reliability audit
3. Retrieval quality audit
4. Synthesis quality audit
5. Reference UX audit
6. Single-user simplification pass
7. Consolidated roadmap

## Required Output Format
Each specialist should produce:
1. Findings (severity-ranked)
2. Evidence (file + line references)
3. Recommended changes
4. Impact on:
   - Findability
   - Summary quality
   - Consumption speed

The orchestrator should produce:
1. Unified top 10 priorities
2. 2-week implementation plan
3. “Definition of done” per priority
4. Risks and dependencies

## Single-User Product Rules
- Favor simplicity over extensibility.
- Avoid multi-tenant patterns unless strictly required.
- Optimize for one-person workflows: quick capture, quick retrieval, weekly synthesis.
- Every major feature should improve at least one of:
  - `time_to_find_answer`
  - `summary_trustworthiness`
  - `reading_friction`

## Suggested Success Metrics
- 80% of common questions answerable in under 30 seconds
- 90% of processed notes include useful summary + key insights
- Weekly digest can be reviewed in under 10 minutes
- Failed-processing notes reduced week over week

## Cadence
- Weekly: full team audit on changed areas
- Daily (lightweight): ingestion + retrieval spot checks
- Monthly: synthesis quality and UX recalibration

