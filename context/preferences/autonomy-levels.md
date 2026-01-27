# Autonomy Levels

User-configurable autonomy overrides per domain. Default levels are defined in [pai-domains.md](../../agents/pai-domains.md); overrides here take precedence.

## Domain Defaults

| Domain | Default Level | User Override |
|--------|---------------|---------------|
| Coding | Operator | --- |
| Research & Intelligence | Operator | --- |
| Reasoning & Validation | Operator | --- |
| Web & Visual | Operator | --- |
| Context & Memory | Operator | --- |
| PAI Infrastructure | Operator | --- |
| PAI File Operations | Operator | --- |
| Prompting | Operator | --- |
| Communications | Collaborator | --- |
| Finance | Advisor | --- |

## How to Change Levels

### Conversational

Just tell Atlas what you want:
- "I want coding to require approval"
- "Set communications to operator for this session"
- "Always treat finance as observer"

### Command

```
/pai autonomy [domain] [level]
```

Example: `/pai autonomy communications advisor`

### Direct Edit

Edit the Active Overrides section below using YAML format.

## Override Format

When you change a level, Atlas records it like this:

```yaml
domain: [domain name]
level: [operator|advisor|collaborator|assistant|observer]
persistence: permanent | session
reason: "[optional user reason]"
changed: [timestamp]
```

## Active Overrides

*(No overrides configured)*

## Level Reference

| Level | Behavior | User Role |
|-------|----------|-----------|
| Operator | Full autonomy, executes without asking | Observer |
| Advisor | Proposes but asks before doing | Decision-maker |
| Collaborator | Drafts for review, two-step confirm | Editor/Reviewer |
| Assistant | Only acts on explicit commands | Director |
| Observer | Read-only, answers questions | Full control |

See [protocols/autonomy-levels.md](../../protocols/autonomy-levels.md) for detailed level definitions and behavior patterns.
