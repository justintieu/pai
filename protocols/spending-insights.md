# Spending Insights Protocol

Spending trend analysis, anomaly detection, payment alerts, and personalized recommendations.

## Problem Being Solved

Users want to understand their spending patterns without manual spreadsheet tracking:
- **Where is my money going?** Category breakdowns and trends
- **Am I spending more than usual?** Month-over-month comparisons
- **What's abnormal?** Unusual activity detection
- **When are bills due?** Proactive payment reminders
- **How can I improve?** Actionable recommendations

Raw transaction data is overwhelming. The system needs to distill it into insights.

## Solution

**Observe -> Analyze -> Report** pattern:

1. Read transactions from [finance-storage](finance-storage.md) (via [finance-sync](finance-sync.md))
2. Analyze patterns using defined algorithms
3. Generate insights as observations + recommended actions
4. Surface proactively at session start or on request

### Why This Approach

| Alternative | Why Not |
|-------------|---------|
| Real-time alerts | Requires persistent monitoring, battery drain |
| Daily email digest | Impersonal, easily ignored |
| Dashboard only | Requires user to initiate |
| **Session-start insights** | Natural touchpoint, relevant, not intrusive |

## Insight Types

### 1. Spending Trends

Compare spending across time periods to identify patterns.

**Comparison Periods:**
| Period | Comparison | Use Case |
|--------|------------|----------|
| This month vs last month | 30-day windows | Recent changes |
| This month vs same month last year | YoY | Seasonal patterns |
| Last 3 months average | Rolling average | Trend direction |
| This week vs last week | 7-day windows | Weekly patterns |

**Trend Detection:**
```javascript
function analyzeSpendingTrends(db, categoryFilter = null) {
  const now = new Date();
  const thisMonth = getMonthStart(now);
  const lastMonth = getMonthStart(addMonths(now, -1));
  const threeMonthsAgo = getMonthStart(addMonths(now, -3));

  // This month spending by category
  const thisMonthSpending = db.prepare(`
    SELECT final_category, SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND amount > 0
    ${categoryFilter ? 'AND final_category LIKE ?' : ''}
    GROUP BY final_category
  `).all(thisMonth, categoryFilter ? `${categoryFilter}%` : undefined);

  // Last month for comparison
  const lastMonthSpending = db.prepare(`
    SELECT final_category, SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND date < ? AND amount > 0
    GROUP BY final_category
  `).all(lastMonth, thisMonth);

  // Three-month average
  const threeMonthAvg = db.prepare(`
    SELECT final_category, AVG(monthly_total) as avg_total
    FROM (
      SELECT final_category,
             strftime('%Y-%m', date) as month,
             SUM(amount) as monthly_total
      FROM transactions
      WHERE date >= ? AND amount > 0
      GROUP BY final_category, month
    )
    GROUP BY final_category
  `).all(threeMonthsAgo);

  // Build comparison map
  const lastMonthMap = new Map(lastMonthSpending.map(r => [r.final_category, r.total]));
  const avgMap = new Map(threeMonthAvg.map(r => [r.final_category, r.avg_total]));

  const trends = thisMonthSpending.map(row => {
    const lastTotal = lastMonthMap.get(row.final_category) || 0;
    const avgTotal = avgMap.get(row.final_category) || row.total;
    const momChange = lastTotal > 0 ? ((row.total - lastTotal) / lastTotal) * 100 : null;
    const vsAvgChange = avgTotal > 0 ? ((row.total - avgTotal) / avgTotal) * 100 : null;

    return {
      category: row.final_category,
      thisMonth: row.total,
      lastMonth: lastTotal,
      threeMonthAvg: avgTotal,
      momChangePercent: momChange,
      vsAvgChangePercent: vsAvgChange,
      trend: determineTrend(momChange, vsAvgChange),
    };
  });

  return trends.sort((a, b) => b.thisMonth - a.thisMonth);
}

function determineTrend(momChange, vsAvgChange) {
  if (momChange === null && vsAvgChange === null) return 'new';
  if (momChange > 25 && vsAvgChange > 25) return 'increasing';
  if (momChange < -25 && vsAvgChange < -25) return 'decreasing';
  if (Math.abs(momChange || 0) < 10 && Math.abs(vsAvgChange || 0) < 10) return 'stable';
  return 'variable';
}
```

### 2. Unusual Activity Detection

Flag transactions or patterns that deviate significantly from normal behavior.

**Triggers:**

| Trigger | Threshold | Description |
|---------|-----------|-------------|
| **Spike in category** | 50%+ above monthly average | "Dining out is 68% higher than usual" |
| **Large single transaction** | 2x typical transaction in category | "Unusual $450 at Best Buy (typically ~$100)" |
| **New merchant with high spend** | >$200 at never-seen merchant | "First transaction at ACME Corp: $350" |
| **Frequency spike** | 2x normal frequency in category | "12 coffee shop visits vs usual 5" |
| **Missing expected** | Regular recurring missing | "No Netflix charge this month (usually $15)" |

**Detection Algorithm:**
```javascript
function detectUnusualActivity(db) {
  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const ninetyDaysAgo = addDays(now, -90);

  const anomalies = [];

  // 1. Category spending spikes (50%+ above 3-month average)
  const categorySpikes = db.prepare(`
    SELECT
      t.final_category,
      SUM(CASE WHEN t.date >= ? THEN t.amount ELSE 0 END) as recent,
      AVG(monthly.total) as avg_monthly
    FROM transactions t
    LEFT JOIN (
      SELECT final_category, strftime('%Y-%m', date) as month, SUM(amount) as total
      FROM transactions
      WHERE date >= ? AND date < ?
      GROUP BY final_category, month
    ) monthly ON t.final_category = monthly.final_category
    WHERE t.amount > 0
    GROUP BY t.final_category
    HAVING recent > avg_monthly * 1.5
  `).all(thirtyDaysAgo, ninetyDaysAgo, thirtyDaysAgo);

  for (const spike of categorySpikes) {
    const percentOver = ((spike.recent - spike.avg_monthly) / spike.avg_monthly * 100).toFixed(0);
    anomalies.push({
      type: 'category_spike',
      severity: percentOver > 100 ? 'high' : 'medium',
      category: spike.final_category,
      message: `${spike.final_category} is ${percentOver}% higher than usual`,
      current: spike.recent,
      average: spike.avg_monthly,
    });
  }

  // 2. Large single transactions (2x typical for merchant)
  const largeTransactions = db.prepare(`
    SELECT
      t.*,
      avg_txn.avg_amount,
      avg_txn.txn_count
    FROM transactions t
    JOIN (
      SELECT merchant_name, AVG(amount) as avg_amount, COUNT(*) as txn_count
      FROM transactions
      WHERE merchant_name IS NOT NULL AND amount > 0
      GROUP BY merchant_name
      HAVING COUNT(*) >= 3
    ) avg_txn ON t.merchant_name = avg_txn.merchant_name
    WHERE t.date >= ?
      AND t.amount > avg_txn.avg_amount * 2
      AND t.amount > 50
    ORDER BY t.amount DESC
    LIMIT 10
  `).all(thirtyDaysAgo);

  for (const txn of largeTransactions) {
    anomalies.push({
      type: 'large_transaction',
      severity: txn.amount > txn.avg_amount * 3 ? 'high' : 'medium',
      merchant: txn.merchant_name,
      message: `Unusual $${txn.amount.toFixed(0)} at ${txn.merchant_name} (typically ~$${txn.avg_amount.toFixed(0)})`,
      amount: txn.amount,
      typical: txn.avg_amount,
      date: txn.date,
    });
  }

  // 3. New high-spend merchants (>$200 first transaction)
  const newMerchants = db.prepare(`
    SELECT t.*
    FROM transactions t
    WHERE t.date >= ?
      AND t.amount > 200
      AND NOT EXISTS (
        SELECT 1 FROM transactions t2
        WHERE t2.merchant_name = t.merchant_name
          AND t2.date < ?
      )
    ORDER BY t.amount DESC
    LIMIT 5
  `).all(thirtyDaysAgo, thirtyDaysAgo);

  for (const txn of newMerchants) {
    anomalies.push({
      type: 'new_merchant',
      severity: 'low',
      merchant: txn.merchant_name || txn.name,
      message: `First transaction at ${txn.merchant_name || txn.name}: $${txn.amount.toFixed(0)}`,
      amount: txn.amount,
      date: txn.date,
    });
  }

  return anomalies.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
```

### 3. Payment Due Date Alerts

Surface upcoming payment obligations proactively.

**Alert Windows:**
| Window | When to Alert | Priority |
|--------|---------------|----------|
| **Overdue** | Past due date | Critical |
| **Due in 1 day** | Tomorrow | High |
| **Due in 7 days** | Next week | Medium |
| **Due in 14 days** | FYI | Low |

**Payment Query:**
```javascript
function getPaymentAlerts(db) {
  const now = new Date();
  const in1Day = addDays(now, 1);
  const in7Days = addDays(now, 7);
  const in14Days = addDays(now, 14);

  const payments = db.prepare(`
    SELECT
      a.name as account_name,
      a.type,
      a.current_balance,
      a.next_payment_due_date,
      a.minimum_payment_amount,
      a.is_overdue,
      i.institution_name
    FROM accounts a
    JOIN plaid_items i ON a.plaid_item_id = i.id
    WHERE a.next_payment_due_date IS NOT NULL
      AND a.type IN ('credit', 'loan')
    ORDER BY a.next_payment_due_date ASC
  `).all();

  const alerts = [];

  for (const payment of payments) {
    const dueDate = new Date(payment.next_payment_due_date);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    let priority, message;

    if (payment.is_overdue || daysUntilDue < 0) {
      priority = 'critical';
      message = `OVERDUE: ${payment.account_name} payment was due ${Math.abs(daysUntilDue)} days ago`;
    } else if (daysUntilDue <= 1) {
      priority = 'high';
      message = `Due tomorrow: ${payment.account_name} - $${payment.minimum_payment_amount?.toFixed(2) || 'N/A'}`;
    } else if (daysUntilDue <= 7) {
      priority = 'medium';
      message = `Due in ${daysUntilDue} days: ${payment.account_name} - $${payment.minimum_payment_amount?.toFixed(2) || 'N/A'}`;
    } else if (daysUntilDue <= 14) {
      priority = 'low';
      message = `Coming up: ${payment.account_name} due ${payment.next_payment_due_date}`;
    } else {
      continue; // Outside alert window
    }

    alerts.push({
      priority,
      message,
      account: payment.account_name,
      institution: payment.institution_name,
      dueDate: payment.next_payment_due_date,
      daysUntilDue,
      amount: payment.minimum_payment_amount,
      balance: payment.current_balance,
    });
  }

  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

### 4. Recommendations

Generate actionable insights from spending analysis.

**Recommendation Types:**
| Type | Trigger | Example |
|------|---------|---------|
| **Reduce** | Category trending up significantly | "Dining out up 45% - consider meal planning" |
| **Monitor** | Unusual activity detected | "Watch for unexpected charges at new merchant" |
| **Optimize** | Found savings opportunity | "Subscription $12.99/mo unused in 60 days" |
| **Celebrate** | Positive trend | "Great job - groceries down 20% this month!" |

**Recommendation Generator:**
```javascript
function generateRecommendations(db, trends, anomalies, paymentAlerts) {
  const recommendations = [];

  // Based on trends
  for (const trend of trends) {
    if (trend.trend === 'increasing' && trend.momChangePercent > 30) {
      const category = trend.category.split(' > ')[0]; // Top-level
      recommendations.push({
        type: 'reduce',
        observation: `${trend.category} spending is up ${trend.momChangePercent.toFixed(0)}% from last month`,
        action: getSavingsTip(category),
        impact: `Could save ~$${(trend.thisMonth - trend.threeMonthAvg).toFixed(0)}/month`,
      });
    }

    if (trend.trend === 'decreasing' && trend.momChangePercent < -20) {
      recommendations.push({
        type: 'celebrate',
        observation: `${trend.category} spending down ${Math.abs(trend.momChangePercent).toFixed(0)}%`,
        action: 'Keep it up! This saving adds up over time.',
        impact: null,
      });
    }
  }

  // Based on anomalies
  for (const anomaly of anomalies) {
    if (anomaly.type === 'large_transaction' && anomaly.severity === 'high') {
      recommendations.push({
        type: 'monitor',
        observation: anomaly.message,
        action: 'Verify this is a legitimate charge you recognize',
        impact: null,
      });
    }

    if (anomaly.type === 'new_merchant' && anomaly.amount > 300) {
      recommendations.push({
        type: 'monitor',
        observation: anomaly.message,
        action: 'New merchant with significant spend - confirm you recognize it',
        impact: null,
      });
    }
  }

  // Based on payment alerts
  const highPriorityPayments = paymentAlerts.filter(p =>
    p.priority === 'critical' || p.priority === 'high'
  );

  if (highPriorityPayments.length > 0) {
    recommendations.unshift({
      type: 'urgent',
      observation: `${highPriorityPayments.length} payment(s) due soon`,
      action: 'Review and schedule payments to avoid late fees',
      impact: 'Late fees typically $25-40 per occurrence',
    });
  }

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function getSavingsTip(category) {
  const tips = {
    'Food & Drink': 'Consider meal prepping or cooking at home more often',
    'Shopping': 'Try a 24-hour rule before non-essential purchases',
    'Entertainment': 'Review subscriptions for unused services',
    'Transportation': 'Consider carpooling or public transit options',
    'Travel': 'Plan ahead and use price alerts for better deals',
  };
  return tips[category] || 'Review recent transactions for potential savings';
}
```

## Display Format

### Session Start Summary

When user starts a finance-related conversation:

```
Finance Summary (synced 2 hours ago)
------------------------------------
This month's spending: $3,245.67 (12% under budget)

Alerts:
- HIGH: Amex Blue payment due tomorrow ($125 min)
- Dining out is 45% higher than usual this month

Quick stats:
- Top category: Food & Drink ($892)
- Largest transaction: $450 at Best Buy
- 3 uncategorized transactions to review

Would you like details on any of these?
```

### Detailed Spending Report

When user asks "show my spending" or "spending breakdown":

```
Spending Report: January 2026
=============================

By Category:
------------------------------------
Food & Drink          $892.34   ▲ 23%
  Restaurants         $534.12
  Groceries          $312.45
  Coffee Shops        $45.77

Shopping              $567.89   ▼ 15%
  Online             $423.56
  In-store           $144.33

Transportation        $234.56   ● stable
  Gas                $156.78
  Rideshare           $77.78

Bills & Utilities     $445.00   ● stable
Entertainment         $123.45   ▲ 67%

------------------------------------
Total:              $3,245.67   (vs $3,678 last month)

▲ = increasing  ▼ = decreasing  ● = stable

Insights:
- Entertainment spike due to concert tickets ($89)
- Food & Drink up mainly from 6 restaurant visits
```

### Anomaly Alert

When unusual activity detected:

```
Unusual Activity Detected
-------------------------
HIGH: $847 charge at LUXURY HOTEL CO
  - First time seeing this merchant
  - Significantly higher than your typical transactions

Do you recognize this charge?
```

### Payment Reminder

Proactive payment alert:

```
Payment Reminder
----------------
Due tomorrow:
- Chase Sapphire: $2,345.67 min payment $125.00

Due this week:
- Amex Blue: $567.89 due Jan 28

Schedule payments to avoid late fees ($25-40).
```

## Proactive Alerts

### Session Start Triggers

Check and surface insights when user first mentions finances:

```javascript
async function getSessionStartInsights(db) {
  const insights = {
    paymentAlerts: [],
    anomalies: [],
    summary: null,
  };

  // 1. Always check payment due dates
  const payments = getPaymentAlerts(db);
  insights.paymentAlerts = payments.filter(p =>
    p.priority === 'critical' || p.priority === 'high'
  );

  // 2. Check for high-severity anomalies (last 7 days)
  const anomalies = detectUnusualActivity(db);
  insights.anomalies = anomalies.filter(a => a.severity === 'high');

  // 3. Quick spending summary
  const thisMonth = getMonthStart(new Date());
  const spending = db.prepare(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND amount > 0
  `).get(thisMonth);

  insights.summary = {
    thisMonthTotal: spending.total,
    lastSynced: db.prepare(
      'SELECT MAX(last_sync_at) as synced FROM plaid_items'
    ).get().synced,
  };

  return insights;
}
```

### Alert Priority Rules

| Priority | When to Show | How to Show |
|----------|--------------|-------------|
| Critical | Always | First line of any finance response |
| High | At session start | Highlighted in summary |
| Medium | On request | In detailed reports |
| Low | On request | In comprehensive views |

## Related Protocols

- [Finance Storage](finance-storage.md) - Where transaction data is stored
- [Finance Sync](finance-sync.md) - How transactions are fetched and categorized
- [Plaid Link](plaid-link.md) - How bank connections are established
- [Autonomy Levels](autonomy-levels.md) - Finance domain is Advisor level (read-only)

## Implementation Notes

### Performance Considerations

- Cache trend calculations (recompute on sync, not every query)
- Index transactions by date for efficient range queries
- Limit anomaly detection to last 30-90 days
- Pre-aggregate monthly totals for trend comparison

### Privacy

- All analysis happens locally (no cloud)
- Insights never leave the device
- No sharing of transaction details
- User controls what categories to track

### Category Normalization

Use consistent category hierarchy for trend analysis:
```
Level 1: Food & Drink, Shopping, Transportation, etc.
Level 2: Restaurants, Groceries, Online Shopping, etc.
Level 3: Merchant-specific (optional)
```

Analysis typically operates at Level 1 or Level 2 for meaningful patterns.
