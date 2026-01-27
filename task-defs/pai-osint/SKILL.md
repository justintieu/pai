---
name: pai-osint
description: Open source intelligence gathering with ethical framework and parallel researcher deployment. USE WHEN OSINT, background check, due diligence, research person, research company, investigate domain, threat intelligence, vet company.
tools: WebSearch, WebFetch, Task, Read, Write, Bash
---

# PAI OSINT

Comprehensive open source intelligence gathering with authorization-first architecture, domain-specific workflows, and multi-source verification.

## Workflows

| Workflow | Use When | Phases | Focus |
|----------|----------|--------|-------|
| **People** | Research individuals | 7 | Professional background, public records, digital footprint |
| **Company** | Research organizations | 7 | Business legitimacy, leadership, infrastructure |
| **Due Diligence** | Investment vetting | 5 | Domain discovery, parallel fleet, risk scoring |
| **Entity** | Threat intelligence | 9 | Domains, IPs, infrastructure, threat actors |

## Authorization Requirements

**MANDATORY before any investigation:**

- [ ] Explicit written authorization from client or authorized party
- [ ] Clear scope document defining targets and boundaries
- [ ] Legal compliance confirmed (FCRA, GDPR, CCPA, anti-stalking laws)
- [ ] Purpose documented

If any checkbox is unchecked, **STOP** and request authorization.

## Instructions

### 1. Verify Authorization

Before proceeding with ANY investigation:
1. Confirm explicit authorization exists
2. Verify scope is clearly defined
3. Check legal compliance requirements
4. Document purpose of investigation

### 2. Select Workflow

Based on target type:
- **Person** (name, individual): `workflows/people.md`
- **Company** (organization, business): `workflows/company.md`
- **Investment** (vet, due diligence, legitimate): `workflows/due-diligence.md`
- **Entity** (domain, IP, threat actor): `workflows/entity.md`

### 3. Execute with Ethical Boundaries

**ALLOWED (public sources only):**
- Public websites and social media
- Government records and filings
- News articles and press releases
- Court records (PACER, state courts)
- Corporate registrations (OpenCorporates, SEC EDGAR)
- DNS records, WHOIS, certificate transparency

**PROHIBITED:**
- Unauthorized system access
- Impersonation or social engineering
- Circumventing access controls
- Purchasing illegally obtained data
- Exceeding authorized scope
- Terms of service violations

### 4. Apply Verification Standards

**Source Requirements:**
- Critical findings: 3+ independent sources
- Important claims: 2+ independent sources
- Supporting info: 1+ verifiable source

**Confidence Levels:**
- HIGH (80-100%): Multiple confirmations from Tier 1/2 sources
- MEDIUM (50-79%): Limited confirmation, mixed source tiers
- LOW (20-49%): Single source or Tier 3/4 only
- SPECULATIVE (<20%): Inference only, flag clearly

**Source Hierarchy:**
1. **Tier 1 (Primary):** Official registries, court records, government databases
2. **Tier 2 (Verified):** Established news, academic work, professional databases
3. **Tier 3 (Community):** Social media, forums, reviews
4. **Tier 4 (Technical):** DNS, WHOIS, certificate logs

### 5. Document and Report

All reports must include:
- Scope statement referencing authorization
- Methodology section
- Findings with confidence levels
- Source citations
- Caveats and gaps
- Red flag classifications (CRITICAL/HIGH/MEDIUM/LOW)

## Examples

**Example 1: Person lookup**
```
User: "I need background research on John Smith, the CFO candidate. We have his signed authorization form."
Claude: Confirms authorization exists
        Executes people workflow
        Returns professional history, public records, digital footprint
        Includes confidence levels and sources
```

**Example 2: Company research**
```
User: "Research Acme Corp before our partnership meeting"
Claude: Confirms authorization scope
        Executes company workflow
        Returns business legitimacy, leadership, financials, red flags
        Maps digital infrastructure and domains
```

**Example 3: Investment due diligence**
```
User: "Vet TechStartup Inc - we're considering Series A investment"
Claude: Confirms investment authority
        Executes due-diligence workflow (domain discovery first)
        Deploys parallel researcher fleet
        Returns risk score (0-100) with recommendation
        Outputs: PROCEED / PROCEED WITH CONDITIONS / DECLINE / AVOID
```

**Example 4: Threat intelligence**
```
User: "Investigate suspicious-domain.com that appeared in our logs"
Claude: Confirms security authorization
        Executes entity workflow
        Returns WHOIS, DNS, hosting, certificates
        Checks threat intelligence databases
        Provides threat classification and IOCs
```

## Resources

- [People workflow](workflows/people.md) - 7-phase individual investigation
- [Company workflow](workflows/company.md) - 7-phase business research
- [Due diligence workflow](workflows/due-diligence.md) - 5-phase investment vetting
- [Entity workflow](workflows/entity.md) - 9-phase threat analysis
- [Tools reference](tools.md) - 90+ vetted OSINT tools
