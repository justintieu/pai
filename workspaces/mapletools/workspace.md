# Workspace: mapletools

## Overview

MapleStory companion application monorepo providing calculators, trackers, and tools for MapleStory players. Full-stack TypeScript application with Next.js frontend, Express API, Discord bot, and shared core package.

**Version:** 3.4.4
**Status:** Active production use
**Repo:** `/Users/justintieu/Documents/github/maplestory-lib`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TailwindCSS, TanStack Query |
| Backend | Express.js 4, TypeScript |
| Database | Supabase (PostgreSQL) |
| Discord | discord.js 14, Anthropic AI |
| Package Manager | npm workspaces |
| Testing | Vitest (web/api), Jest (discord) |

## Monorepo Structure

```
apps/
  web/        # Next.js 15 frontend (port 3000)
  api/        # Express.js backend (port 3001)
  discord/    # Discord bot
  legacy/     # Deprecated Vite app
  redirect/   # URL redirect service

packages/
  core/       # @mapletools/core - shared services, repos, types
  shared/     # Legacy types (mostly replaced by core)

supabase/     # Database migrations
docs/         # Development protocols
```

## Status

**Phase:** Building

**Last Updated:** 2026-01-21

### Recent Progress
- Crystal limits added to reports (top 14 weekly, 180 world cap)
- StarForce trials parameter added to Discord command
- StarForce calculations updated (safeguarding costs fix)
- Boss preset edit functionality with duplicate validation
- Party size applied when loading boss presets

### Next Steps
- Set up Cloudinary for image hosting/optimization
- Add Cloudflare Worker proxy for `images.mapletools.com` subdomain

### Blockers
- None currently

## Architecture

### Data Flow Pattern
```
Component → Hook (TanStack Query) → Service → API (Express) → Repository → Supabase
```

### Key Patterns

| Pattern | Description |
|---------|-------------|
| Component → Hook → Service | Never call services directly from components |
| Query Key Factory | Centralized keys in `/src/lib/queryKeys.ts` |
| Calculation Services | All game math in `/src/services/calculations/` |
| Batched Updates | Task toggles batched to reduce API calls |

### API Versioning
- Current: `/v3/*` endpoints
- Legacy: `/legacy/*` for backward compatibility
- Admin: `/admin/*` separate routing

## Navigation

| Resource | Purpose |
|----------|---------|
| [Codebase Map](./codebase-map.md) | Directory structure, patterns, modification guides |
| [Registries](./registries/index.md) | Components, hooks, API routes, business logic |
| [Protocols](../../Documents/github/maplestory-lib/docs/protocols/) | Development protocols |

### Registries Quick Access
- [Components](./registries/components.md) - UI component catalog
- [Hooks](./registries/hooks.md) - React hooks reference
- [API Routes](./registries/api-routes.md) - Endpoint documentation
- [Business Logic](./registries/business-logic.md) - Feature rules, regression prevention

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/layout.tsx` | Root layout with providers |
| `apps/web/src/lib/queryKeys.ts` | TanStack Query key factory |
| `apps/web/src/services/calculations/` | All game calculations |
| `apps/api/index.ts` | Express server setup |
| `packages/core/src/index.ts` | Core package exports |
| `docs/protocols/` | Development protocols |

## Developer Guide

### Quick Commands

```bash
# Development
npm run dev:all         # Run API + web concurrently
npm run dev:discord     # Start Discord bot

# Quality
npm run lint            # ESLint all workspaces
npm run build           # Build all workspaces
npm run test            # Run all tests

# Database
npm run db:types:dev    # Generate types from schema
npm run db:push:dev     # Apply migrations
```

### Critical Rules (ESLint Enforced)

1. **No console.*** - Use `createLogger` from `@/lib/logger`
2. **No hover:scale-*** - Use brightness/color changes
3. **Absolute imports only** - Always use `@/` alias
4. **Sort keys** - Object keys alphabetically sorted
5. **Member ordering** - Methods alphabetical within visibility groups

### Before Every Commit

```bash
npm run lint && npm run build
```

### Adding Calculations

All game calculations go in `/apps/web/src/services/calculations/`:
- `starforceCalculationService.ts` - Enhancement calculations
- `cubingCalculationService.ts` - Cubing damage
- `flameCalculationService.ts` - Flame enchantments
- `mesoCalculationService.ts` - Meso costs

### Creating Discord Image Commands

Must use `/satori-validator` skill - see `docs/protocols/discord-image-generation.md`

## Decisions

| Decision | Rationale |
|----------|-----------|
| TanStack Query over Redux | Server state caching, simpler mental model |
| Supabase | PostgreSQL with built-in auth, real-time, storage |
| PWA | Offline support critical for mobile users |
| Monorepo | Share types/services between web, api, discord |
| next-intl | Future multi-language support (currently EN only) |
| Cloudinary + Cloudflare proxy | Free image CDN with custom subdomain (images.mapletools.com) |

## Environment Variables

### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL` - API endpoint
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

### API (`apps/api/.env.development.local`)
- `PORT` - Server port (3001)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role for admin ops

### Discord (`apps/discord/.env.local`)
- `DISCORD_TOKEN` - Bot token
- `ANTHROPIC_API_KEY` - AI features

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Type errors after schema change | Run `npm run db:types:dev` |
| Circular dependency errors | Run `npm run circular-dependency` to identify |
| ESLint import order | Run `npm run lint:fix` |
| Build fails on Vercel | Check `npm run build` locally first |

## Notes

- Legacy app (`apps/legacy`) is deprecated but maintained for backward compatibility
- Rate limiting tiers: General (1000/15min), Burst (300/min), Task (500/min)
- All admin actions logged to `admin_audit_log` table
- User tiers: Free/Premium with feature limits

## Protocol References

See `/docs/protocols/` for detailed guidance:
- `file-protocols.md` - File organization, large file refactoring
- `architecture-patterns.md` - Component patterns, data fetching
- `calculation-logic.md` - Game calculation implementation
- `code-quality.md` - Linting, testing requirements
- `ui-ux-standards.md` - Mobile-first design system
