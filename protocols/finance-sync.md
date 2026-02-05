# Finance Sync Protocol

On-demand Plaid data synchronization with hybrid transaction categorization.

## Problem Being Solved

Users need current financial data from their connected accounts:
- **Balances become stale** without regular sync
- **New transactions** need to be captured and categorized
- **Payment due dates** change and need tracking for alerts
- **Investment holdings** fluctuate with market values

The challenge: When and how to sync, and how to categorize transactions meaningfully.

### Design Constraints

- **On-demand only** — No background refresh (privacy: user initiates all data pulls)
- **Read-only** — No transactions, transfers, or write operations
- **Hybrid categorization** — Plaid categories as baseline, user corrections take precedence
- **All account types** — Depository, credit, loans, investments

## Solution

**On-demand sync** triggered by user request or staleness detection:

1. User asks about finances OR staleness threshold exceeded
2. PAI syncs from Plaid using stored access_token
3. Data stored via [finance-storage](finance-storage.md) protocol
4. Transaction categorization applied with hybrid logic
5. Display formatted data with sync timestamp

### Why This Approach

| Alternative | Why Not |
|-------------|---------|
| Background sync | Privacy concerns, battery drain, unnecessary API calls |
| Real-time webhooks | Complexity, requires persistent server |
| Manual refresh only | Poor UX, stale data |
| **On-demand with staleness** | User-initiated, checks freshness, auto-prompts when stale |

## Sync Strategy

| Trigger | Behavior | Staleness Threshold |
|---------|----------|---------------------|
| User request | "sync my finances" → full sync | N/A (always syncs) |
| Staleness check | Data older than threshold → prompt sync | 4 hours |
| After connection | New Plaid Link completed → initial sync | N/A (always syncs) |
| Re-auth complete | Credentials refreshed → sync | N/A (always syncs) |
| Finance query | "what's my balance?" → check staleness | 4 hours |

**Staleness logic:**
```javascript
function isStale(lastSyncAt) {
  if (!lastSyncAt) return true;
  const threshold = 4 * 60 * 60 * 1000; // 4 hours
  return Date.now() - new Date(lastSyncAt).getTime() > threshold;
}
```

## Sync Components

### 1. Accounts Sync

Fetches all accounts for a Plaid item and updates local database.

```javascript
const { PlaidApi, PlaidEnvironments, Configuration } = require('plaid');

async function syncAccounts(db, plaidClient, item) {
  const response = await plaidClient.accountsGet({
    access_token: item.access_token,
  });

  const now = new Date().toISOString();

  for (const account of response.data.accounts) {
    db.prepare(`
      INSERT OR REPLACE INTO accounts (
        id, plaid_item_id, name, official_name, type, subtype, mask,
        current_balance, available_balance, limit_amount, currency_code,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        COALESCE((SELECT created_at FROM accounts WHERE id = ?), ?), ?)
    `).run(
      account.account_id,
      item.id,
      account.name,
      account.official_name,
      account.type,
      account.subtype,
      account.mask,
      account.balances.current,
      account.balances.available,
      account.balances.limit,
      account.balances.iso_currency_code || 'USD',
      account.account_id, // for COALESCE lookup
      now,
      now
    );
  }

  return response.data.accounts;
}
```

### 2. Transactions Sync

Fetches transactions using Plaid's sync cursor for incremental updates.

```javascript
async function syncTransactions(db, plaidClient, item) {
  // Get cursor for incremental sync (null for first sync)
  const cursor = db.prepare(
    'SELECT sync_cursor FROM plaid_items WHERE id = ?'
  ).get(item.id)?.sync_cursor;

  let hasMore = true;
  let nextCursor = cursor;
  const added = [];
  const modified = [];
  const removed = [];

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: nextCursor,
    });

    added.push(...response.data.added);
    modified.push(...response.data.modified);
    removed.push(...response.data.removed);

    hasMore = response.data.has_more;
    nextCursor = response.data.next_cursor;
  }

  // Store new cursor
  db.prepare('UPDATE plaid_items SET sync_cursor = ? WHERE id = ?')
    .run(nextCursor, item.id);

  // Process transactions
  const now = new Date().toISOString();

  for (const txn of added) {
    const finalCategory = await resolveCategory(db, txn);
    insertTransaction(db, txn, finalCategory, now);
  }

  for (const txn of modified) {
    const finalCategory = await resolveCategory(db, txn);
    updateTransaction(db, txn, finalCategory, now);
  }

  for (const txn of removed) {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(txn.transaction_id);
  }

  return { added: added.length, modified: modified.length, removed: removed.length };
}

function insertTransaction(db, txn, finalCategory, now) {
  db.prepare(`
    INSERT INTO transactions (
      id, account_id, amount, date, name, merchant_name,
      plaid_category, plaid_category_id, final_category,
      pending, payment_channel, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    txn.transaction_id,
    txn.account_id,
    txn.amount,
    txn.date,
    txn.name,
    txn.merchant_name,
    txn.personal_finance_category?.primary,
    txn.personal_finance_category?.detailed,
    finalCategory,
    txn.pending ? 1 : 0,
    txn.payment_channel,
    now
  );
}
```

### 3. Liabilities Sync

Fetches credit card and loan liability details including due dates.

```javascript
async function syncLiabilities(db, plaidClient, item, accountIds) {
  try {
    const response = await plaidClient.liabilitiesGet({
      access_token: item.access_token,
    });

    const now = new Date().toISOString();

    // Credit cards
    for (const credit of response.data.liabilities.credit || []) {
      db.prepare(`
        UPDATE accounts SET
          next_payment_due_date = ?,
          minimum_payment_amount = ?,
          last_statement_balance = ?,
          last_statement_date = ?,
          is_overdue = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        credit.next_payment_due_date,
        credit.minimum_payment_amount,
        credit.last_statement_balance,
        credit.last_statement_issue_date,
        credit.is_overdue ? 1 : 0,
        now,
        credit.account_id
      );
    }

    // Mortgages/Loans
    for (const mortgage of response.data.liabilities.mortgage || []) {
      db.prepare(`
        UPDATE accounts SET
          next_payment_due_date = ?,
          minimum_payment_amount = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        mortgage.next_payment_due_date,
        mortgage.next_monthly_payment,
        now,
        mortgage.account_id
      );
    }

    // Student loans
    for (const student of response.data.liabilities.student || []) {
      db.prepare(`
        UPDATE accounts SET
          next_payment_due_date = ?,
          minimum_payment_amount = ?,
          is_overdue = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        student.next_payment_due_date,
        student.minimum_payment_amount,
        student.is_overdue ? 1 : 0,
        now,
        student.account_id
      );
    }

    return { synced: true };
  } catch (err) {
    // PRODUCT_NOT_READY or institution doesn't support liabilities
    if (err.response?.data?.error_code === 'PRODUCT_NOT_READY') {
      return { synced: false, reason: 'product_not_ready' };
    }
    throw err;
  }
}
```

### 4. Investments Sync

Fetches investment holdings and securities data.

```javascript
async function syncInvestments(db, plaidClient, item, accountIds) {
  try {
    const response = await plaidClient.investmentsHoldingsGet({
      access_token: item.access_token,
    });

    const now = new Date().toISOString();
    const securities = new Map();

    // Index securities by ID
    for (const security of response.data.securities) {
      securities.set(security.security_id, security);
    }

    // Clear old holdings for these accounts
    const accountIdsStr = accountIds.map(() => '?').join(',');
    db.prepare(`DELETE FROM holdings WHERE account_id IN (${accountIdsStr})`)
      .run(...accountIds);

    // Insert current holdings
    for (const holding of response.data.holdings) {
      const security = securities.get(holding.security_id);

      const costBasis = holding.cost_basis;
      const currentValue = holding.institution_value;
      const gainLoss = costBasis ? currentValue - costBasis : null;
      const gainLossPercent = costBasis && costBasis > 0
        ? ((currentValue - costBasis) / costBasis) * 100
        : null;

      db.prepare(`
        INSERT INTO holdings (
          account_id, security_id, name, ticker_symbol,
          quantity, cost_basis, current_value, gain_loss, gain_loss_percent,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        holding.account_id,
        holding.security_id,
        security?.name || 'Unknown Security',
        security?.ticker_symbol,
        holding.quantity,
        costBasis,
        currentValue,
        gainLoss,
        gainLossPercent,
        now
      );
    }

    // Update account total holdings value
    for (const account of response.data.accounts) {
      if (account.type === 'investment') {
        const totalValue = response.data.holdings
          .filter(h => h.account_id === account.account_id)
          .reduce((sum, h) => sum + (h.institution_value || 0), 0);

        db.prepare(`
          UPDATE accounts SET holdings_value = ?, updated_at = ?
          WHERE id = ?
        `).run(totalValue, now, account.account_id);
      }
    }

    return { holdings: response.data.holdings.length };
  } catch (err) {
    if (err.response?.data?.error_code === 'PRODUCT_NOT_READY') {
      return { synced: false, reason: 'product_not_ready' };
    }
    throw err;
  }
}
```

## Transaction Categorization

### Category Hierarchy

Three-level hierarchical structure:

```
Category (L1) > Subcategory (L2) > Merchant (L3)

Example:
Food & Drink > Restaurants > Chipotle
Shopping > Groceries > Trader Joe's
Transportation > Rideshare > Uber
```

### Category Resolution Priority

**Priority order: User Override > Learned Pattern > Plaid Category**

```javascript
async function resolveCategory(db, transaction) {
  const merchantName = transaction.merchant_name || transaction.name;
  const normalizedMerchant = normalizeMerchant(merchantName);

  // 1. Check user override for this merchant
  const override = getMerchantOverride(normalizedMerchant);
  if (override) {
    return override.category;
  }

  // 2. Check learned patterns (from previous corrections)
  const learned = getLearnedCategory(db, normalizedMerchant);
  if (learned) {
    return learned.category;
  }

  // 3. Fall back to Plaid's category
  return mapPlaidCategory(transaction.personal_finance_category);
}

function normalizeMerchant(name) {
  // Remove transaction-specific identifiers
  // "AMAZON.COM*1234ABC" -> "AMAZON.COM"
  // "UBER   *TRIP" -> "UBER"
  return name
    .replace(/\*[A-Z0-9]+$/i, '')  // Remove *ID suffix
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .trim()
    .toUpperCase();
}
```

### User Correction Flow

When user corrects a transaction category:

```javascript
async function correctCategory(db, transactionId, newCategory, applyToAll) {
  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?')
    .get(transactionId);

  if (!txn) throw new Error('Transaction not found');

  // Update this transaction
  db.prepare(`
    UPDATE transactions
    SET user_category = ?, final_category = ?
    WHERE id = ?
  `).run(newCategory, newCategory, transactionId);

  // If user wants to apply to all from this merchant
  if (applyToAll) {
    const merchantName = txn.merchant_name || txn.name;
    const normalizedMerchant = normalizeMerchant(merchantName);

    // Save merchant override
    saveMerchantOverride(normalizedMerchant, newCategory);

    // Update existing transactions from this merchant
    db.prepare(`
      UPDATE transactions
      SET user_category = ?, final_category = ?
      WHERE (merchant_name = ? OR name = ?)
        AND user_category IS NULL
    `).run(newCategory, newCategory, txn.merchant_name, txn.name);

    return { updated: 'all_matching', merchant: normalizedMerchant };
  }

  return { updated: 'single' };
}
```

### Merchant Override Storage

Overrides stored in JSON file (not sensitive, doesn't need encryption):

**Location:** `~/.pai/data/finance/merchant-overrides.json`

```json
{
  "AMAZON.COM": {
    "category": "Shopping > Online",
    "created_at": "2026-01-15T10:30:00Z"
  },
  "UBER": {
    "category": "Transportation > Rideshare",
    "created_at": "2026-01-14T08:15:00Z"
  },
  "CHIPOTLE": {
    "category": "Food & Drink > Restaurants > Fast Casual",
    "created_at": "2026-01-13T12:00:00Z"
  }
}
```

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

const OVERRIDES_PATH = path.join(
  os.homedir(),
  '.pai/data/finance/merchant-overrides.json'
);

function getMerchantOverride(normalizedMerchant) {
  if (!fs.existsSync(OVERRIDES_PATH)) return null;
  const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
  return overrides[normalizedMerchant] || null;
}

function saveMerchantOverride(normalizedMerchant, category) {
  let overrides = {};
  if (fs.existsSync(OVERRIDES_PATH)) {
    overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
  }

  overrides[normalizedMerchant] = {
    category,
    created_at: new Date().toISOString(),
  };

  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
}
```

### Plaid Category Mapping

Maps Plaid's personal_finance_category to our hierarchy:

```javascript
const PLAID_CATEGORY_MAP = {
  'INCOME': 'Income',
  'TRANSFER_IN': 'Transfers > Incoming',
  'TRANSFER_OUT': 'Transfers > Outgoing',
  'LOAN_PAYMENTS': 'Bills & Utilities > Loan Payment',
  'BANK_FEES': 'Fees & Charges > Bank Fees',
  'ENTERTAINMENT': 'Entertainment',
  'FOOD_AND_DRINK': 'Food & Drink',
  'GENERAL_MERCHANDISE': 'Shopping',
  'HOME_IMPROVEMENT': 'Home > Improvement',
  'MEDICAL': 'Healthcare > Medical',
  'PERSONAL_CARE': 'Healthcare > Personal Care',
  'GENERAL_SERVICES': 'Services',
  'GOVERNMENT_AND_NON_PROFIT': 'Government & Taxes',
  'TRANSPORTATION': 'Transportation',
  'TRAVEL': 'Travel',
  'RENT_AND_UTILITIES': 'Bills & Utilities',
};

function mapPlaidCategory(personalFinanceCategory) {
  if (!personalFinanceCategory) return 'Uncategorized';

  const primary = personalFinanceCategory.primary;
  const detailed = personalFinanceCategory.detailed;

  // Try detailed mapping first
  const detailedKey = `${primary}_${detailed}`;
  if (PLAID_CATEGORY_MAP[detailedKey]) {
    return PLAID_CATEGORY_MAP[detailedKey];
  }

  // Fall back to primary
  return PLAID_CATEGORY_MAP[primary] || 'Uncategorized';
}
```

## Full Sync Flow

Orchestrates all sync components for a Plaid item:

```javascript
async function fullSync(db, item) {
  const credentials = loadCredentials();
  const plaidClient = createPlaidClient(credentials);

  const results = {
    item_id: item.id,
    institution: item.institution_name,
    started_at: new Date().toISOString(),
    accounts: { count: 0 },
    transactions: { added: 0, modified: 0, removed: 0 },
    liabilities: { synced: false },
    investments: { holdings: 0 },
    errors: [],
  };

  try {
    // 1. Sync accounts first (needed for other syncs)
    const accounts = await syncAccounts(db, plaidClient, item);
    results.accounts.count = accounts.length;

    const accountIds = accounts.map(a => a.account_id);
    const accountTypes = new Set(accounts.map(a => a.type));

    // 2. Sync transactions
    const txnResults = await syncTransactions(db, plaidClient, item);
    results.transactions = txnResults;

    // 3. Sync liabilities (if credit or loan accounts)
    if (accountTypes.has('credit') || accountTypes.has('loan')) {
      results.liabilities = await syncLiabilities(db, plaidClient, item, accountIds);
    }

    // 4. Sync investments (if investment accounts)
    if (accountTypes.has('investment')) {
      results.investments = await syncInvestments(db, plaidClient, item, accountIds);
    }

    // Update last_sync_at
    db.prepare('UPDATE plaid_items SET last_sync_at = ? WHERE id = ?')
      .run(new Date().toISOString(), item.id);

  } catch (err) {
    results.errors.push({
      code: err.response?.data?.error_code || 'UNKNOWN',
      message: err.message,
    });

    // Handle specific errors
    if (err.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
      db.prepare('UPDATE plaid_items SET status = ? WHERE id = ?')
        .run('needs_reauth', item.id);
    }
  }

  results.completed_at = new Date().toISOString();
  return results;
}

async function syncAllItems(db) {
  const items = db.prepare(
    "SELECT * FROM plaid_items WHERE status = 'active'"
  ).all();

  const results = [];
  for (const item of items) {
    const result = await fullSync(db, item);
    results.push(result);
  }

  return results;
}
```

## Data Display Format

### Sync Results Summary

```
Finance Sync Complete
---------------------
Chase Checking           ✓ synced
  Accounts: 2
  Transactions: +15 new, 2 modified

American Express         ✓ synced
  Accounts: 1
  Transactions: +8 new
  Next payment: $1,234.56 due Jan 28

Fidelity 401k            ✓ synced
  Accounts: 1
  Holdings: 12 positions
  Total value: $45,678.90 (+2.3%)

Last synced: just now
```

### After Query (with staleness)

```
Account Balances
----------------
Chase Checking      $5,432.10
Chase Savings      $12,345.67

(Data from 6 hours ago. Sync now?)
```

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `ITEM_LOGIN_REQUIRED` | Bank credentials changed | Mark item `needs_reauth`, prompt user to reconnect |
| `PRODUCT_NOT_READY` | Liabilities/investments not yet available | Skip component, continue with others, retry later |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Exponential backoff, retry after delay |
| `INSTITUTION_DOWN` | Bank's systems unavailable | Skip item, continue with others, retry later |
| `NO_ACCOUNTS` | Item has no accounts | Log warning, may need re-authentication |
| `TRANSACTIONS_LIMIT` | Transaction history limit reached | Use cursor-based sync, fetch incrementally |
| `INVALID_ACCESS_TOKEN` | Token corrupted or revoked | Mark item `needs_reauth`, prompt reconnection |
| Network timeout | Connectivity issue | Retry with exponential backoff (max 3 attempts) |

### Error Recovery Flow

```javascript
async function syncWithRetry(db, item, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fullSync(db, item);
    } catch (err) {
      lastError = err;
      const errorCode = err.response?.data?.error_code;

      // Don't retry auth errors
      if (errorCode === 'ITEM_LOGIN_REQUIRED' ||
          errorCode === 'INVALID_ACCESS_TOKEN') {
        throw err;
      }

      // Exponential backoff for retryable errors
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

## Related Protocols

- [Finance Storage](finance-storage.md) - Where synced data is stored
- [Plaid Link](plaid-link.md) - How access_tokens are obtained
- [Autonomy Levels](autonomy-levels.md) - Finance is Advisor level (read-only)

## Implementation Notes

### Dependencies

```bash
# Plaid SDK (already installed for Plaid Link)
npm install plaid
```

### Sync on Session Start

Recommended pattern: check staleness when user first asks about finances:

```javascript
async function handleFinanceQuery(db, query) {
  const items = db.prepare('SELECT * FROM plaid_items WHERE status = ?')
    .all('active');

  const staleItems = items.filter(item => isStale(item.last_sync_at));

  if (staleItems.length > 0) {
    // Auto-sync if within reasonable staleness
    if (staleItems.every(item => hoursStale(item.last_sync_at) < 24)) {
      console.log('Syncing financial data...');
      await syncAllItems(db);
    } else {
      // Prompt for very stale data
      return {
        prompt: `Your financial data is ${formatAge(staleItems[0].last_sync_at)} old. Sync now?`,
        action: 'sync_prompt',
      };
    }
  }

  // Continue with query using fresh data
  return processFinanceQuery(db, query);
}
```

### Uncategorized Transaction Handling

Flag transactions needing review:

```javascript
function getUncategorizedTransactions(db, limit = 10) {
  return db.prepare(`
    SELECT * FROM transactions
    WHERE final_category = 'Uncategorized'
    ORDER BY date DESC
    LIMIT ?
  `).all(limit);
}
```

When displaying: "You have 3 uncategorized transactions. Would you like to categorize them?"
