# Connected Accounts

Registry of financial accounts connected via Plaid Link.

## Purpose

Track all connected financial institutions (Plaid Items). Each Item represents one bank connection and can contain multiple accounts (e.g., checking + savings at same bank).

## Account Types

| Type | Examples | Display |
|------|----------|---------|
| Checking | Primary checking, business checking | Balance |
| Savings | Emergency fund, high-yield savings | Balance |
| Credit Card | Visa, Amex, store cards | Balance (negative), due date, minimum |
| Investment | Brokerage, 401k, IRA | Value + holdings breakdown |
| Loan | Mortgage, auto, student, personal | Balance (negative), due date, minimum |

## Connected Accounts

*Template — populated when accounts are connected via Plaid Link*

| Institution | Account Type | Last 4 | Plaid Item ID | Status | Last Sync |
|-------------|--------------|--------|---------------|--------|-----------|
| — | — | — | — | — | — |

## Grouping Views

PAI can display accounts in two views:

### By Type (Default)

Groups all accounts by type for net worth clarity:
- **Cash**: All checking + savings
- **Credit**: All credit cards (shows total owed)
- **Investments**: Brokerage + retirement accounts
- **Debt**: Loans and mortgages

### By Institution

Groups accounts by bank for per-institution view:
- Bank of America: Checking (••1234), Savings (••5678)
- Chase: Credit Card (••9012)

Toggle with "show accounts by institution" or "show accounts by type".

## Payment Due Dates

For credit cards and loans, track upcoming payments:

| Account | Due Date | Minimum Payment | Current Balance |
|---------|----------|-----------------|-----------------|
| — | — | — | — |

**Proactive alerts:**
- 7 days before due date: Reminder notification
- 1 day before due date: Final reminder
- Past due: Alert immediately

## Net Worth Display

Net worth calculated as: (Cash + Investments) - (Credit + Debt)

**Display conventions:**
- Shown at bottom of account summary
- Not emphasized or prominent
- Format: "Net worth: $XX,XXX" (or "Total: $XX,XXX" if preferred)

## Re-authentication

Plaid tokens expire periodically. When token expires:

1. PAI alerts: "Your [Bank] connection needs re-authentication"
2. Run: Plaid Link update flow (browser-based)
3. Token refreshed, sync resumes

**Status indicators:**
- `active` - Connection healthy, syncing normally
- `needs_auth` - Token expired, re-authentication required
- `error` - Connection issue (contact support)
