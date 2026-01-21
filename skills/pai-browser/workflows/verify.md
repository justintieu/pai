---
name: verify
description: Verify page loads correctly and contains expected content
---

# Verify Workflow

Confirm a web page loads correctly, is error-free, and contains expected content.

## Steps

### 1. Launch Browser with Full Diagnostics

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture console errors
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

// Capture page errors
const pageErrors: string[] = [];
page.on('pageerror', err => pageErrors.push(err.message));

// Track failed requests
const failedRequests: { url: string; error: string }[] = [];
page.on('requestfailed', req => {
  failedRequests.push({
    url: req.url(),
    error: req.failure()?.errorText || 'Unknown error'
  });
});
```

### 2. Navigate and Measure

```typescript
const startTime = Date.now();
const response = await page.goto(url, {
  waitUntil: 'networkidle',
  timeout: 30000
});
const loadTime = Date.now() - startTime;

// Check HTTP status
const status = response?.status();
const statusOk = status && status >= 200 && status < 400;
```

### 3. Verify Basic Page Info

```typescript
const title = await page.title();
const finalUrl = page.url();
const redirected = finalUrl !== url;
```

### 4. Verify Specific Element (if requested)

```typescript
let elementFound = true;
let elementText = '';

if (expectedSelector) {
  try {
    await page.waitForSelector(expectedSelector, { timeout: 5000 });
    elementText = await page.textContent(expectedSelector) || '';
  } catch {
    elementFound = false;
  }
}
```

### 5. Check for Expected Content

```typescript
let contentFound = true;

if (expectedText) {
  const bodyText = await page.innerText('body');
  contentFound = bodyText.includes(expectedText);
}
```

### 6. Capture Evidence Screenshot

```typescript
const screenshotPath = `/tmp/verify-${Date.now()}.png`;
await page.screenshot({ path: screenshotPath, fullPage: true });
```

### 7. Generate Verification Report

```typescript
const passed = statusOk &&
  consoleErrors.length === 0 &&
  pageErrors.length === 0 &&
  failedRequests.length === 0 &&
  elementFound &&
  contentFound;

console.log(`
## Verification ${passed ? 'PASSED' : 'FAILED'}

**URL:** ${finalUrl}
**Title:** ${title}
**Status:** ${status}
**Load Time:** ${loadTime}ms
${redirected ? `**Redirected From:** ${url}` : ''}

### Checks
- HTTP Status OK: ${statusOk ? 'PASS' : 'FAIL'}
- No Console Errors: ${consoleErrors.length === 0 ? 'PASS' : 'FAIL'} (${consoleErrors.length} errors)
- No Page Errors: ${pageErrors.length === 0 ? 'PASS' : 'FAIL'} (${pageErrors.length} errors)
- No Failed Requests: ${failedRequests.length === 0 ? 'PASS' : 'FAIL'} (${failedRequests.length} failed)
${expectedSelector ? `- Element Found (${expectedSelector}): ${elementFound ? 'PASS' : 'FAIL'}` : ''}
${expectedText ? `- Content Found: ${contentFound ? 'PASS' : 'FAIL'}` : ''}

### Screenshot
${screenshotPath}
`);
```

### 8. Clean Up

```typescript
await browser.close();
```

## Output Format

```markdown
## Verification [PASSED/FAILED]

**URL:** [final url]
**Title:** [page title]
**Status:** [HTTP status]
**Load Time:** [X]ms

### Checks
- HTTP Status OK: [PASS/FAIL]
- No Console Errors: [PASS/FAIL] ([N] errors)
- No Page Errors: [PASS/FAIL] ([N] errors)
- No Failed Requests: [PASS/FAIL] ([N] failed)
- Element Found: [PASS/FAIL] (if selector specified)
- Content Found: [PASS/FAIL] (if text specified)

### Screenshot
[path to screenshot]

### Issues (if any)
[List of errors, failed requests, missing elements]
```

## Complete Verification Example

```typescript
import { chromium } from 'playwright';

async function verifyPage(url: string, options?: {
  selector?: string;
  text?: string;
}) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  const start = Date.now();
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - start;

  const checks = {
    status: response?.status() || 0,
    statusOk: (response?.status() || 0) < 400,
    title: await page.title(),
    errors: errors.length,
    errorsOk: errors.length === 0,
    loadTime
  };

  if (options?.selector) {
    try {
      await page.waitForSelector(options.selector, { timeout: 5000 });
      checks.selectorOk = true;
    } catch {
      checks.selectorOk = false;
    }
  }

  if (options?.text) {
    const body = await page.innerText('body');
    checks.textOk = body.includes(options.text);
  }

  await page.screenshot({ path: '/tmp/verify.png', fullPage: true });
  await browser.close();

  return checks;
}
```

## Examples

**Basic page verification:**
```
verify https://example.com loads correctly
```

**Verify specific element exists:**
```
verify https://example.com has a .hero-section element
```

**Verify content is present:**
```
verify https://example.com/about shows "Contact Us"
```

**Verify deployment:**
```
verify https://myapp.com shows the new header with class .new-header
```
