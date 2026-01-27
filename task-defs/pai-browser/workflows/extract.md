---
name: extract
description: Extract text, HTML, or structured data from web pages
---

# Extract Workflow

Pull content from web pages in various formats.

## Steps

### 1. Navigate to Page

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
```

### 2. Determine Extraction Type

From user request, determine what to extract:
- **Text**: Plain text content
- **HTML**: Raw or cleaned HTML
- **Structured**: Links, images, metadata
- **Custom**: Via JavaScript evaluation

### 3. Extract Content

#### Text Extraction

```typescript
// All visible text
const allText = await page.innerText('body');

// Specific element text
const title = await page.textContent('h1');
const article = await page.innerText('article');
const paragraphs = await page.$$eval('p', els => els.map(el => el.textContent));
```

#### HTML Extraction

```typescript
// Raw HTML of element
const html = await page.innerHTML('article');

// Outer HTML (includes the element itself)
const outerHtml = await page.$eval('article', el => el.outerHTML);

// Full page HTML
const fullHtml = await page.content();
```

#### Structured Data

```typescript
// All links
const links = await page.$$eval('a', els =>
  els.map(a => ({ text: a.textContent, href: a.href }))
);

// All images
const images = await page.$$eval('img', els =>
  els.map(img => ({ src: img.src, alt: img.alt }))
);

// Meta tags
const meta = await page.$$eval('meta', els =>
  els.map(m => ({ name: m.name || m.property, content: m.content }))
);

// JSON-LD structured data
const jsonLd = await page.$$eval('script[type="application/ld+json"]', els =>
  els.map(el => JSON.parse(el.textContent || '{}'))
);
```

#### Custom JavaScript Evaluation

```typescript
// Run arbitrary JS
const customData = await page.evaluate(() => {
  // Your extraction logic
  return {
    title: document.title,
    headings: Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => ({ level: h.tagName, text: h.textContent })),
    wordCount: document.body.innerText.split(/\s+/).length
  };
});
```

### 4. Clean and Format

```typescript
// Clean text (remove extra whitespace)
const cleanText = text.replace(/\s+/g, ' ').trim();

// Clean HTML (remove scripts, styles)
const cleanHtml = await page.evaluate((selector) => {
  const el = document.querySelector(selector);
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('script, style, noscript').forEach(e => e.remove());
  return clone.innerHTML;
}, 'article');
```

### 5. Return Results

```typescript
await browser.close();
return extractedContent;
```

## Output Format

```markdown
## Extracted Content

**URL:** [url]
**Type:** [Text / HTML / Structured / Custom]

### Content
[extracted content]

### Metadata
- Title: [page title]
- Word Count: [N]
- Links Found: [N]
- Images Found: [N]
```

## Common Extraction Patterns

**Article content:**
```typescript
const article = await page.innerText('article, .post-content, .entry-content, main');
```

**Table data:**
```typescript
const tableData = await page.$$eval('table tr', rows =>
  rows.map(row =>
    Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent)
  )
);
```

**List items:**
```typescript
const items = await page.$$eval('ul li', els => els.map(el => el.textContent));
```

## Examples

**Extract article text:**
```
extract the article from https://blog.example.com/post
```

**Get all links:**
```
extract all links from https://example.com/resources
```

**Get structured data:**
```
extract metadata and headings from https://example.com
```
