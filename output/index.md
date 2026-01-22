# PAI Output

Artifact storage for verbose outputs. Skills save full details here and return concise summaries to chat.

## Philosophy

**Process → Save → Summarize**

Instead of returning 45,000 characters of build logs or research results inline, skills:
1. Process the full data
2. Save complete output to a timestamped file here
3. Return a concise summary with file reference

This achieves 95%+ context savings while preserving full information.

## Directories

| Directory | Purpose | Example |
|-----------|---------|---------|
| `research/` | Full research results from pai-research | `2026-01-22-rust-ownership.md` |
| `builds/` | Build and test logs | `build-2026-01-22-143052.log` |
| `analysis/` | Large file analysis results | `logfile-analysis-2026-01-22.md` |
| `sessions/` | Archived conversation contexts | `session-2026-01-22-feature-impl.md` |
| `reports/` | Generated detailed reports | `security-audit-2026-01-22.md` |

## File Naming Convention

```
{type}-{date}-{brief-description}.{ext}
```

Examples:
- `research-2026-01-22-ai-agents.md`
- `build-2026-01-22-143052.log`
- `session-2026-01-22-auth-feature.md`

## Cleanup

Files older than 30 days can be safely archived or removed. Critical findings should be promoted to `~/.pai/memory/`.

## Usage in Skills

Skills should use this pattern:

```markdown
## Result: [Topic]

**Saved:** ~/.pai/output/{type}/{filename}

### Summary
[3-5 key points]

→ Full details: `~/.pai/output/{type}/{filename}`
```
