# Coding Rules

## Comments

- **No changelog comments** - Comments should explain what code does, not what was removed or changed. Git tracks history.
  - Bad: `// Note: Removed pai-orchestrate suggestion - just track work silently`
  - Bad: `// Previously this was X, now it's Y`
  - Good: `// Create work session for complex requests`
  - Good: (no comment if the code is self-explanatory)

- **Prefer no comment** over obvious comment. If the code is clear, don't add noise.

## File Formats

- Use YAML for state/config files (not JSON) - more readable, supports comments
- Use JSONL for append-only logs/streams
