# Analyze Workflow

Cross-vendor trend analysis to synthesize insights from multiple security reports.

## Triggers

- "analyze annual reports"
- "what do security reports say about [topic]"
- "compare [vendor A] and [vendor B] on [topic]"
- "trends in [ransomware/cloud/etc] reports"

## Process

### Step 1: Define Scope

Clarify the analysis focus:

| Scope Type | Example | Approach |
|------------|---------|----------|
| **Topic-focused** | "ransomware trends" | Pull from all vendors on topic |
| **Vendor comparison** | "Microsoft vs CrowdStrike" | Compare specific vendors |
| **Category analysis** | "cloud security landscape" | Analyze one category |
| **Industry assessment** | "healthcare threats" | Sector-specific analysis |

### Step 2: Identify Relevant Reports

Search for reports matching the scope:

```
WebSearch: "[topic] annual security report 2024 [vendor keywords]"
```

Target 3-6 reports for balanced analysis:
- At least 2 different vendors
- Mix of threat intel and survey reports if applicable
- Prioritize authoritative sources (Verizon, CrowdStrike, Mandiant, Microsoft)

### Step 3: Fetch Report Content

For each identified report, use WebFetch:

```
WebFetch: [report URL]
Prompt: "Extract findings related to [topic], including statistics,
        trends, predictions, and recommendations"
```

### Step 4: Synthesize Findings

Analyze fetched content for:

1. **Common themes** - Points multiple vendors agree on
2. **Key statistics** - Quantitative data with sources
3. **Divergent views** - Where vendors disagree
4. **Emerging patterns** - New trends not in prior years
5. **Recommendations** - Shared mitigation advice

### Step 5: Generate Analysis

```markdown
## Analysis: [Topic]

**Reports Analyzed:** [N]
**Vendors:** [List]
**Period:** [Year(s)]

### Executive Summary
[2-3 sentence synthesis of the overall landscape]

### Vendor Consensus
[Points where multiple vendors agree]

### Key Statistics

| Metric | Value | Source |
|--------|-------|--------|
| [Metric 1] | [Value] | [Vendor] |
| [Metric 2] | [Value] | [Vendor] |

### Emerging Trends
- [Trend 1] - [Supporting evidence]
- [Trend 2] - [Supporting evidence]

### Divergent Perspectives
[Where vendors disagree and potential reasons]

### Recommendations
[Synthesized mitigation advice from vendors]

### Sources
- [Report 1](URL) - [Vendor]
- [Report 2](URL) - [Vendor]
```

## Analysis Templates

### Topic-Focused Analysis
Focus on one security topic across vendors:
- Ransomware trends
- Phishing/social engineering
- Supply chain attacks
- Zero-day exploitation
- Cloud security posture

### Vendor Comparison
Contrast perspectives between specific vendors:
- Methodology differences
- Coverage overlap and gaps
- Conflicting conclusions
- Unique insights from each

### Industry Assessment
Sector-specific threat landscape:
- Healthcare
- Financial services
- Manufacturing/OT
- Government
- Retail

## Example

**Request:** "What do the annual reports say about ransomware trends?"

**Output:**
```markdown
## Analysis: Ransomware Trends 2024

**Reports Analyzed:** 5
**Vendors:** Sophos, Coveware, Mandiant, Verizon, Chainalysis
**Period:** 2023-2024

### Executive Summary
Ransomware attacks continue to evolve with a shift toward data
exfiltration over encryption. Payment rates have declined but
average ransom demands have increased, with attackers targeting
larger organizations.

### Vendor Consensus
- Double extortion (encrypt + exfiltrate) is now standard practice
- Healthcare and education remain most-targeted sectors
- Initial access commonly via exploited vulnerabilities (not just phishing)
- Recovery times increasing despite ransom payment

### Key Statistics

| Metric | Value | Source |
|--------|-------|--------|
| Attacks involving data theft | 70% | Sophos |
| Median ransom payment | $200,000 | Coveware |
| Attacks using legitimate tools | 65% | Mandiant |
| YoY payment volume decline | 35% | Chainalysis |

### Emerging Trends
- Ransomware-as-a-Service (RaaS) affiliate model dominates
- Exploitation of edge devices (VPNs, firewalls) for initial access
- Intermittent encryption for speed over full encryption
- Data-only extortion (no encryption) growing

### Divergent Perspectives
Sophos reports higher payment rates in certain sectors than Coveware,
possibly due to different sample populations (Sophos surveys IT leaders,
Coveware tracks negotiation outcomes).

### Recommendations
1. Prioritize patch management for internet-facing systems
2. Implement network segmentation to limit lateral movement
3. Deploy EDR with behavioral detection for legitimate tool abuse
4. Maintain offline backups with regular restoration testing
5. Develop incident response playbook before attack occurs

### Sources
- [State of Ransomware 2024](https://sophos.com/...) - Sophos
- [Q4 2023 Ransomware Report](https://coveware.com/...) - Coveware
- [M-Trends 2024](https://mandiant.com/...) - Mandiant
- [2024 DBIR](https://verizon.com/...) - Verizon
- [Crypto Crime Report 2024](https://chainalysis.com/...) - Chainalysis
```

## Quality Checks

- [ ] At least 3 different vendor sources
- [ ] Statistics attributed to specific reports
- [ ] Divergent views acknowledged
- [ ] URLs verified and accessible
- [ ] Recommendations actionable and synthesized
