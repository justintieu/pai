---
name: interact
description: Interact with web pages - click, fill forms, type, select
---

# Interact Workflow

Perform actions on web pages including form filling, clicking, and navigation.

## Steps

### 1. Navigate to Page

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
```

### 2. Wait for Target Element

```typescript
// Wait for element to be visible
await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
```

### 3. Perform Interaction

#### Clicking

```typescript
// Basic click
await page.click('button#submit');

// Click with options
await page.click('button', { button: 'right' }); // Right click
await page.click('button', { clickCount: 2 }); // Double click
await page.click('button', { force: true }); // Force click (skip checks)

// Click and wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a.next-page')
]);
```

#### Form Filling

```typescript
// Clear and fill
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'securepassword');

// Fill multiple fields
const formData = {
  '#name': 'John Doe',
  '#email': 'john@example.com',
  '#phone': '555-1234'
};
for (const [selector, value] of Object.entries(formData)) {
  await page.fill(selector, value);
}
```

#### Typing (with delay for human-like input)

```typescript
// Type with delay between keystrokes
await page.type('input#search', 'search query', { delay: 100 });

// Press specific keys
await page.keyboard.press('Enter');
await page.keyboard.press('Tab');
await page.keyboard.press('Escape');

// Key combinations
await page.keyboard.press('Control+A');
await page.keyboard.press('Meta+C'); // Cmd+C on Mac
```

#### Dropdown Selection

```typescript
// Select by value
await page.selectOption('select#country', 'US');

// Select by label
await page.selectOption('select#country', { label: 'United States' });

// Multi-select
await page.selectOption('select#tags', ['tag1', 'tag2', 'tag3']);
```

#### Checkbox and Radio

```typescript
// Check/uncheck
await page.check('input#agree');
await page.uncheck('input#newsletter');

// Check if checked
const isChecked = await page.isChecked('input#agree');
```

#### Hover

```typescript
// Hover to reveal hidden elements
await page.hover('.dropdown-trigger');
await page.waitForSelector('.dropdown-menu', { state: 'visible' });
```

#### File Upload

```typescript
// Upload file
await page.setInputFiles('input[type="file"]', '/path/to/file.pdf');

// Upload multiple files
await page.setInputFiles('input[type="file"]', [
  '/path/to/file1.pdf',
  '/path/to/file2.pdf'
]);
```

#### Drag and Drop

```typescript
await page.dragAndDrop('#source', '#target');
```

### 4. Wait for Result

```typescript
// Wait for navigation
await page.waitForNavigation();

// Wait for element
await page.waitForSelector('.success-message');

// Wait for URL change
await page.waitForURL('**/success');

// Wait for network idle
await page.waitForLoadState('networkidle');
```

### 5. Capture Evidence

```typescript
// Screenshot after interaction
await page.screenshot({ path: '/tmp/after-interaction.png' });

// Get result text
const resultText = await page.textContent('.result-message');
```

### 6. Clean Up

```typescript
await browser.close();
```

## Output Format

```markdown
## Interaction Complete

**URL:** [url]
**Actions Performed:**
1. [action 1]
2. [action 2]
...

### Result
[success message or outcome]

### Screenshot
[path to screenshot]

### Issues (if any)
[any errors or warnings]
```

## Complete Login Example

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Navigate to login page
await page.goto('https://example.com/login');

// Fill credentials
await page.fill('input[name="email"]', 'user@example.com');
await page.fill('input[name="password"]', 'password123');

// Submit and wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('button[type="submit"]')
]);

// Verify login success
const welcomeText = await page.textContent('.welcome-message');
console.log('Login result:', welcomeText);

// Screenshot as evidence
await page.screenshot({ path: '/tmp/logged-in.png' });

await browser.close();
```

## Examples

**Fill and submit form:**
```
fill the contact form at https://example.com/contact
name: John Doe
email: john@example.com
message: Hello world
```

**Click a button:**
```
click the "Sign Up" button at https://example.com
```

**Login to site:**
```
login to https://example.com with email test@example.com password secret123
```
