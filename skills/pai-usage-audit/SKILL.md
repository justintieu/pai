---
name: pai-usage-audit
description: Audit and refresh Claude Code usage tracking. Compares claude-usage.mjs to ccusage, validates pricing, checks deduplication accuracy. USE WHEN usage audit, check costs, compare ccusage, refresh pricing, token audit, billing check.
tools: [Bash, Read, Edit, WebFetch, Task]
---

# PAI Usage Audit

Audits the `~/.claude/bin/claude-usage.mjs` tool for accuracy, compares against ccusage, and ensures pricing is current.

## Quick Commands

| Command | Action |
|---------|--------|
| `/pai usage-audit` | Full audit (pricing + tokens + comparison) |
| `/pai usage-audit pricing` | Check pricing against LiteLLM |
| `/pai usage-audit compare` | Compare output to ccusage |
| `/pai usage-audit dedup` | Verify deduplication accuracy |

## Automated Audit Script

Run the audit script directly:

```bash
~/.claude/bin/audit-usage.mjs          # Full audit
~/.claude/bin/audit-usage.mjs pricing  # Pricing only
~/.claude/bin/audit-usage.mjs dedup    # Deduplication only
```

## Key Files

- **Tool**: `~/.claude/bin/claude-usage.mjs`
- **Archive script**: `~/.claude/bin/archive-usage.sh`
- **Data source**: `~/.claude/projects/*/*.jsonl`
- **LiteLLM pricing**: `https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json`

## Known Differences from ccusage

### Deduplication Strategy
- **Our tool**: Uses LAST entry per `messageId` (correct - captures final token counts)
- **ccusage**: Uses FIRST entry per `messageId:requestId` (bug - captures incomplete streaming events)

### Why Our Output Tokens Are Higher
Streaming creates multiple JSONL entries per message:
1. First entries have `stop_reason=null` with partial tokens (1-5)
2. Last entry has `stop_reason="tool_use"|"end_turn"` with actual tokens (100-20,000)

ccusage takes first entry = under-counts. Our tool takes last entry = accurate.

## Instructions

### 1. Pricing Audit

Fetch current LiteLLM pricing and compare to our hardcoded values:

```bash
curl -s https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json | jq '.["claude-opus-4-5-20251101"], .["claude-sonnet-4-5-20250929"], .["claude-haiku-4-5-20251001"]'
```

Compare against `MODEL_PRICING` in `~/.claude/bin/claude-usage.mjs`:

| Model | Field | Our Value | LiteLLM Field |
|-------|-------|-----------|---------------|
| Opus 4.5 | input | $5/M | input_cost_per_token × 1M |
| Opus 4.5 | output | $25/M | output_cost_per_token × 1M |
| Opus 4.5 | cacheRead | $0.50/M | cache_read_input_token_cost × 1M |
| Opus 4.5 | cacheWrite | $6.25/M | cache_creation_input_token_cost × 1M |
| Sonnet 4.5 | input | $3/M | ... |
| Sonnet 4.5 | output | $15/M | ... |
| Haiku 4.5 | input | $1/M | ... |
| Haiku 4.5 | output | $5/M | ... |

**Tiered pricing** (above 200k tokens): Check for `*_above_200k_tokens` fields.

### 2. Token Comparison

Run both tools and compare:

```bash
# Our tool
~/.claude/bin/claude-usage.mjs models

# ccusage
npx ccusage@latest --json 2>/dev/null | jq '.totals'
```

Expected differences:
- **Input tokens**: Should be within 5%
- **Output tokens**: Our tool ~6x higher (correct - ccusage bug)
- **Cache tokens**: Should be within 10%

### 3. Deduplication Verification

Run this analysis to verify deduplication accuracy:

```javascript
// Count messages where first != last output tokens
// These are streaming messages where ccusage under-counts
```

Script location: Can generate ad-hoc or use scratchpad.

### 4. Report Format

```
=== Claude Usage Audit Report ===
Date: YYYY-MM-DD

PRICING STATUS:
  Opus 4.5:   [OK|OUTDATED] - current: $X, LiteLLM: $Y
  Sonnet 4.5: [OK|OUTDATED] - current: $X, LiteLLM: $Y
  Haiku 4.5:  [OK|OUTDATED] - current: $X, LiteLLM: $Y

TOKEN COMPARISON (vs ccusage):
  Input:      X vs Y (Z% diff) [EXPECTED]
  Output:     X vs Y (Z% diff) [EXPECTED - ccusage bug]
  Cache Read: X vs Y (Z% diff) [EXPECTED]
  Cache Write:X vs Y (Z% diff) [EXPECTED]

COST COMPARISON:
  Our tool:   $X
  ccusage:    $Y
  Difference: $Z (A%)

  Note: Higher cost is CORRECT. ccusage under-counts output tokens.

DEDUPLICATION:
  Total messages: N
  Messages with streaming variance: M
  Token difference (last - first): X tokens

RECOMMENDATIONS:
  [ ] Update pricing for model X
  [ ] No action needed
```

## When to Run

- **Monthly**: Full audit to catch pricing changes
- **After Anthropic announcements**: Pricing may change
- **If costs seem off**: Compare against ccusage for sanity check

## Updating Pricing

If pricing is outdated, edit `~/.claude/bin/claude-usage.mjs`:

```javascript
const MODEL_PRICING = {
  'claude-opus-4-5-20251101': {
    input: X, output: Y, cacheRead: Z, cacheWrite: W,
    inputTiered: X*2, outputTiered: Y*1.5, cacheReadTiered: Z*2, cacheWriteTiered: W*2,
  },
  // ...
};
```

Tiered rates are typically 2x base for input/cache, 1.5x for output.

## Reference: ccusage Bug Analysis (2026-01-29)

Investigation showed ccusage uses `messageId:requestId` as dedup key and keeps FIRST entry. For streaming messages:
- First entry: `output_tokens=3`, `stop_reason=null`
- Last entry: `output_tokens=19688`, `stop_reason="tool_use"`

ccusage reports 940K output tokens; actual is 5.6M. This is a 6x under-count.

Our tool correctly uses the LAST entry which has the final, accurate token count.
