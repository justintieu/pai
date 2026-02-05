---
date: 2026-02-03
domain: tooling
tags:
  - claude-code
  - usage-tracking
  - cost-calculation
  - ccusage
  - streaming-api
confidence: HIGH
---

# Claude Code Usage Tracking - Investigation Learnings

## 1. Tiered Pricing Per-Token-Type is Incorrect

Do NOT apply tiered pricing (2x rates above 200k tokens) to individual token types (input, output, cache read, cache write). This incorrectly inflates costs by ~2x.

Tiered pricing applies to context window size, not individual token counts.

**Fix:** Use simple per-million-token rates without tiered adjustments.

## 2. LAST Entry Strategy is Correct for Deduplication

Claude Code writes multiple JSONL entries per message during streaming:
- First entries: `message_start` with partial tokens (1-5), `stop_reason=null`
- Last entry: `message_delta` with cumulative tokens (actual total), `stop_reason` set

Per Anthropic docs: *"The token counts shown in the usage field of the message_delta event are **cumulative**."*

**Correct approach:** Use LAST entry per message ID to get accurate token counts.

## 3. ccusage Uses FIRST Entry (Under-counts)

ccusage deduplicates by `messageId:requestId` and keeps FIRST entry. This captures incomplete `message_start` data, under-counting output tokens by ~5x.

| Strategy | Output Tokens | Cost |
|----------|---------------|------|
| FIRST (ccusage) | 971K | ~$1,674 |
| LAST (our tool) | 5.27M | ~$1,748 |

The ~$74 difference represents real generated tokens that ccusage misses.

## 4. Cache Tokens Dominate Costs

Cache read/write tokens account for ~80% of total costs:
- Cache Read: 1.9B tokens → ~$580
- Cache Write: 174M tokens → ~$650
- Input/Output: ~$30 combined

**Implication:** Optimizing cache usage has the biggest cost impact.

## 5. LiteLLM Pricing is Authoritative

ccusage fetches pricing from LiteLLM's dataset:
`https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json`

Current rates (per million tokens):
- Opus 4.5: $5 input, $25 output, $0.50 cache read, $6.25 cache write
- Sonnet 4.5: $3 input, $15 output, $0.30 cache read, $3.75 cache write
- Haiku 4.5: $1 input, $5 output, $0.10 cache read, $1.25 cache write

---
*Captured: 2026-02-03*
*Investigation: Comparing claude-usage.mjs vs ccusage*
