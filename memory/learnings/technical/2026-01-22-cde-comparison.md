# Cloud Development Environments (CDEs)

**Date:** 2026-01-22

## Options Compared

| CDE | Cost | Best For |
|-----|------|----------|
| GitHub Codespaces | 120 hrs free, then $0.18/hr | GitHub-heavy workflows |
| Gitpod | 50 hrs/mo free | Multi-provider (GitLab, Bitbucket) |
| Coder | Free (self-host) | Full control, enterprises |
| Devpod | Free (open source) | Flexibility, runs anywhere |

## Self-Hosting a CDE

Best on: Hetzner CAX21 (€7/mo) or Oracle free tier

Can run: Coder or Devpod with Docker

## Claude Code in CDEs

Works anywhere with terminal:
```bash
npm install -g @anthropic-ai/claude-code
export ANTHROPIC_API_KEY=sk-...
claude
```

## Limitations

- No Android emulator on ARM (needs x86)
- Mobile dev needs `expo start --tunnel` for device access
- Slight hot-reload latency vs local

## Sandboxing with Docker

Run multiple isolated projects on one VPS:
- Devcontainers for per-project environments
- Share ~/.pai via volume mount across containers
- 8GB RAM recommended for multiple containers
