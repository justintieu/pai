---
name: due-diligence
description: 5-phase investment due diligence with parallel researcher fleet
---

# Company Investment Due Diligence

Structured due diligence workflow for investment decisions with domain-first methodology and parallel researcher deployment.

## Phase 1: Domain Discovery (BLOCKING)

**This phase MUST complete before advancing. Domain coverage required: 95%+**

Execute 7 enumeration techniques in parallel:

### 1.1 Certificate Transparency
```
Tool: crt.sh
Query: %.targetdomain.com
Output: All SSL certificates ever issued
```

### 1.2 DNS Enumeration
```
Tools: DNSDumpster, SecurityTrails, Amass
Query: Subdomain enumeration
Output: All discoverable subdomains
```

### 1.3 Search Engine Discovery
```
Tools: Google, Bing, DuckDuckGo
Queries:
  - site:targetdomain.com
  - "Company Name" site:*
  - "Company Name" -site:targetdomain.com
Output: Related domains, mentions
```

### 1.4 Social Profile Discovery
```
Platforms: LinkedIn, Twitter, GitHub, Facebook
Query: Company official accounts
Output: All official social properties
```

### 1.5 Business Registration Cross-Reference
```
Sources: Secretary of State, USPTO, OpenCorporates
Query: Domains in corporate filings
Output: Registered domains, trademarks
```

### 1.6 WHOIS Correlation
```
Tool: DomainTools, SecurityTrails
Query: Registrant email/name patterns
Output: Domains with matching registrant
```

### 1.7 Alternative TLD Variants
```
Check: .com, .net, .org, .io, .co, .ai, country TLDs
Query: Same name, different extensions
Output: All owned variants
```

**Gate Check:** Confirm 95%+ confidence in domain coverage before proceeding.

## Phase 2: Technical Reconnaissance

Deploy one pentester per discovered domain:

For each domain, gather:
- DNS records (A, AAAA, MX, NS, TXT, CNAME)
- SSL certificate details (issuer, validity, SANs)
- IP resolution and geolocation
- ASN identification
- Hosting provider
- Technology stack (BuiltWith, Wappalyzer)
- Email security (SPF, DKIM, DMARC)
- Wayback Machine snapshots

Compile infrastructure map showing relationships between domains, IPs, and hosting.

## Phase 3: Comprehensive Research Fleet

Deploy 32+ parallel researchers (10-minute execution window):

### Business Legitimacy (8 agents)
```
Agent 1: Corporate registration verification
Agent 2: License and permit validation
Agent 3: Regulatory registration check
Agent 4: Tax ID verification
Agent 5: Address verification
Agent 6: Phone/contact verification
Agent 7: Business history timeline
Agent 8: Corporate structure mapping
```

### Reputation and Market (8 agents)
```
Agent 9: News coverage analysis
Agent 10: Press release review
Agent 11: Industry recognition/awards
Agent 12: Customer reviews (G2, Capterra, etc.)
Agent 13: Employee reviews (Glassdoor)
Agent 14: Social media sentiment
Agent 15: Competitive positioning
Agent 16: Market size and share
```

### Verification (8 agents)
```
Agent 17: Executive background checks
Agent 18: Board member verification
Agent 19: Investor verification
Agent 20: Customer reference check
Agent 21: Partnership verification
Agent 22: Patent/IP verification
Agent 23: Funding round confirmation
Agent 24: Revenue claim verification
```

### Specialized Investigation (8 agents)
```
Agent 25: Litigation search (PACER, state courts)
Agent 26: Regulatory action search
Agent 27: Sanctions/watchlist check
Agent 28: Bankruptcy search
Agent 29: UCC filing search
Agent 30: Lien search
Agent 31: Related party transactions
Agent 32: Beneficial ownership research
```

## Phase 4: Investment Risk Assessment

### Risk Scoring Framework (0-100)

| Score | Risk Level | Recommendation |
|-------|------------|----------------|
| 0-20 | Low | PROCEED |
| 21-40 | Moderate | PROCEED WITH CONDITIONS |
| 41-60 | High | DECLINE (unless mitigated) |
| 61-100 | Critical | AVOID |

### Scoring Categories

**Business Registration (0-15 points)**
- No registration found: +15
- Inactive/revoked: +10
- Recent registration (<1 year): +5
- Active, verified: 0

**Regulatory Compliance (0-15 points)**
- Active enforcement actions: +15
- Historical violations: +10
- Minor issues: +5
- Clean record: 0

**Leadership Credibility (0-15 points)**
- Fraud history: +15
- Failed ventures: +10
- Limited track record: +5
- Strong track record: 0

**Financial Transparency (0-15 points)**
- No verifiable financials: +15
- Inconsistent claims: +10
- Limited disclosure: +5
- Audited financials: 0

**Technical Infrastructure (0-10 points)**
- No discoverable domains: +10
- Poor security posture: +7
- Basic infrastructure: +3
- Professional setup: 0

**Market Validation (0-10 points)**
- No customer evidence: +10
- Few/questionable reviews: +7
- Limited traction: +3
- Strong market presence: 0

**Legal Status (0-20 points)**
- Active fraud litigation: +20
- Multiple lawsuits: +15
- Minor legal issues: +5
- Clean legal history: 0

## Phase 5: Synthesis and Recommendation

### Final Output Structure

```markdown
## Investment Due Diligence Report
**Company:** [Name]
**Date:** [Investigation date]
**Authorization:** [Reference]

### Executive Summary
[3-5 sentence overview with recommendation]

### Recommendation
**[PROCEED / PROCEED WITH CONDITIONS / DECLINE / AVOID]**

Risk Score: [X]/100 ([Low/Moderate/High/Critical])

### Key Findings

#### Positive Indicators
- [Finding 1]
- [Finding 2]

#### Red Flags
| Finding | Severity | Mitigation |
|---------|----------|------------|
| [Issue] | [CRITICAL/HIGH/MEDIUM/LOW] | [Possible mitigation] |

### Domain Inventory
| Domain | Purpose | SSL | Host | Status |
|--------|---------|-----|------|--------|

### Business Verification
- Registration: [Status]
- Years operating: [N]
- Employees: [N]
- Funding: [Amount]

### Leadership Assessment
[Executive profiles with verification status]

### Financial Analysis
[Available financial indicators]

### Legal/Regulatory Status
[Litigation, regulatory actions, compliance]

### Information Gaps
[What could not be verified]

### Conditions (if PROCEED WITH CONDITIONS)
1. [Condition 1]
2. [Condition 2]

### Sources
[Complete citation list]
```

## Quality Gates

Each phase requires completion before advancing:

- [ ] Phase 1: 95%+ domain coverage confirmed
- [ ] Phase 2: All domains technically assessed
- [ ] Phase 3: All 32 researchers completed
- [ ] Phase 4: Risk score calculated
- [ ] Phase 5: Report reviewed and delivered
