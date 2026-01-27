# Fetch Workflow

Download and summarize specific security reports on demand.

## Triggers

- "fetch [vendor] report"
- "get the [report name]"
- "download [vendor]'s annual report"
- "show me the Verizon DBIR"

## Process

### Step 1: Identify Report

Parse user request to extract:
- **Vendor name** (CrowdStrike, Microsoft, Verizon, etc.)
- **Report type** (threat report, breach report, cost report, etc.)
- **Year** (default to most recent)

If ambiguous, search for matching reports:

```
WebSearch: "[vendor] annual security report [year] PDF"
```

### Step 2: Confirm Report (if multiple matches)

If multiple reports match, present options:

```markdown
Found multiple reports from [Vendor]:

1. **Global Threat Report 2024** - Annual threat landscape analysis
2. **Threat Hunting Report 2024** - Proactive detection findings
3. **Services Report 2024** - Incident response insights

Which would you like?
```

### Step 3: Fetch Report

Use WebFetch to retrieve the report landing page:

```
WebFetch: [report URL]
Prompt: "Extract the report title, publication date, executive summary,
        key findings, and download link if available"
```

### Step 4: Present Results

```markdown
## [Report Name]

**Vendor:** [Vendor]
**Published:** [Date]
**URL:** [Landing page URL]

### Summary
[Executive summary or overview from the report]

### Key Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]

### Access
[Download link or registration note]

*Note: Many reports require registration for full PDF access.*
```

## Common Reports

| Vendor | Report | Typical Release |
|--------|--------|-----------------|
| Verizon | Data Breach Investigations Report (DBIR) | May |
| CrowdStrike | Global Threat Report | February |
| IBM | Cost of a Data Breach | July |
| Mandiant | M-Trends | April |
| Microsoft | Digital Defense Report | October |
| Sophos | State of Ransomware | April |

## Alternative Methods

### Direct URL Fetch
If user provides a URL directly:
```
User: "Summarize this report: https://example.com/report.pdf"
```
Fetch and summarize without searching.

### List Cached Reports
If user asks what's available:
```
User: "What reports do you have?"
```
List common vendors and report types from the source database.

## Error Handling

- **Report not found**: Suggest similar reports or broader search
- **Registration required**: Note the requirement and provide landing page
- **Paywalled content**: Acknowledge limitation, summarize available preview

## Example

**Request:** "Get the latest Verizon DBIR"

**Output:**
```markdown
## Verizon Data Breach Investigations Report 2024

**Vendor:** Verizon
**Published:** May 2024
**URL:** https://www.verizon.com/business/resources/reports/dbir/

### Summary
The 2024 DBIR analyzes 30,458 security incidents, of which 10,626 were
confirmed data breaches. The report covers breach patterns across
industries and attack vectors.

### Key Findings
- 68% of breaches involved a human element (social engineering, errors)
- Ransomware was present in 24% of all breaches
- Median time to exploit vulnerabilities after disclosure: 5 days
- Third-party breaches increased 68% year-over-year

### Access
Full report available with registration at the URL above.
```
