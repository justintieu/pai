# Private Investigator

---
name: pai-privateinvestigator
description: Ethical people-finding using public data sources. USE WHEN find person, locate someone, reconnect with, reverse lookup, who is, background check, verify identity, people search.
tools: WebSearch, WebFetch, Bash
---

## Purpose

Locate individuals and verify identities using only publicly available information. This skill coordinates systematic searches across people-search aggregators, social media platforms, public records, and reverse lookup services.

**CORE PRINCIPLE: PUBLIC DATA ONLY** - No hacking, pretexting, or authentication bypass. All techniques must be legal and ethical.

## Ethical Framework

### Allowed
- Public records (property, court, voter registration where public)
- Publicly posted social media content
- People-search aggregator websites
- Reverse lookup services for phone/email/username
- Professional license verification
- Business registration records

### Prohibited
- Authentication bypass or account access
- Pretexting or social engineering
- Accessing private databases without authorization
- Any activity that could enable stalking or harassment
- Circumventing privacy settings

**STOP IMMEDIATELY** if investigation risks crossing into prohibited territory.

## Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Find Person | `workflows/find-person.md` | Full investigation with parallel searches |
| Social Media Search | `workflows/social-media.md` | Cross-platform social investigation |
| Public Records | `workflows/public-records.md` | Government and official records |
| Reverse Lookup | `workflows/reverse-lookup.md` | Phone, email, image, username searches |
| Verify Identity | `workflows/verify-identity.md` | Confirm correct person matches |

## Quick Start

For most requests, use the Find Person workflow which orchestrates all other workflows.

### Basic Investigation

1. Gather all known information about the subject
2. Deploy parallel searches across data sources
3. Cross-reference and verify findings
4. Assign confidence scores to matches
5. Generate structured report

## Confidence Scoring

| Level | Criteria | Action |
|-------|----------|--------|
| HIGH | 3+ unique identifiers match from independent sources | Safe to act |
| MEDIUM | 2 identifiers matching across sources | Verify before acting |
| LOW | Single source only | Requires additional verification |
| UNCONFIRMED | Conflicting or insufficient data | Do not act; investigate further |

## Key Resources

### People Search Aggregators
- TruePeopleSearch, Spokeo, BeenVerified
- WhitePages, FastPeopleSearch

### Social Media X-Ray Searches
- Google: `site:linkedin.com "John Smith" "San Francisco"`
- Google: `site:facebook.com "John Smith"`

### Username Enumeration
- Sherlock (CLI): Check 400+ platforms
- WhatsMyName (web): Username lookup
- Holehe (CLI): Email-to-service mapping

### Public Records
- NETR Online (property records)
- CourtListener (federal courts - free)
- PACER (federal courts - paid)
- State Secretary of State (business filings)

## Examples

**Example 1: Find old colleague**
```
User: I'm trying to reconnect with John Smith who worked at Acme Corp in 2015
Assistant: [Uses find-person workflow to search LinkedIn, people aggregators,
and cross-reference with Acme Corp records]
```

**Example 2: Reverse phone lookup**
```
User: Who owns the phone number 555-123-4567?
Assistant: [Uses reverse-lookup workflow to identify carrier, location,
and associated names]
```

**Example 3: Verify identity**
```
User: I found 3 people named Sarah Johnson in Chicago - which is the right one?
Assistant: [Uses verify-identity workflow to compare against known details
and establish confidence scores]
```

## Common Challenges

### Common Names
- Add geographic constraints
- Use timeline analysis (education years, career progression)
- Cross-reference with family connections
- Look for unique identifiers (middle name, profession)

### Limited Results
- Try name variations (nicknames, maiden names)
- Search associate networks
- Expand geographic search radius
- Use older records (wayback machine, archived data)

### Privacy-Conscious Subjects
- Focus on business/professional presence
- Check property and court records
- Look for professional licenses
- Search through associate connections

---

*This skill systematizes ethical skip-tracing techniques using parallel AI research capabilities.*
