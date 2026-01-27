# Transaction Categories

Hierarchical taxonomy for automatic transaction categorization with user correction learning.

## Purpose

Categorize transactions using a hybrid approach: start with Plaid's categories, then refine based on user corrections. Corrections are learned and applied to future transactions from the same merchant.

## Category Hierarchy

Three-level structure: Category > Subcategory > Merchant-specific

### Income

| Subcategory | Examples |
|-------------|----------|
| Salary | Direct deposit, payroll |
| Freelance | Contract payments, consulting |
| Investment Income | Dividends, capital gains |
| Other Income | Gifts, refunds, rebates |

### Housing

| Subcategory | Examples |
|-------------|----------|
| Rent/Mortgage | Monthly payment |
| Utilities | Electric, gas, water, internet |
| Insurance | Homeowner's, renter's |
| Maintenance | Repairs, lawn care, cleaning |

### Transportation

| Subcategory | Examples |
|-------------|----------|
| Gas | Fuel stations |
| Public Transit | Metro, bus, train passes |
| Rideshare | Uber, Lyft |
| Parking | Meters, garages, lots |
| Car Insurance | Auto insurance premiums |

### Food

| Subcategory | Examples |
|-------------|----------|
| Groceries | Costco, Whole Foods, Safeway |
| Restaurants | Dine-in, takeout |
| Coffee Shops | Starbucks, local cafes |
| Delivery | DoorDash, Uber Eats |

### Shopping

| Subcategory | Examples |
|-------------|----------|
| Clothing | Apparel stores |
| Electronics | Best Buy, Apple |
| Home Goods | Target, IKEA, hardware |
| Online Shopping | Amazon, general e-commerce |

### Entertainment

| Subcategory | Examples |
|-------------|----------|
| Streaming | Netflix, Spotify, Disney+ |
| Gaming | Steam, PlayStation, Xbox |
| Events | Concerts, movies, sports |
| Hobbies | Books, crafts, sports equipment |

### Health

| Subcategory | Examples |
|-------------|----------|
| Medical | Doctor visits, lab work |
| Pharmacy | Prescriptions, CVS, Walgreens |
| Fitness | Gym memberships, classes |
| Insurance | Health insurance premiums |

### Personal

| Subcategory | Examples |
|-------------|----------|
| Subscriptions | Software, memberships |
| Education | Courses, books, tuition |
| Gifts | Presents for others |
| Personal Care | Haircuts, spa, grooming |

### Financial

| Subcategory | Examples |
|-------------|----------|
| Fees | Bank fees, ATM fees |
| Interest | Credit card interest, loan interest |
| Investments | Brokerage transfers, contributions |
| Transfers | Account-to-account movements |

### Uncategorized

Transactions that need manual review:
- Unknown merchants
- Ambiguous descriptions
- New spending patterns

## User Corrections

When you correct a category, PAI asks:

> "Apply 'Food > Restaurants' to all future transactions from [Merchant]?"

### Correction Flow

1. User: "That Costco charge should be Groceries, not Shopping"
2. PAI: "Got it. Apply 'Food > Groceries' to all future Costco transactions?"
3. User: "Yes"
4. PAI stores merchant override

### Merchant Overrides

Stored in: `~/.pai/data/finance/merchant-overrides.json`

```json
{
  "COSTCO WHOLESALE": "Food > Groceries",
  "AMAZON.COM": "Shopping > Online Shopping",
  "TARGET": "Shopping > Home Goods"
}
```

## Source Priority

Category determination follows this priority:

1. **User override** - Explicit correction for this merchant
2. **Learned pattern** - Previously corrected, same merchant
3. **Plaid category** - Aggregator's automatic categorization

## Flagging for Review

Transactions flagged as "Uncategorized" when:
- Merchant not recognized
- Multiple possible categories
- New merchant pattern

Review flagged transactions: "Show uncategorized transactions"
