# Public Records Search Workflow

---
name: public-records
description: Search government and official records databases
---

## Purpose

Locate verified information about individuals through official government databases and public records. These provide the highest confidence data points.

## Instructions

### Step 1: Property Records

Real estate ownership is public record.

**Search methods:**
- County Assessor/Recorder websites
- NETR Online (aggregator): netronline.com
- Zillow/Redfin (ownership history)

**Information available:**
- Property address
- Owner name(s)
- Purchase date and price
- Mailing address (may differ from property)
- Property tax records

### Step 2: Voter Registration

Availability varies significantly by state.

**High Access States:**
- Florida, North Carolina - Most data public
- Texas, Ohio - Substantial access

**Restricted States:**
- California, New York - Limited access
- Some states require in-person requests

**Search methods:**
- State Secretary of State website
- County election board
- VoterRecords.com (aggregator)

**Information available:**
- Full name
- Address
- Date of birth
- Party affiliation
- Voting history (dates, not choices)

### Step 3: Court Records

**Federal Courts:**
- PACER (pacer.gov) - Paid, most comprehensive
- CourtListener (courtlistener.com) - Free alternative
- RECAP Archive - Free PACER documents

**State Courts:**
- Each state has own portal
- Search by name and county
- Civil, criminal, family court records

**Information available:**
- Case filings
- Parties involved
- Addresses from filings
- Attorneys (may lead to contact)

### Step 4: Business Registrations

**Search methods:**
- State Secretary of State website
- OpenCorporates.com (global aggregator)
- Search: "[state] secretary of state business search"

**Information available:**
- Business name and type
- Registered agent
- Officer/Director names
- Business address
- Filing history

### Step 5: Professional Licenses

Many professions require state licensing.

**Common licensed professions:**
- Medical (doctors, nurses, pharmacists)
- Legal (attorneys - check state bar)
- Real estate agents
- Contractors
- Financial advisors (FINRA BrokerCheck)
- Teachers

**Search methods:**
- State licensing board websites
- Professional association directories
- FINRA BrokerCheck (brokercheck.finra.org)

**Information available:**
- License status (active/expired)
- Work address
- Disciplinary history
- License issue date

### Step 6: Death Records

Confirm vital status before extensive searching.

**Search methods:**
- Social Security Death Index (SSDI)
- Ancestry.com, FamilySearch.org
- Obituary databases (Legacy.com, newspapers)
- Find A Grave (findagrave.com)

### Step 7: UCC Filings

Uniform Commercial Code filings show secured transactions.

**Search methods:**
- State Secretary of State UCC search
- Shows loans, liens, equipment financing

**Information available:**
- Debtor name and address
- Creditor information
- Collateral description

### Step 8: Additional Records

**Marriage/Divorce Records:**
- County clerk offices
- VitalChek (aggregator)

**Bankruptcy Records:**
- PACER federal court search

**Campaign Contributions:**
- FEC.gov (federal)
- State election commission sites

## State-by-State Variations

| State | Property | Voter | Courts | Notes |
|-------|----------|-------|--------|-------|
| Florida | Full | Full | Full | "Sunshine State" - most open |
| California | Full | Limited | Full | Strict privacy laws |
| Texas | Full | Moderate | Full | Good overall access |
| New York | Full | Limited | Full | Privacy protections |

## Cross-Verification

For highest confidence:
1. Find same address in 2+ record types
2. Verify name spelling matches exactly
3. Check dates for consistency
4. Cross-reference with known information

## Output Format

```markdown
## Public Records Summary: [Subject Name]

### Property Records
| Address | Owner | Purchase Date | Source |
|---------|-------|---------------|--------|
| ... | ... | ... | [County] Assessor |

### Voter Registration
- Status: [Active/Inactive/Not Found]
- County: ...
- Address on file: ...

### Court Records
| Case Type | Court | Year | Notes |
|-----------|-------|------|-------|
| ... | ... | ... | ... |

### Business Affiliations
| Entity | Role | Status | State |
|--------|------|--------|-------|
| ... | ... | ... | ... |

### Professional Licenses
| License Type | Number | Status | State |
|--------------|--------|--------|-------|
| ... | ... | ... | ... |

### Confidence Notes
[Assessment of data reliability and any discrepancies]
```

## Legal Notes

- All records accessed are public by law
- Some may require small fees
- Bulk downloading may be restricted
- Always verify you're accessing official sources
