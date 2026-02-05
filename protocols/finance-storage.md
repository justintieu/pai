# Finance Storage Protocol

Encrypted SQLite storage for financial data with keychain-managed encryption keys.

## Problem Being Solved

Financial data is highly sensitive and must be stored securely locally:
- Plaid access tokens grant full account access and must never leak
- Transaction history reveals personal spending patterns
- Account balances and credit limits are private information
- Investment holdings expose net worth

Plain-text storage is unacceptable. The storage system needs:
- Encryption at rest
- Secure key management (not in config files)
- Schema that supports the full Plaid data model
- Protection against accidental exposure in backups

## Solution

- **SQLCipher-encrypted SQLite database** at `~/.pai/data/finance/finance.db`
- **Encryption key stored in system keychain** via keytar (service: "pai-finance", account: "db-key")
- **First-time setup generates random 32-byte key** and stores in keychain
- **All queries go through encrypted connection** - data is never decrypted to disk

### Why This Approach

| Alternative | Why Not |
|-------------|---------|
| Environment variable | Visible in process lists, logs, shell history |
| Config file | Accidentally committed, backed up unencrypted |
| Hardware key | Not universally available, complexity |
| Cloud KMS | Network dependency, latency, cost |
| **System keychain** | OS-level security, no network, user-scoped access |

## File Locations

```
~/.pai/
├── secrets/
│   └── finance/
│       └── plaid-tokens.encrypted   # Plaid access tokens (additional layer)
└── data/
    └── finance/
        ├── finance.db               # SQLCipher-encrypted SQLite
        └── merchant-overrides.json  # Category corrections (not sensitive)
```

**Note:** `merchant-overrides.json` is intentionally not encrypted - it contains only user-defined category mappings (e.g., "AMZN*1234" -> "Groceries") with no financial values.

## Database Schema

```sql
-- Plaid Items (one per connected institution)
CREATE TABLE plaid_items (
  id TEXT PRIMARY KEY,              -- Plaid item_id
  institution_id TEXT NOT NULL,     -- Plaid institution_id
  institution_name TEXT NOT NULL,
  access_token TEXT NOT NULL,       -- Encrypted Plaid access_token
  status TEXT DEFAULT 'active',     -- active, needs_reauth, removed
  created_at TEXT NOT NULL,
  last_sync_at TEXT
);

-- Financial Accounts
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,              -- Plaid account_id
  plaid_item_id TEXT NOT NULL REFERENCES plaid_items(id),
  name TEXT NOT NULL,
  official_name TEXT,
  type TEXT NOT NULL,               -- depository, credit, loan, investment
  subtype TEXT,                     -- checking, savings, credit card, etc.
  mask TEXT,                        -- Last 4 digits
  current_balance REAL,
  available_balance REAL,
  limit_amount REAL,                -- Credit limit for credit cards
  currency_code TEXT DEFAULT 'USD',
  -- Liability fields (credit cards and loans)
  next_payment_due_date TEXT,
  minimum_payment_amount REAL,
  last_statement_balance REAL,
  last_statement_date TEXT,
  is_overdue INTEGER DEFAULT 0,
  -- Investment fields
  holdings_value REAL,
  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,              -- Plaid transaction_id
  account_id TEXT NOT NULL REFERENCES accounts(id),
  amount REAL NOT NULL,             -- Positive = expense, Negative = income
  date TEXT NOT NULL,               -- YYYY-MM-DD
  name TEXT NOT NULL,               -- Merchant/description
  merchant_name TEXT,               -- Cleaned merchant name
  -- Categorization
  plaid_category TEXT,              -- Original Plaid category
  plaid_category_id TEXT,
  user_category TEXT,               -- User override (if corrected)
  final_category TEXT NOT NULL,     -- Resolved category (user > plaid)
  -- Metadata
  pending INTEGER DEFAULT 0,
  payment_channel TEXT,             -- online, in store, etc.
  created_at TEXT NOT NULL
);

-- Investment Holdings (for investment accounts)
CREATE TABLE holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  security_id TEXT,
  name TEXT NOT NULL,
  ticker_symbol TEXT,
  quantity REAL NOT NULL,
  cost_basis REAL,
  current_value REAL NOT NULL,
  gain_loss REAL,
  gain_loss_percent REAL,
  updated_at TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(final_category);
CREATE INDEX idx_accounts_type ON accounts(type);
```

### Schema Design Notes

**plaid_items:** One record per linked bank/credit card institution. The `access_token` is the most sensitive field - it grants full API access to that institution's data.

**accounts:** Maps to Plaid's account model. Includes fields for depository (checking/savings), credit (cards), and investment accounts. The `type` field determines which optional fields are relevant.

**transactions:** Core financial data. Uses Plaid's sign convention (positive = money out, negative = money in). The `final_category` is the resolved category after considering user overrides.

**holdings:** Investment positions for brokerage/retirement accounts. Updated on each sync to reflect current market values.

## Security Model

### Encryption Key Generation (First-Time Setup)

```javascript
const crypto = require('crypto');
const keytar = require('keytar');

async function initializeEncryption() {
  let key = await keytar.getPassword('pai-finance', 'db-key');
  if (!key) {
    // Generate 32-byte (256-bit) random key
    key = crypto.randomBytes(32).toString('hex');
    await keytar.setPassword('pai-finance', 'db-key', key);
    console.log('Finance encryption key generated and stored in keychain');
  }
  return key;
}
```

### Database Connection

```javascript
const Database = require('better-sqlite3-multiple-ciphers');
const keytar = require('keytar');
const path = require('path');
const os = require('os');

async function openDatabase() {
  const key = await keytar.getPassword('pai-finance', 'db-key');
  if (!key) {
    throw new Error('Finance encryption key not found. Run setup first.');
  }

  const dbPath = path.join(os.homedir(), '.pai/data/finance/finance.db');
  const db = new Database(dbPath);

  // Apply encryption key
  db.pragma(`key='${key}'`);

  // Verify encryption is working
  try {
    db.exec('SELECT 1');
  } catch (err) {
    throw new Error('Database decryption failed. Key may be incorrect.');
  }

  return db;
}
```

### Plaid Token Storage

Access tokens are stored in the encrypted database, providing layered protection:

1. **Layer 1:** SQLCipher encrypts entire database file
2. **Layer 2:** Tokens only accessible via authenticated queries
3. **Layer 3:** Database key stored in OS keychain (not filesystem)

For additional security, tokens can be encrypted a second time before storage using a separate key, but the base SQLCipher encryption is the primary protection.

### Keychain Integration

| OS | Keychain Backend | Notes |
|----|------------------|-------|
| macOS | Keychain.app | Requires user login, TouchID prompt possible |
| Windows | Credential Manager | Per-user credential store |
| Linux | libsecret (GNOME Keyring) | May need `gnome-keyring-daemon` running |

The `keytar` library abstracts these differences. Key is stored as:
- **Service:** `pai-finance`
- **Account:** `db-key`
- **Password:** 64-character hex string (32 bytes)

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| Key not found in keychain | First run, or keychain cleared | Prompt: "Finance encryption key missing. Run `pai finance setup` to initialize." |
| Database decrypt failed | Wrong key, corrupted file | Check keychain integrity. If key exists but doesn't work, database may need fresh setup. |
| Database file missing | First run, or deleted | Create fresh database with schema on first access. |
| Keytar not available | Missing native module | Install keytar or use fallback (prompt for key). |
| Permission denied | File permissions | Check `~/.pai/data/finance/` ownership and permissions. |

### Initialization Flow

```javascript
async function ensureDatabase() {
  const dataDir = path.join(os.homedir(), '.pai/data/finance');

  // Ensure directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  }

  // Ensure encryption key exists
  const key = await initializeEncryption();

  // Open/create database
  const dbPath = path.join(dataDir, 'finance.db');
  const db = new Database(dbPath);
  db.pragma(`key='${key}'`);

  // Create schema if needed
  const tableCount = db.prepare(
    "SELECT count(*) as c FROM sqlite_master WHERE type='table'"
  ).get().c;

  if (tableCount === 0) {
    db.exec(SCHEMA_SQL);
    console.log('Finance database initialized');
  }

  return db;
}
```

## Backup Considerations

### What's Safe to Backup

- **`finance.db`** - Encrypted, safe to backup (without key, it's random bytes)
- **`merchant-overrides.json`** - Not sensitive, safe to backup

### What's NOT in Backup

- **Encryption key** - Stored only in system keychain
- **Decrypted data** - Never written to disk

### Restore Process

1. Restore `finance.db` file to `~/.pai/data/finance/`
2. If restoring to same machine: keychain should have key
3. If restoring to new machine: key is lost, start fresh
4. Alternative: Export key before migration (with extreme caution)

### Key Export (Advanced)

For migration between machines (handle with extreme care):

```bash
# Export (source machine) - do NOT store this permanently
security find-generic-password -s "pai-finance" -a "db-key" -w

# Import (destination machine)
keytar set-password pai-finance db-key <key-value>
```

## Related

- [Plaid Sync Protocol](plaid-sync.md) - How data flows from Plaid to this storage
- [Finance Dashboard Protocol](finance-dashboard.md) - How data is queried for display
- [Autonomy Levels](autonomy-levels.md) - Finance is Advisor level (read-only by default)

## Implementation Notes

### Dependencies

```bash
# SQLCipher-compatible SQLite binding
npm install better-sqlite3-multiple-ciphers

# Keychain access
npm install keytar
```

**Note:** `keytar` requires native compilation. On some systems:
```bash
# macOS (if needed)
xcode-select --install

# Linux
sudo apt-get install libsecret-1-dev
```

### Directory Permissions

Finance data directory should be user-only:

```bash
chmod 700 ~/.pai/data/finance
chmod 600 ~/.pai/data/finance/finance.db
```

### Query Patterns

Common queries optimized by indexes:

```sql
-- Monthly spending by category
SELECT final_category, SUM(amount) as total
FROM transactions
WHERE date >= '2026-01-01' AND date < '2026-02-01'
  AND amount > 0
GROUP BY final_category
ORDER BY total DESC;

-- Recent transactions for an account
SELECT * FROM transactions
WHERE account_id = ?
ORDER BY date DESC
LIMIT 50;

-- Credit card utilization
SELECT
  a.name,
  a.current_balance,
  a.limit_amount,
  ROUND(a.current_balance / a.limit_amount * 100, 1) as utilization_pct
FROM accounts a
WHERE a.type = 'credit';
```
