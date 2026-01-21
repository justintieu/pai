---
name: pai-annualreports
description: Aggregate and analyze annual security reports from 570+ sources (CrowdStrike, Microsoft, IBM, Mandiant, Verizon, etc). USE WHEN annual reports, security reports, threat intelligence, industry trends, vendor reports, ransomware reports, breach reports.
tools: WebFetch, WebSearch, Read, Write
---

# PAI Annual Reports

Aggregate and analyze annual security reports from across the cybersecurity industry. Access 570+ curated sources covering threat intelligence, vulnerability research, ransomware trends, and industry surveys.

## Workflows

| Workflow | Use When | Description |
|----------|----------|-------------|
| **Fetch** | Get a specific report | Download and summarize a vendor's report |
| **Analyze** | Identify trends | Cross-vendor analysis on topics |
| **Update** | Refresh sources | Sync latest sources from upstream |

## Report Categories

### Analysis Reports (165+ sources)
- Global Threat Intelligence (56)
- Vulnerabilities (14)
- Cloud Security (11)
- Ransomware (9)
- AI/Emerging Technologies
- ICS/OT Security
- Malware
- Financial Services
- Healthcare

### Survey Reports (151+ sources)
- Industry Trends (68)
- Identity Security (19)
- Privacy/Data Protection (8)
- Workforce/Culture
- Compliance/Risk

## Instructions

### 1. Determine Intent

Parse user request for workflow indicators:
- **Fetch**: "get", "download", "show me", specific vendor name
- **Analyze**: "analyze", "trends", "what do reports say", "compare"
- **Update**: "update", "sync", "refresh"

### 2. Execute Workflow

Load the appropriate workflow:
- Fetch: `workflows/fetch.md`
- Analyze: `workflows/analyze.md`
- Update: `workflows/update.md`

### 3. Source Data

Primary source: [awesome-annual-security-reports](https://github.com/jacobdjwilson/awesome-annual-security-reports)

Key vendors include:
- **Threat Intel**: CrowdStrike, Mandiant, Microsoft, Unit 42, Recorded Future
- **Breach Analysis**: Verizon DBIR, IBM Cost of Data Breach
- **Ransomware**: Sophos, Coveware, Chainalysis
- **Cloud**: Wiz, Orca, Sysdig
- **Industry Surveys**: ISACA, ISC2, Ponemon

### 4. Deliver Results

Format based on workflow:
- **Fetch**: Report metadata, summary, key findings, source link
- **Analyze**: Executive summary, trends, vendor consensus, statistics, recommendations
- **Update**: Change summary (added/removed), total count, timestamp

## Examples

**Example 1: Fetch a specific report**
```
User: "Get the latest CrowdStrike threat report"
Claude: Executes Fetch workflow
        Searches for CrowdStrike Global Threat Report
        Returns summary with key findings and link
```

**Example 2: Analyze a topic**
```
User: "What do the annual reports say about ransomware trends?"
Claude: Executes Analyze workflow
        Pulls insights from Sophos, Coveware, Mandiant, etc.
        Synthesizes trends across vendors
        Returns analysis with statistics and recommendations
```

**Example 3: Compare vendors**
```
User: "Compare what Microsoft and CrowdStrike say about nation-state threats"
Claude: Executes Analyze workflow with comparison template
        Fetches relevant sections from both vendors
        Identifies agreements and divergent perspectives
```

**Example 4: Update sources**
```
User: "Update the annual reports database"
Claude: Executes Update workflow
        Fetches latest from upstream repository
        Reports changes and new additions
```

## Resources

- [Fetch workflow](workflows/fetch.md) - Download specific reports
- [Analyze workflow](workflows/analyze.md) - Cross-vendor trend analysis
- [Update workflow](workflows/update.md) - Sync sources from upstream
