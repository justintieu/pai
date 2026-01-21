---
name: four-tier-scrape
description: Progressive URL content retrieval with automatic escalation
---

# Four-Tier URL Scrape Workflow

Progressive escalation strategy for URL content retrieval with four fallback tiers.

## Workflow Steps

### Step 1: Tier 1 - WebFetch

Attempt with Claude's built-in WebFetch tool.

```
WebFetch(url, "Extract all content from this page in markdown format")
```

**Success indicators:**
- Returns meaningful content (not error page)
- Content length > 100 characters
- No obvious bot detection messages

**Failure indicators:**
- Empty or minimal content
- "Access Denied", "Please enable JavaScript"
- HTTP errors (403, 503, etc.)

If success -> Go to Step 5 (Return Results)
If failure -> Continue to Step 2

### Step 2: Tier 2 - Curl with Chrome Headers

Attempt with curl using comprehensive browser headers.

```bash
curl -s -L \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "Accept-Encoding: gzip, deflate, br" \
  -H "Sec-Fetch-Dest: document" \
  -H "Sec-Fetch-Mode: navigate" \
  -H "Sec-Fetch-Site: none" \
  -H "Sec-Fetch-User: ?1" \
  -H "Upgrade-Insecure-Requests: 1" \
  -H "Cache-Control: max-age=0" \
  --compressed \
  "URL"
```

**Success indicators:**
- HTML content returned
- Contains expected page structure
- No CAPTCHA or bot challenge

**Failure indicators:**
- CAPTCHA challenge page
- JavaScript-required message
- Empty response or error

If success -> Go to Step 5 (Return Results)
If failure -> Continue to Step 3

### Step 3: Tier 3 - Browser Automation (Playwright)

**Prerequisite check:** Verify Browser skill is available.

If Browser skill unavailable:
- Log: "Tier 3 unavailable - Browser skill not configured"
- Continue to Step 4

If available, use Playwright to:
1. Navigate to URL
2. Wait for JavaScript execution
3. Wait for network idle
4. Extract page content

**Success indicators:**
- Full page content rendered
- Dynamic content loaded
- No CAPTCHA blocking

**Failure indicators:**
- CAPTCHA challenge
- Login required
- Geographic restriction

If success -> Go to Step 5 (Return Results)
If failure -> Continue to Step 4

### Step 4: Tier 4 - Bright Data MCP

**Prerequisite check:** Verify Bright Data MCP is configured.

If Bright Data MCP unavailable:
- Log: "Tier 4 unavailable - Bright Data MCP not configured"
- Go to Step 6 (Report Failure)

If available, use Bright Data MCP:

```
mcp__Brightdata__scrape_as_markdown(url)
```

This provides:
- Residential proxy IPs
- Automatic CAPTCHA solving
- Advanced fingerprint spoofing

**Success indicators:**
- Content returned
- No error response

**Failure indicators:**
- Service error
- Content not accessible even with premium methods

If success -> Go to Step 5 (Return Results)
If failure -> Go to Step 6 (Report Failure)

### Step 5: Return Results

Format successful retrieval:

```markdown
## Scraped: [URL]

**Tier:** [N] ([method name]) | **Time:** [duration]

### Content

[Extracted content in markdown format]

### Retrieval Metadata
- Success tier: [N] - [method name]
- Tiers attempted: [list of attempted tiers]
- Content length: [N] characters
- Retrieval time: [X] seconds
```

### Step 6: Report Failure

If all available tiers failed:

```markdown
## Scrape Failed: [URL]

**Tiers Attempted:** [list]
**Tiers Unavailable:** [list with reasons]

### Failure Summary
[Brief explanation of what each tier encountered]

### Recommendations
- [Suggestions based on failure pattern]
- If CAPTCHA: Consider configuring Bright Data MCP
- If JavaScript: Consider configuring Browser skill
- If geographic: May require VPN or proxy service
```

## Tier Quick Reference

| Tier | Method | Check | Typical Failure |
|------|--------|-------|-----------------|
| 1 | WebFetch | Always available | Bot detection, JS required |
| 2 | Curl + Headers | Always available | Advanced bot detection |
| 3 | Browser/Playwright | Browser skill installed | CAPTCHA, login walls |
| 4 | Bright Data MCP | MCP configured | Service limits, hard blocks |

## Performance Expectations

- **Best case:** Tier 1 succeeds in 2-5 seconds
- **Typical case:** Tier 2 or 3 succeeds in 10-20 seconds
- **Worst case:** All tiers attempted, ~40 seconds total

## Notes

- Tiers 1-3 are free; Tier 4 uses Bright Data credits
- Always attempt lower tiers first unless user requests specific tier
- Log which tier succeeded for user awareness of site difficulty
