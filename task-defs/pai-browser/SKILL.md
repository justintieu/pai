---
name: pai-browser
description: Debug-first browser automation with Playwright. Navigate, interact, extract, screenshot. Always-on console logs, network requests, and error capture. USE WHEN browse website, take screenshot, fill form, click button, verify page, scrape content, web automation.
tools: Bash, Read, Write
requires: bun, playwright
---

# PAI Browser

Debug-first browser automation skill using Playwright. Captures console logs, network requests, and errors by default - debugging is always on, not opt-in.

## Workflows

| Workflow | Use When | Description |
|----------|----------|-------------|
| **Navigate** | Default - browsing a URL | Navigate and capture diagnostics |
| **Screenshot** | "screenshot", "capture" | Capture page or element visuals |
| **Extract** | "extract", "scrape", "get content" | Pull text, HTML, or structured data |
| **Interact** | "fill", "click", "type", "submit" | Form filling and element interaction |
| **Verify** | "verify", "check if", "confirm" | Validate page load and content |

## Instructions

### 1. Ensure Playwright Available

Before using browser automation, verify Playwright is installed:

```bash
# Check if playwright is available
bun -e "require('@playwright/test')" 2>/dev/null && echo "OK" || echo "Install: bun add playwright @playwright/test"
```

If not available, guide user to install.

### 2. Select Workflow

Parse user request for workflow indicators:
- **Navigate**: "go to", "browse", "open", "visit" (default)
- **Screenshot**: "screenshot", "capture", "image of"
- **Extract**: "extract", "scrape", "get text", "get content", "pull data"
- **Interact**: "click", "fill", "type", "submit", "select"
- **Verify**: "verify", "check", "confirm", "is the page"

### 3. Execute Workflow

Load the appropriate workflow from `workflows/`:
- Navigate: `workflows/navigate.md`
- Screenshot: `workflows/screenshot.md`
- Extract: `workflows/extract.md`
- Interact: `workflows/interact.md`
- Verify: `workflows/verify.md`

### 4. Always Capture Diagnostics

Every browser operation should capture:
- Console output (errors, warnings, logs)
- Network requests (failed requests, timing)
- Page errors and exceptions
- Screenshot as evidence

### 5. Report Results

Format output as:

```markdown
## Browser: [Action] - [URL]

**Status:** [Success/Failed] | **Load Time:** [Xs]

### Result
[Primary output - screenshot path, extracted content, etc.]

### Diagnostics
- Console Errors: [count]
- Failed Requests: [count]
- Warnings: [count]

### Issues (if any)
[List any errors or problems encountered]
```

## Core Playwright Patterns

### Basic Navigation with Diagnostics

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Capture console
const consoleLogs: string[] = [];
page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

// Capture errors
const pageErrors: string[] = [];
page.on('pageerror', err => pageErrors.push(err.message));

// Navigate
await page.goto('https://example.com');
await page.waitForLoadState('networkidle');

// Screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

await browser.close();
```

### Element Interaction

```typescript
// Click
await page.click('button#submit');

// Fill form
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password123');

// Select dropdown
await page.selectOption('select#country', 'US');

// Type with delay (human-like)
await page.type('input#search', 'query', { delay: 100 });
```

### Content Extraction

```typescript
// Get text
const title = await page.textContent('h1');
const allText = await page.innerText('body');

// Get HTML
const html = await page.innerHTML('.article');

// Evaluate JavaScript
const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a')).map(a => a.href)
);
```

## Examples

**Example 1: Take screenshot of a page**
```
User: "screenshot https://example.com"
Claude: Executes Screenshot workflow
        Navigates to URL, captures full page screenshot
        Returns screenshot path and diagnostics
```

**Example 2: Extract content from a page**
```
User: "extract the main article text from https://blog.example.com/post"
Claude: Executes Extract workflow
        Navigates, extracts article content
        Returns cleaned text and any errors
```

**Example 3: Fill and submit a form**
```
User: "fill the contact form at https://example.com/contact with name='John' email='john@test.com'"
Claude: Executes Interact workflow
        Navigates, fills form fields, submits
        Reports success and captures confirmation screenshot
```

**Example 4: Verify deployment**
```
User: "verify https://myapp.com is showing the new header"
Claude: Executes Verify workflow
        Checks page loads, looks for header element
        Reports status with screenshot evidence
```

## Resources

- [Navigate workflow](workflows/navigate.md) - Basic navigation with diagnostics
- [Screenshot workflow](workflows/screenshot.md) - Capture page visuals
- [Extract workflow](workflows/extract.md) - Content extraction methods
- [Interact workflow](workflows/interact.md) - Form filling and clicks
- [Verify workflow](workflows/verify.md) - Page verification checks

## Notes

**Token Efficiency:** Direct Playwright code is ~99% more token-efficient than using Playwright MCP due to avoiding the ~13,700 token startup cost.

**Session Management:** Sessions auto-initialize on first use. No explicit startup needed.

**Headless Default:** Browser runs headless by default for automation. Use `headless: false` for debugging.
