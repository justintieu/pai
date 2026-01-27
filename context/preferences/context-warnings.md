# Context Warning Preferences

Controls when and how context warnings are displayed.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| warnings_enabled | false | Show proactive warnings (default: quiet) |
| warn_at_50 | false | Soft warning at 50% |
| warn_at_70 | true | Warning at 70% (if enabled) |
| warn_at_90 | true | Critical warning at 90% (always, even if disabled) |

## Behavior

**When warnings_enabled = false (default):**
- No proactive context warnings
- Only 90%+ triggers a suggestion
- User discovers via /context when needed

**When warnings_enabled = true:**
- Show soft warnings at configured thresholds
- Format: "Note: Context at ~X%. [suggestion based on level]"

## Setting Preferences

To enable warnings:
```
Edit context/preferences/context-warnings.md
Set warnings_enabled: true
```

To customize thresholds:
```
warn_at_50: true   # Add 50% checkpoint
warn_at_70: true   # Keep 70% warning
warn_at_90: true   # Always recommended
```

## Rationale

User strongly prefers non-noisy experience. Proactive suggestions feel annoying.
Default quiet mode respects this preference while maintaining safety at 90%+.
