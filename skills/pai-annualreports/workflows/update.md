# Update Workflow

Refresh the report sources database from the upstream repository.

## Triggers

- "update annual reports"
- "sync report sources"
- "refresh the reports database"

## Process

### Step 1: Fetch Upstream Source

The authoritative source is the awesome-annual-security-reports repository:

```
WebFetch: https://github.com/jacobdjwilson/awesome-annual-security-reports
Prompt: "Extract all report entries with their names, vendors, URLs,
        and categories. Count total reports in each category."
```

### Step 2: Parse Categories

Extract reports organized by category:

**Analysis Reports:**
- Global Threat Intelligence
- Vulnerabilities
- Cloud Security
- Ransomware
- AI/Emerging Technologies
- ICS/OT Security
- Malware
- Financial Services
- Healthcare

**Survey Reports:**
- Industry Trends
- Identity Security
- Privacy/Data Protection
- Workforce/Culture
- Compliance/Risk

### Step 3: Generate Summary

```markdown
## Annual Reports Database Updated

**Source:** awesome-annual-security-reports
**Updated:** [Timestamp]
**Total Sources:** [N]

### Category Breakdown

| Category | Count |
|----------|-------|
| Global Threat Intelligence | [N] |
| Vulnerabilities | [N] |
| Cloud Security | [N] |
| Ransomware | [N] |
| Industry Trends | [N] |
| ... | ... |

### Notable Sources

**Threat Intelligence:**
- CrowdStrike Global Threat Report
- Mandiant M-Trends
- Microsoft Digital Defense Report

**Breach Analysis:**
- Verizon DBIR
- IBM Cost of a Data Breach

**Ransomware:**
- Sophos State of Ransomware
- Coveware Quarterly Reports

### Recent Additions
[List any notably new reports if identifiable]
```

## Source Repository

**Repository:** [jacobdjwilson/awesome-annual-security-reports](https://github.com/jacobdjwilson/awesome-annual-security-reports)

This community-curated list aggregates annual security reports from:
- Major security vendors (CrowdStrike, Mandiant, Microsoft, etc.)
- Industry organizations (ISACA, ISC2, Ponemon)
- Government agencies (CISA, ENISA)
- Research firms (Gartner, Forrester)

## Error Handling

- **Network error**: Suggest retry, note that cached knowledge is still available
- **Repository unavailable**: Use cached category structure, note limitation
- **Parsing issues**: Report partial results with caveat

## Example

**Request:** "Update the annual reports database"

**Output:**
```markdown
## Annual Reports Database Updated

**Source:** awesome-annual-security-reports
**Updated:** 2024-01-15
**Total Sources:** 570+

### Category Breakdown

| Category | Count |
|----------|-------|
| Global Threat Intelligence | 56 |
| Industry Trends | 68 |
| Vulnerabilities | 14 |
| Identity Security | 19 |
| Cloud Security | 11 |
| Ransomware | 9 |
| Privacy/Data Protection | 8 |
| Other Categories | 385 |

### Key Vendors Tracked

**Threat Intelligence:** CrowdStrike, Mandiant, Microsoft, Recorded Future,
Unit 42, Proofpoint, Secureworks, SentinelOne

**Breach/Cost Analysis:** Verizon, IBM, Ponemon Institute

**Cloud Security:** Wiz, Orca, Sysdig, Lacework

**Industry Surveys:** ISACA, ISC2, SANS, Gartner

Database refreshed. Use "analyze [topic]" or "fetch [vendor] report"
to explore specific reports.
```

## Usage Notes

- This skill uses WebFetch to query the upstream repository directly
- No local database is maintained; sources are fetched on-demand
- The upstream repository is community-maintained and regularly updated
- For the most current data, run update before major analysis tasks
