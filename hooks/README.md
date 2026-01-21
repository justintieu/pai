# PAI Hook System

Event-driven middleware for Claude Code that provides security validation, context injection, response capture, and observability.

## Architecture

```
hooks/
├── src/
│   ├── hooks/           # Hook entry points (by event type)
│   │   ├── SecurityValidator.hook.ts    # PreToolUse - Block dangerous commands
│   │   ├── LoadContext.hook.ts          # SessionStart - Inject PAI context
│   │   ├── StartupGreeting.hook.ts      # SessionStart - Display banner
│   │   ├── CheckVersion.hook.ts         # SessionStart - Check for updates
│   │   ├── StopOrchestrator.hook.ts     # Stop - Coordinate all stop handlers
│   │   ├── SessionSummary.hook.ts       # SessionEnd - Mark work complete
│   │   └── WorkCompletionLearning.hook.ts # SessionEnd - Capture learnings
│   ├── handlers/        # Pure functions called by orchestrators
│   │   ├── voice.ts          # Voice notifications (ElevenLabs)
│   │   ├── capture.ts        # Response capture to WORK/
│   │   ├── tab-state.ts      # Kitty terminal tab state
│   │   └── SystemIntegrity.ts # PAI change detection
│   ├── lib/             # Shared utilities
│   │   ├── paths.ts          # Path resolution
│   │   ├── identity.ts       # DA/Principal identity
│   │   ├── time.ts           # Timestamp utilities
│   │   ├── response-format.ts # Output validation
│   │   ├── notifications.ts  # Multi-channel notifications
│   │   ├── observability.ts  # Dashboard integration
│   │   ├── learning-utils.ts # Learning categorization
│   │   └── change-detection.ts # PAI change detection
│   └── tools/           # CLI tools
│       └── TranscriptParser.ts # Transcript parsing utility
├── package.json
├── tsconfig.json
└── README.md
```

## Hooks by Event Type

### SessionStart
- **LoadContext**: Injects CORE skill content into Claude's context
- **StartupGreeting**: Displays PAI banner with system stats
- **CheckVersion**: Notifies if Claude Code update available

### PreToolUse
- **SecurityValidator**: Validates Bash commands and file operations against security patterns

### Stop
- **StopOrchestrator**: Coordinates all stop handlers (voice, capture, tab-state, integrity)

### SessionEnd
- **SessionSummary**: Marks work as complete, clears session state
- **WorkCompletionLearning**: Captures learnings from significant work

## Installation

```bash
# Install dependencies
cd ~/.pai/hooks
bun install

# Run type checking
bun run check
```

## Configuration

Hooks are registered in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "bun ~/.pai/hooks/src/hooks/LoadContext.hook.ts" },
          { "type": "command", "command": "bun ~/.pai/hooks/src/hooks/StartupGreeting.hook.ts" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash|Edit|Write|Read",
        "hooks": [
          { "type": "command", "command": "bun ~/.pai/hooks/src/hooks/SecurityValidator.hook.ts" }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": "bun ~/.pai/hooks/src/hooks/StopOrchestrator.hook.ts" }
        ]
      }
    ]
  }
}
```

## Optional Features

### Voice Notifications (ElevenLabs)

To enable voice notifications:

1. Set up a voice server running on `localhost:8888`
2. Configure in `settings.json`:
   ```json
   {
     "notifications": {
       "voice": {
         "enabled": true,
         "serverUrl": "http://localhost:8888"
       }
     },
     "daidentity": {
       "voiceId": "your-elevenlabs-voice-id"
     }
   }
   ```

### Push Notifications (ntfy.sh)

```json
{
  "notifications": {
    "ntfy": {
      "enabled": true,
      "topic": "your-ntfy-topic",
      "server": "ntfy.sh"
    }
  }
}
```

### Observability Dashboard

Hooks send events to `localhost:4000` for the Agent Visibility Dashboard.
See: https://github.com/disler/claude-code-hooks-multi-agent-observability

## Security Patterns

Custom security patterns can be added to `~/.pai/hooks/security-patterns.json`:

```json
{
  "bash": {
    "blocked": [
      { "pattern": "dangerous-pattern", "reason": "Why it's blocked" }
    ],
    "confirm": [
      { "pattern": "risky-pattern", "reason": "Why confirmation needed" }
    ]
  },
  "paths": {
    "zeroAccess": ["~/.secret-dir"],
    "readOnly": ["/important/config"]
  }
}
```

## Development

```bash
# Run a hook manually
bun ~/.pai/hooks/src/hooks/LoadContext.hook.ts

# Test transcript parsing
echo '{"session_id":"test","transcript_path":"/path/to/transcript.jsonl"}' | bun ~/.pai/hooks/src/hooks/StopOrchestrator.hook.ts
```

## Credits

Ported from [Daniel Miessler's PAI Hook System](https://github.com/danielmiessler/Personal_AI_Infrastructure/tree/main/Packs/pai-hook-system).
