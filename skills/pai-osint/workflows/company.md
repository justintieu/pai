---
name: company-lookup
description: 7-phase OSINT workflow for investigating organizations
---

# Company OSINT Lookup

Structured intelligence gathering on business entities and organizations.

## Phase 1: Authorization and Scope

**BLOCKING - Do not proceed without completion**

Verify:
- [ ] Explicit authorization from client or authorized party
- [ ] Legal compliance confirmed
- [ ] Defined scope boundaries (subsidiaries? executives? competitors?)
- [ ] Purpose documentation

**If any item unchecked: STOP and request authorization**

## Phase 2: Entity Identification

Gather starting data:
- Legal company name and DBAs
- Primary domains and websites
- Headquarters location
- Key executives
- Industry/sector
- Founding date
- Corporate structure (parent, subsidiaries)

## Phase 3: Business Registration Research

| Source | URL | Data |
|--------|-----|------|
| OpenCorporates | opencorporates.com | 200M+ company records |
| SEC EDGAR | sec.gov/edgar | Public company filings |
| State Secretary of State | (varies) | Articles of incorporation |
| EIN Lookup | (IRS resources) | Tax ID verification |
| Better Business Bureau | bbb.org | Accreditation, complaints |
| Dun & Bradstreet | dnb.com | D-U-N-S number, credit |
| Crunchbase | crunchbase.com | Funding, investors |
| PitchBook | pitchbook.com | PE/VC deals |

## Phase 4: Domain and Digital Assets

**Execute 7 enumeration techniques:**

1. **Certificate Transparency**
   - crt.sh - Find all certificates issued to domain
   - Search: `%.domain.com`

2. **DNS Enumeration**
   - DNSDumpster (dnsdumpster.com)
   - SecurityTrails (securitytrails.com)
   - Record types: A, AAAA, MX, TXT, NS, CNAME

3. **Search Engine Discovery**
   - `site:domain.com`
   - `"company name" site:*`
   - Find related domains

4. **Social Profile Discovery**
   - LinkedIn company page
   - Twitter, Facebook, Instagram
   - GitHub organization

5. **Business Registration Cross-Reference**
   - Domains listed in corporate filings
   - Trademark registrations (USPTO)

6. **WHOIS Correlation**
   - Historical WHOIS (DomainTools)
   - Registrant email/name patterns

7. **Alternative TLDs**
   - Check .com, .net, .org, .io, .co variants
   - Country-specific TLDs

## Phase 5: Technical Infrastructure

For each discovered domain:

| Check | Tool | Purpose |
|-------|------|---------|
| DNS Records | dig, nslookup | A, MX, NS, TXT records |
| SSL Certificate | crt.sh, Censys | Issuer, validity, SANs |
| IP Resolution | IPinfo | Geolocation, ASN, hosting |
| Technology Stack | BuiltWith, Wappalyzer | CMS, frameworks, analytics |
| Email Security | MXToolbox | SPF, DKIM, DMARC |
| Historical | Wayback Machine | Website evolution |

## Phase 6: Parallel Researcher Fleet

Deploy 8 parallel researchers using Task tool:

```
Task 1: Business Registration
- Corporate filings
- Licenses and permits
- Regulatory registrations

Task 2: Financial Intelligence
- SEC filings (if public)
- Funding history
- Credit ratings

Task 3: Leadership Research
- Executive backgrounds
- Board composition
- Key personnel changes

Task 4: Regulatory/Legal
- Litigation history
- Regulatory actions
- Compliance issues

Task 5: Reputation Analysis
- News coverage
- Press releases
- Industry awards/recognition

Task 6: Employee Intelligence
- Glassdoor reviews
- LinkedIn employee count
- Hiring patterns

Task 7: Competitive Analysis
- Market position
- Competitors
- Industry trends

Task 8: Technical Assessment
- Domain/IP mapping
- Technology stack
- Security posture
```

## Phase 7: Verification and Synthesis

### Multi-Source Verification

Minimum 3 independent sources per critical claim:
- Different organizations
- Different collection methods
- Different timeframes

### Red Flag Categories

| Severity | Indicators |
|----------|------------|
| CRITICAL | Fraud indicators, sanctions violations, active litigation |
| HIGH | Regulatory actions, executive departures, financial distress |
| MEDIUM | Negative reviews, minor legal issues, leadership gaps |
| LOW | Information gaps, minor discrepancies, outdated records |

### Report Structure

```markdown
## Company: [Name]
**Authorization:** [Reference]
**Scope:** [Boundaries]
**Date:** [Investigation date]

### Executive Summary
[Key findings and recommendation]

### Business Legitimacy
- Registration status: [Active/Inactive/Unknown]
- Years in operation: [N]
- Corporate structure: [Description]
Confidence: [HIGH/MEDIUM/LOW]

### Leadership Profile
[Key executives with backgrounds]
Confidence: [HIGH/MEDIUM/LOW]

### Financial Health
[Funding, revenue indicators, credit]
Confidence: [HIGH/MEDIUM/LOW]

### Digital Infrastructure
[Domains, IPs, technology stack]

### Regulatory/Legal Status
[Compliance, litigation, actions]
Confidence: [HIGH/MEDIUM/LOW]

### Red Flags
[Findings with severity ratings]

### Information Gaps
[What could not be verified]

### Sources
[Complete citations]

### Domain Inventory
| Domain | Registrar | Created | SSL | Status |
|--------|-----------|---------|-----|--------|
```
