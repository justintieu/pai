---
name: navigate
description: Navigate to a URL with debug-first diagnostics capture
---

# Navigate Workflow

Navigate to a URL while capturing comprehensive diagnostics.

## Steps

### 1. Launch Browser

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
});
const page = await context.newPage();
```

### 2. Set Up Diagnostics Capture

```typescript
// Console logs
const consoleLogs: { type: string; text: string }[] = [];
page.on('console', msg => {
  consoleLogs.push({ type: msg.type(), text: msg.text() });
});

// Page errors
const pageErrors: string[] = [];
page.on('pageerror', err => pageErrors.push(err.message));

// Network requests
const requests: { url: string; status?: number; failed?: boolean }[] = [];
page.on('request', req => requests.push({ url: req.url() }));
page.on('response', res => {
  const req = requests.find(r => r.url === res.url());
  if (req) req.status = res.status();
});
page.on('requestfailed', req => {
  const r = requests.find(r => r.url === req.url());
  if (r) r.failed = true;
});
```

### 3. Navigate and Wait

```typescript
const startTime = Date.now();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
const loadTime = Date.now() - startTime;

// Get page info
const title = await page.title();
const finalUrl = page.url();
```

### 4. Capture Evidence

```typescript
// Screenshot
const screenshotPath = `/tmp/browser-${Date.now()}.png`;
await page.screenshot({ path: screenshotPath, fullPage: true });
```

### 5. Report Diagnostics

```typescript
const errors = consoleLogs.filter(l => l.type === 'error');
const warnings = consoleLogs.filter(l => l.type === 'warning');
const failedRequests = requests.filter(r => r.failed || (r.status && r.status >= 400));

console.log(`
## Navigation Complete

**URL:** ${finalUrl}
**Title:** ${title}
**Load Time:** ${loadTime}ms

### Diagnostics
- Console Errors: ${errors.length}
- Console Warnings: ${warnings.length}
- Failed Requests: ${failedRequests.length}
- Total Requests: ${requests.length}

### Screenshot
${screenshotPath}
`);
```

### 6. Clean Up

```typescript
await browser.close();
```

## Output Format

```markdown
## Navigation Complete

**URL:** [final URL after redirects]
**Title:** [page title]
**Load Time:** [X]ms

### Diagnostics
- Console Errors: [N]
- Console Warnings: [N]
- Failed Requests: [N]
- Total Requests: [N]

### Screenshot
[path to screenshot]

### Errors (if any)
[List console errors]

### Failed Requests (if any)
[List failed network requests]
```
