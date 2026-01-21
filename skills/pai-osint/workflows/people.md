---
name: people-lookup
description: 7-phase OSINT workflow for investigating individuals
---

# People OSINT Lookup

Structured intelligence gathering on individuals within professional, authorized contexts.

## Phase 1: Authorization and Scope

**BLOCKING - Do not proceed without completion**

Verify:
- [ ] Explicit authorization from client or authorized party
- [ ] Subject consent (if applicable to jurisdiction)
- [ ] Legal compliance (FCRA for employment, GDPR for EU subjects, CCPA for CA residents)
- [ ] Anti-stalking law compliance
- [ ] Defined scope boundaries
- [ ] Purpose documentation

**If any item unchecked: STOP and request authorization**

## Phase 2: Identifier Collection

Gather starting data:
- Full legal name and known aliases
- Date of birth (if authorized)
- Email addresses
- Phone numbers
- Physical addresses (current and historical)
- Social media handles
- Current and past employers
- Professional licenses/certifications

## Phase 3: Professional Intelligence

Research employment and credentials:

| Source | URL | Data |
|--------|-----|------|
| LinkedIn | linkedin.com | Profile, connections, endorsements |
| LinkedIn Sales Navigator | linkedin.com/sales | Advanced search (if available) |
| OpenCorporates | opencorporates.com | Corporate officer records |
| SEC EDGAR | sec.gov/edgar | Officer/director filings |
| USPTO | uspto.gov | Patent filings |
| Google Scholar | scholar.google.com | Academic publications |
| ResearchGate | researchgate.net | Academic network |

## Phase 4: Public Records

Access within authorized scope only:

| Source | URL | Data |
|--------|-----|------|
| PACER | pacer.uscourts.gov | Federal court records |
| State Courts | (varies by state) | Civil/criminal records |
| Property Records | (county assessor) | Real estate ownership |
| Business Filings | (Secretary of State) | LLC/Corp ownership |
| Professional Licenses | (state boards) | License verification |
| Voter Records | (if public in state) | Registration, address |

**Note:** Only access records appropriate for authorization scope.

## Phase 5: Digital Footprint

Investigate online presence:

| Tool | URL | Purpose |
|------|-----|---------|
| Namechk | namechk.com | Username across platforms |
| Sherlock | github.com/sherlock-project/sherlock | Username search 300+ sites |
| Hunter.io | hunter.io | Email patterns, verification |
| Have I Been Pwned | haveibeenpwned.com | Breach exposure |
| Google Images | images.google.com | Reverse image search |
| TinEye | tineye.com | Reverse image search |
| Wayback Machine | archive.org | Historical web presence |
| Social Searcher | social-searcher.com | Social media monitoring |

## Phase 6: Parallel Research Deployment

Deploy researchers simultaneously using Task tool:

```
Task 1: Professional Background
- Employment verification
- Education confirmation
- Publication review
- Patent search

Task 2: Public Records
- Court records search
- Property records
- Business filings
- License verification

Task 3: Digital Presence
- Social media profiles
- Published content
- Forum participation
- Domain ownership

Task 4: Reputation
- News mentions
- Reviews and testimonials
- Professional endorsements
- Red flag indicators
```

Each researcher uses WebSearch and WebFetch to gather data independently.

## Phase 7: Verification and Synthesis

### Cross-Reference Findings

For each significant finding:
1. Identify primary source
2. Find corroborating sources (minimum 2 for important claims)
3. Note any contradictions
4. Assign confidence level

### Report Structure

```markdown
## Subject: [Name]
**Authorization:** [Reference to authorization document]
**Scope:** [Defined boundaries]
**Date:** [Investigation date]

### Executive Summary
[Key findings in 3-5 sentences]

### Professional Background
[Employment, education, credentials]
Confidence: [HIGH/MEDIUM/LOW]

### Public Records
[Court records, property, business filings]
Confidence: [HIGH/MEDIUM/LOW]

### Digital Footprint
[Online presence, social media, publications]
Confidence: [HIGH/MEDIUM/LOW]

### Red Flags
[Any concerning findings with severity]

### Information Gaps
[What could not be verified]

### Sources
[Complete citation list with access dates]

### Methodology
[Tools and techniques used]
```

## Ethical Boundaries

**Permitted:**
- Public information only
- Authorized database access
- Open source research

**Prohibited:**
- Pretexting or impersonation
- Unauthorized account access
- Social engineering
- Illegal data purchases
- Scope violations
- Terms of service violations
