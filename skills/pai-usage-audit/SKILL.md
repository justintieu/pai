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

### Cost Comparison (as of 2026-02-03)
| Tool | Total Cost | Output Tokens | Strategy |
|------|------------|---------------|----------|
| Our tool | ~$1,748 | 5.27M | LAST entry (correct) |
| ccusage | ~$1,674 | 971K | FIRST entry (under-counts) |

### Deduplication Strategy
- **Our tool**: Uses LAST entry per `messageId` (correct - captures final cumulative counts)
- **ccusage**: Uses FIRST entry per `messageId:requestId` (under-counts - captures incomplete `message_start` data)

### Why Our Output Tokens Are Higher (~5x)
Claude Code writes multiple JSONL entries per message during streaming:
1. First entries: `message_start` event with partial tokens (1-5), `stop_reason=null`
2. Last entry: `message_delta` event with cumulative tokens (actual total), `stop_reason` set

Per Anthropic docs, `message_delta` usage is **cumulative** - the LAST entry is correct.

### Pricing Notes
- Both tools use LiteLLM pricing (Opus $5/$25, Sonnet $3/$15, Haiku $1/$5 per M)
- Tiered pricing (above 200k) is NOT applied per-token-type
- Cache tokens dominate costs (~$1,400 of ~$1,700 total)

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

## Reference: Investigation Findings (2026-02-03)

### Deduplication Strategy Comparison

| Strategy | Output Tokens | Cost | Notes |
|----------|---------------|------|-------|
| FIRST (ccusage) | 971K | ~$1,674 | Takes `message_start` data |
| LAST (our tool) | 5.27M | ~$1,748 | Takes cumulative `message_delta` data |

### Why LAST is Correct

Per [Anthropic's streaming docs](https://docs.anthropic.com/en/api/messages-streaming):
> "The token counts shown in the usage field of the message_delta event are **cumulative**."

Streaming flow:
1. `message_start`: Initial message with `output_tokens: 1-5` (incomplete)
2. Content streams...
3. `message_delta`: Final event with cumulative `output_tokens` (correct total)

### JSONL Entry Patterns

Analysis of 31,313 unique messages:
- **5,088** single-entry messages (no streaming variance)
- **17,892** multi-entry with same first/last (no impact)
- **8,294** multi-entry with different first/last (4.3M token diff)

Sample message showing the issue:
```
[0] 2026-01-02T15:18:41 | out=3     | stop=null      (message_start)
[1] 2026-01-02T15:18:41 | out=3     | stop=null      (streaming)
[2] 2026-01-02T15:23:03 | out=19688 | stop=tool_use  (message_delta - CORRECT)
```

### Tiered Pricing Note

Tiered pricing (2x rates above 200k tokens) should NOT be applied per-token-type.
It applies to context window size, not individual token counts.

Our tool uses simple per-million-token rates, matching ccusage's calculation method.

### Cost Breakdown by Model (FIRST strategy to match ccusage)

| Model | Messages | Cache Read | Cache Write | Total Cost |
|-------|----------|------------|-------------|------------|
| Opus 4.5 | 17,492 | 1.05B | 94M | $1,139 |
| Sonnet 4.5 | 11,145 | 813M | 69M | $513 |
| Haiku 4.5 | 2,591 | 76M | 11M | $22 |

### Summary

- **Our tool is MORE accurate** (+$74 vs ccusage due to correct output tokens)
- ccusage under-reports because it uses incomplete `message_start` data
- The ~4% difference represents real generated tokens that ccusage misses
