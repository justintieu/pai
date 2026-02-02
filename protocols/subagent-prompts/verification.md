# Verification Prompt Template

Use for: reviewing implementation output before presenting to user

## Template

```markdown
## Task
Review implementation: {summary from implementation manifest}

## Files to Check
{list from manifest outputs}

## Original Requirements
{from original task}

## Verification Checklist
- [ ] All requirements met
- [ ] No obvious bugs or edge cases missed
- [ ] Follows existing codebase patterns
- [ ] No security issues
- [ ] Tests pass (if applicable)

## Output Format
---
status: pass | fail
issues:
  - {issue if fail}
recommendation: "approve" | "fix: {what}" | "reject: {why}"
---
```

## Placeholder Reference

| Placeholder | Source |
|-------------|--------|
| {summary from manifest} | Implementation agent's manifest.summary |
| {list from outputs} | Implementation agent's manifest.outputs |
| {original requirements} | Original user request requirements |

## When to Use

**Always** spawn verifier before presenting implementation results to user.

This is not optional - it's the quality gate between subagent work and user-facing output.

## Verifier Chain Pattern

```
User Request
    |
    v
Implementation Subagent
    |
    v
Read manifest (status: complete)
    |
    v
Spawn Verifier Subagent <-- YOU ARE HERE
    |
    v
Verifier returns pass/fail
    |
    +-- If pass: Synthesize for user
    +-- If fail: Retry implementation with fixes
```

## Verification Depth

| Task Type | Verification Focus |
|-----------|-------------------|
| Bug fix | Issue resolved, no regressions |
| New feature | Requirements met, edge cases |
| Refactor | Behavior unchanged, code cleaner |
| Security | No vulnerabilities introduced |

## Model Selection

Always use sonnet - verification requires careful reasoning but not creativity.

## Failure Handling

When verifier returns `status: fail`:

1. Extract specific issues from `issues` list
2. Spawn new implementation agent with:
   - Original requirements
   - Specific issues to address
   - Path to existing work
3. Re-verify after retry

## Integration

- References: [subagent-manifest.md](../subagent-manifest.md) for status reporting
- Coordination: [subagent-coordination.md](../subagent-coordination.md) for orchestration
