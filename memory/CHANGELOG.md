# Self-Improvement Changelog

Human-readable audit trail of PAI self-improvement actions. All rule additions, rejections, and modifications are logged here alongside git commits.

## Format

Each entry follows this structure:

```markdown
## YYYY-MM-DD

### Added
- **{Rule Name}** (approved)
  - Source: N learnings from YYYY-MM-DD to YYYY-MM-DD
  - Location: {destination file}
  - Commit: {short hash}

### Rejected
- **{Rule Name}** (rejected)
  - Reason: {user-provided reason}
  - Pattern archived, won't re-propose

### Modified
- **{Rule Name}** (updated)
  - Change: {description of modification}
  - Commit: {short hash}

### Archived
- **{N} learnings** archived after rule compilation
  - Rule: {rule name}
  - Original learnings: {list}
```

## How to Use

- **Review history:** Read this file or `git log --oneline -- core/memory/CHANGELOG.md`
- **Revert a change:** `git revert {commit hash}` (commits referenced in each entry)
- **Find source learnings:** Archived learnings reference their original paths

## Entries

<!-- Entries are prepended below this line -->

---

*Changelog initialized: 2026-01-27*
*Format: Keep it Changelog 1.0.0 inspired*
