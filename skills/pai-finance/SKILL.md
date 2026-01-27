---
name: pai-finance
description: Financial visibility with bank sync, spending analysis, and payment alerts. USE WHEN finances, spending, transactions, bank balance, accounts, how much did I spend, payment due, credit card, bills, budget, where is my money going.
tools: [Bash, Read, Write]
---

# PAI Finance

Financial assistant that syncs bank accounts, tracks spending, detects anomalies, and provides actionable insights.

## Philosophy

**Observe -> Analyze -> Report** (not transact)

- Fetch real financial data from connected accounts via Plaid
- Analyze spending patterns, detect anomalies, track due dates
- Report findings clearly with actionable recommendations
- Advisor mode only (read-only, no transactions)
- All data stored locally and encrypted

**Key Principles:**
- Privacy-first: All data local, encrypted, user-controlled
- Read-only: Never initiate transactions or transfers
- Proactive insights: Surface important patterns without being asked
- Hybrid categorization: User corrections take precedence over Plaid

## Workflows

| Workflow | Trigger | Output |
|----------|---------|--------|
| **Connect** | "connect my bank", "add account" | Plaid Link OAuth flow |
| **Sync** | "sync finances", finance query when stale | Fresh data from Plaid |
| **View Accounts** | "show accounts", "balances" | Account list with balances |
| **View Transactions** | "recent transactions", "show spending" | Transaction history |
| **Insights** | "spending insights", session start | Trends, anomalies, recommendations |
| **Due Dates** | "payment due", "upcoming bills" | Payment alert summary |
| **Categorize** | "fix category", "that's actually groceries" | Update transaction category |

## Instructions

### 1. Connect Bank Account

Initiate Plaid Link OAuth flow to connect a new financial institution.

**When to trigger:**
- User asks: "connect my bank", "link my account", "add bank account"

**Prerequisites:**
1. Plaid credentials at `~/.pai/secrets/finance/plaid-credentials.json`
2. Directory permissions set (700 on secrets, 600 on credential file)

**Flow:**
1. Verify credentials file exists
2. Start localhost callback server (port 8234)
3. Open browser with Plaid Link
4. User authenticates with bank
5. Capture public_token from callback
6. Exchange for access_token
7. Store in encrypted database
8. Initial sync triggered automatically

**Response format:**
```
Opening browser for bank authentication...

[After completion]
Connected: Chase Bank
- 2 accounts found (Checking, Savings)
- Initial sync complete: 150 transactions loaded

Your financial data is now synced. Ask me about your spending!
```

See: [Plaid Link Protocol](core/protocols/plaid-link.md)

### 2. Sync Financial Data

Fetch latest data from all connected institutions.

**When to trigger:**
- User asks: "sync my finances", "refresh accounts"
- Staleness detected: Data older than 4 hours and user queries finances
- After new connection: Automatic initial sync

**Staleness check:**
```javascript
const STALE_THRESHOLD = 4 * 60 * 60 * 1000; // 4 hours
const isStale = (lastSync) => Date.now() - new Date(lastSync) > STALE_THRESHOLD;
```

**Sync components:**
1. Accounts (balances, limits)
2. Transactions (incremental via cursor)
3. Liabilities (due dates, minimums) - if credit/loan accounts
4. Investments (holdings, values) - if investment accounts

**Response format:**
```
Syncing financial data...

Chase Bank                 synced
  Accounts: 2
  Transactions: +12 new

American Express           synced
  Accounts: 1
  Transactions: +5 new
  Next payment: $125.00 due Jan 28

Last synced: just now
```

See: [Finance Sync Protocol](core/protocols/finance-sync.md)

### 3. View Accounts

Display connected accounts with current balances.

**When to trigger:**
- User asks: "show my accounts", "what are my balances", "how much in checking"

**Display format:**
```
Your Accounts
-------------
Chase (synced 2 hours ago)
  Checking (...1234)      $5,432.10
  Savings (...5678)      $12,345.67

American Express (synced 2 hours ago)
  Blue Cash (...9012)    -$567.89 / $10,000 limit (5.7% used)
  Next payment: $125.00 due Jan 28

Fidelity (synced 2 hours ago)
  401(k) (...3456)       $45,678.90 (+2.3% MTD)

Total liquid: $17,777.77
Total credit used: $567.89
```

**Data source:** Query accounts table from finance.db

### 4. View Transactions

Show recent transactions, optionally filtered.

**When to trigger:**
- User asks: "recent transactions", "show spending", "what did I spend on"
- User asks about specific category: "dining transactions", "Amazon purchases"

**Filter options:**
- By date range: "transactions this week", "January spending"
- By category: "restaurant transactions", "shopping"
- By merchant: "Uber transactions", "Amazon"
- By account: "credit card transactions"

**Display format:**
```
Recent Transactions (last 7 days)
---------------------------------
Jan 25  Chipotle              -$12.45   Food & Drink > Restaurants
Jan 25  Uber                  -$18.90   Transportation > Rideshare
Jan 24  Amazon.com           -$45.67   Shopping > Online
Jan 24  Trader Joe's         -$67.89   Food & Drink > Groceries
Jan 23  Netflix               -$15.99   Entertainment > Streaming
...

Total: $234.56 (15 transactions)
```

**With category filter:**
```
Dining Out - January 2026
-------------------------
Jan 25  Chipotle              $12.45
Jan 22  Panda Express         $14.67
Jan 20  Olive Garden          $45.89
Jan 18  McDonald's             $8.90
...

Total: $156.78 (8 transactions)
Compared to December: +23% ($127.34)
```

### 5. Spending Insights

Analyze spending patterns and provide recommendations.

**When to trigger:**
- User asks: "spending insights", "analyze my spending", "where is my money going"
- Session start (proactive summary of key insights)

**Analysis components:**
1. **Trends:** Month-over-month changes by category
2. **Anomalies:** Unusual transactions or spending spikes
3. **Recommendations:** Actionable observations

**Display format:**
```
Spending Insights - January 2026
================================

Trends:
- Food & Drink up 23% ($892 vs $725 last month)
  > Restaurants drove the increase (+45%)
- Shopping down 15% ($567 vs $668) - nice work!
- Entertainment up 67% due to concert tickets

Unusual Activity:
- Large transaction: $450 at Best Buy (typical ~$100)
- New merchant: ACME Corp ($350) - first time

Recommendations:
1. [Reduce] Dining out trending up - consider meal planning
2. [Celebrate] Shopping down 15% - keep it up!
3. [Monitor] Verify the Best Buy charge

Would you like details on any category?
```

See: [Spending Insights Protocol](core/protocols/spending-insights.md)

### 6. Payment Due Dates

Show upcoming payment obligations.

**When to trigger:**
- User asks: "when are payments due", "upcoming bills", "credit card due"
- Session start if payment within 3 days (proactive alert)

**Priority levels:**
| Priority | Window | Display |
|----------|--------|---------|
| Critical | Overdue | Always show first |
| High | Due in 1 day | Immediate alert |
| Medium | Due in 7 days | Include in summary |
| Low | Due in 14 days | On request only |

**Display format:**
```
Payment Reminders
-----------------
DUE TOMORROW:
  Chase Sapphire        $125.00 min   (balance: $2,345.67)

Due this week:
  Amex Blue             $78.00 min    due Jan 28
  Car Loan              $345.00       due Jan 30

Coming up:
  Mortgage              $1,850.00     due Feb 1

Set up autopay to avoid late fees ($25-40 each).
```

### 7. Categorize Transactions

Correct or update transaction categories.

**When to trigger:**
- User corrects: "that Costco charge is groceries, not shopping"
- User reviews uncategorized: "show uncategorized transactions"

**Correction flow:**
1. User identifies transaction to correct
2. User provides correct category
3. Ask: "Apply to all future transactions from this merchant?"
4. Update transaction(s)
5. If "apply to all": save merchant override

**Response format:**
```
Updated: Costco transaction ($123.45) -> Food & Drink > Groceries

Apply this category to all future Costco transactions? [yes/no]

> yes

Got it. Future Costco transactions will be categorized as Groceries.
```

**Uncategorized review:**
```
Uncategorized Transactions (3)
------------------------------
1. Jan 24  ACME CORP*1234        $350.00
2. Jan 22  SQ *COFFEE SHOP       $5.45
3. Jan 20  PAYPAL *TRANSFER      $25.00

Which would you like to categorize? (enter number or 'all')
```

## Protocol References

- @core/protocols/finance-storage.md - Encrypted SQLite storage, schema, keychain integration
- @core/protocols/plaid-link.md - Bank connection OAuth flow, callback server
- @core/protocols/finance-sync.md - Data sync strategy, transaction categorization
- @core/protocols/spending-insights.md - Trend analysis, anomaly detection, recommendations

## Example Interactions

**Example 1: First-time setup**
```
User: "I want to track my spending"

Action:
1. Check for existing connections
2. None found - explain setup process
3. Guide user to create Plaid credentials
4. Initiate connect flow when ready
```

**Example 2: Balance check**
```
User: "What's my checking balance?"

Action:
1. Check sync staleness (>4 hours?)
2. If stale, prompt: "Data is 6 hours old. Sync first?"
3. Display checking account balance
4. Note any pending transactions
```

**Example 3: Spending analysis**
```
User: "Where did my money go this month?"

Action:
1. Sync if stale
2. Calculate spending by category
3. Compare to last month
4. Highlight biggest categories and changes
5. Surface any anomalies
```

**Example 4: Payment reminder**
```
User: "When is my credit card due?"

Action:
1. Query accounts with payment due dates
2. Sort by due date
3. Highlight any past due or due soon
4. Show minimum payment amounts
```

**Example 5: Category correction**
```
User: "That Amazon charge was actually a gift"

Action:
1. Identify the Amazon transaction in question
2. Update category to "Gifts"
3. Ask about future Amazon transactions
4. If yes, save merchant override
```

**Example 6: Session start**
```
[User opens finance conversation]

Action:
1. Check sync staleness
2. Query high-priority payment alerts
3. Detect recent anomalies
4. Surface brief summary proactively:
   "Quick finance update: Amex due tomorrow ($125).
    Spending this month: $2,345 (on track).
    1 unusual transaction to review."
```

## Session Start Checklist

When starting a session with finance context:

1. **Check sync staleness** - Prompt if >4 hours old
2. **Check payment alerts** - Surface any due in 3 days
3. **Check high-severity anomalies** - Alert on large/unusual transactions
4. **Quick summary** - This month's spending vs last month
5. **Ready for queries**

## Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| No credentials | First setup incomplete | "To connect your bank, first create Plaid credentials at ~/.pai/secrets/finance/plaid-credentials.json" |
| No accounts | No banks connected | "No accounts connected yet. Say 'connect my bank' to get started." |
| Stale data | Long time since sync | "Your data is [X] old. Sync now?" |
| Needs re-auth | Bank credentials changed | "[Institution] needs re-authentication. Reconnect?" |
| Sync failed | Network or API error | "Couldn't sync [institution]. Try again or check connection." |

## Related

- [Finance Domain](core/agents/pai-domains.md) - Autonomy level (Advisor - read-only)
- [PAI Calendar](~/.pai/skills/pai-calendar/SKILL.md) - Similar workflow pattern
