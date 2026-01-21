---
name: screenshot
description: Capture screenshots of web pages or specific elements
---

# Screenshot Workflow

Capture visual evidence of web pages with various options.

## Steps

### 1. Parse Screenshot Options

Determine from user request:
- **Full page** (default): Capture entire scrollable content
- **Viewport only**: Just the visible portion
- **Element specific**: Target a CSS selector
- **Device emulation**: Mobile/tablet viewports

### 2. Launch with Appropriate Viewport

```typescript
import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });

// Standard desktop
let context = await browser.newContext({
  viewport: { width: 1280, height: 720 }
});

// Or mobile (if requested)
// context = await browser.newContext(devices['iPhone 14']);

const page = await context.newPage();
```

### 3. Navigate and Wait for Content

```typescript
await page.goto(url, { waitUntil: 'networkidle' });

// Wait for specific element if targeting
if (selector) {
  await page.waitForSelector(selector, { timeout: 10000 });
}
```

### 4. Capture Screenshot

```typescript
const timestamp = Date.now();
const screenshotPath = `/tmp/screenshot-${timestamp}.png`;

// Full page screenshot
await page.screenshot({
  path: screenshotPath,
  fullPage: true,
  type: 'png'
});

// Or element-specific
if (selector) {
  const element = page.locator(selector);
  await element.screenshot({ path: screenshotPath });
}

// Or viewport only
// await page.screenshot({ path: screenshotPath, fullPage: false });
```

### 5. Report Result

```typescript
console.log(`Screenshot saved: ${screenshotPath}`);
await browser.close();
```

## Options Reference

| Option | Description | Example |
|--------|-------------|---------|
| `fullPage: true` | Capture entire scrollable page | Default |
| `fullPage: false` | Capture viewport only | Quick preview |
| `selector` | Capture specific element | `.hero-section` |
| `type: 'png'` | PNG format (default) | Best quality |
| `type: 'jpeg'` | JPEG format | Smaller files |
| `quality: 80` | JPEG quality (0-100) | Compression |

## Device Emulation

```typescript
import { devices } from 'playwright';

// Available devices
const iphone = devices['iPhone 14'];
const ipad = devices['iPad Pro 11'];
const pixel = devices['Pixel 5'];

const context = await browser.newContext(iphone);
```

## Output Format

```markdown
## Screenshot Captured

**URL:** [url]
**Type:** [Full Page / Viewport / Element]
**Path:** [screenshot path]
**Dimensions:** [width x height]

[Use Read tool to view the screenshot]
```

## Examples

**Full page:**
```
screenshot https://example.com
```

**Element only:**
```
screenshot the header at https://example.com (selector: header)
```

**Mobile view:**
```
screenshot https://example.com as iPhone 14
```
