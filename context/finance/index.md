# Finance

Read-only financial visibility across all connected accounts with automatic categorization and spending insights.

## Purpose

This directory stores your connected financial accounts so PAI can provide unified visibility across all your finances. Connect accounts via Plaid Link, see aggregated balances, review categorized transactions, and receive proactive insights. Strictly read-only — PAI observes and reports, never modifies.

## Contents

| Path | Purpose |
|------|---------|
| [accounts.md](accounts.md) | Connected accounts registry with due dates |
| [categories.md](categories.md) | Hierarchical category taxonomy |

## How It Works

1. **Connect accounts** - Add financial institutions via Plaid Link (browser-based OAuth)
2. **On-demand sync** - PAI fetches latest balances and transactions when you ask
3. **Automatic categorization** - Transactions categorized using Plaid + learned corrections
4. **Spending insights** - Trend analysis, unusual spending alerts, and recommendations

## Managing Your Finances

### Add Accounts

Connect new accounts via Plaid Link flow:
- Opens browser for bank OAuth authentication
- Tokens stored securely in `~/.pai/secrets/`
- Supports: checking, savings, credit cards, investments, loans/mortgages

### View Balances

- "Show my accounts" - See all account balances grouped by type
- "Check balances" - Quick net worth summary
- "How much in savings?" - Specific account type

### Review Transactions

- "Recent transactions" - Last 30 days across all accounts
- "Spending on dining" - Category-filtered view
- "Transactions from Costco" - Merchant-filtered view

### Get Insights

- "Spending trends" - Month-over-month analysis
- "Unusual activity" - Spending pattern alerts
- "How am I doing this month?" - Contextual summary

## Sync Behavior

| Trigger | Action |
|---------|--------|
| "Sync finances" | Full sync of all connected accounts |
| During session | Use cached data (refresh on request) |
| Token expiry | Alert user to re-authenticate via Plaid Link |
| After correction | Update category learning |

## Display Conventions

- **Debt shown negative**: Credit card balance of $2,500 displays as -$2,500
- **Net worth subtle**: Calculated but not prominently displayed
- **Due dates visible**: Credit cards and loans show next payment date and minimum
- **Sync timestamp**: All data shows "Last synced: X ago"

## Related

- [Finance Sync Protocol](../../protocols/finance-sync.md) - Plaid sync details
- [Spending Insights Protocol](../../protocols/spending-insights.md) - Analysis methodology
- [Autonomy Levels](../../protocols/autonomy-levels.md) - Finance is Advisor level (read-only, proactive insights)
