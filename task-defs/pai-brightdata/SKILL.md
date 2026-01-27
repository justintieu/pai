---
name: pai-brightdata
description: Progressive URL scraping with four-tier fallback - WebFetch, Curl, Browser, Bright Data MCP. USE WHEN scrape URL, fetch URL, web scraping, bot detection, can't access site, site blocking, 403 error, CAPTCHA.
tools: WebFetch, Bash, Task
---

# PAI BrightData

Intelligent URL content retrieval with automatic four-tier fallback strategy. Most URLs work with simple tools, but when they fail, this skill automatically escalates through increasingly sophisticated methods.

## Workflows

| Workflow | Use When | Description |
|----------|----------|-------------|
| **four-tier-scrape** | Default for all scraping | Progressive escalation through all tiers |

## Tier Overview

| Tier | Tool | Speed | Cost | Best For |
|------|------|-------|------|----------|
| 1 | WebFetch | 2-5s | Free | Public sites, no bot detection |
| 2 | Curl + Headers | 3-7s | Free | Basic user-agent filtering |
| 3 | Browser (Playwright) | 10-20s | Free | JavaScript SPAs, dynamic content |
| 4 | Bright Data MCP | 5-15s | Credits | CAPTCHA, advanced bot detection |

## Activation Triggers

**Direct Scraping Requests:**
- "scrape this URL", "scrape [URL]"
- "fetch this URL", "fetch [URL]"
- "pull content from [URL]", "get content from [URL]"
- "retrieve [URL]", "download page content"

**Access Issues:**
- "can't access this site", "site is blocking me"
- "bot detection", "CAPTCHA", "403 error"
- "this URL won't load"

**Explicit Tier Requests:**
- "use Bright Data to fetch [URL]" - Skip to Tier 4
- "use browser to scrape [URL]" - Skip to Tier 3

## Instructions

### 1. Parse Request

Identify:
- Target URL
- Any explicit tier preference
- Expected content type (if mentioned)

### 2. Check for Tier Skip

If user requests specific method:
- "use Bright Data" or "Tier 4" -> Start at Tier 4
- "use browser" or "Tier 3" -> Start at Tier 3
- Otherwise -> Start at Tier 1

### 3. Execute Four-Tier Scrape

Load workflow: `workflows/four-tier-scrape.md`

The workflow handles:
- Progressive escalation on failure
- Dependency checking (Browser skill, Bright Data MCP)
- Content extraction and formatting

### 4. Return Results

Format output as:

```markdown
## Scraped: [URL]

**Tier:** [1-4] ([method]) | **Time:** [Xs]

### Content
[Retrieved content in markdown format]

### Metadata
- Success tier: [N]
- Tiers attempted: [list]
- Content length: [N chars]
```

## Examples

**Example 1: Simple public site**
```
User: "scrape https://example.com"
Claude: Tier 1 (WebFetch) succeeds in 3 seconds
        Returns content in markdown format
```

**Example 2: JavaScript-heavy site**
```
User: "fetch https://spa-app.com/dashboard"
Claude: Tier 1 fails (incomplete content)
        Tier 2 fails (same issue)
        Tier 3 (Browser) succeeds with full JS rendering
        Returns complete page content
```

**Example 3: Protected site with CAPTCHA**
```
User: "this site is blocking me, scrape https://protected.com"
Claude: Recognizes access issue trigger
        Tiers 1-3 fail with bot detection
        Tier 4 (Bright Data) succeeds
        Returns content with note about tier used
```

**Example 4: Direct tier request**
```
User: "use Bright Data to fetch https://difficult-site.com"
Claude: Skips directly to Tier 4
        Returns content without attempting lower tiers
```

## Dependencies

**Required:**
- WebFetch (built-in to Claude Code)
- Bash (built-in to Claude Code)

**Optional (enable higher tiers):**
- Browser skill with Playwright (for Tier 3)
- Bright Data MCP configured (for Tier 4)

If optional dependencies are missing, the workflow will note which tiers are unavailable.

## Resources

- [Four-tier scrape workflow](workflows/four-tier-scrape.md) - Complete escalation logic
