---
name: entity-lookup
description: 9-phase threat intelligence workflow for domains, IPs, and threat actors
---

# Entity OSINT Lookup

Structured threat intelligence gathering for technical entities including domains, IPs, ASNs, hashes, and threat actors.

## Phase 1: Authorization and Classification

**BLOCKING - Do not proceed without completion**

Verify:
- [ ] Explicit authorization (security team, incident response)
- [ ] Defined scope
- [ ] Legal compliance confirmed

**Entity Classification:**
- Domain/URL
- IP Address
- ASN
- File Hash
- Email Address
- Threat Actor/Group

## Phase 2: Domain/URL Analysis

For domain entities:

| Tool | URL | Data |
|------|-----|------|
| WHOIS | whois.domaintools.com | Registration, registrant, dates |
| DomainTools | domaintools.com | WHOIS history, risk score |
| ViewDNS | viewdns.info | DNS records, IP history |
| SecurityTrails | securitytrails.com | 4.5B DNS records |
| URLScan.io | urlscan.io | Live scan, DOM, resources |
| VirusTotal | virustotal.com | Multi-engine scan |
| URLhaus | urlhaus.abuse.ch | Malware URL database |
| Wayback Machine | archive.org | Historical snapshots |

**Collect:**
- Registration date and registrar
- Registrant information (if available)
- Name servers
- MX records
- Historical changes
- Reputation scores

## Phase 3: IP Address Analysis

For IP entities:

| Tool | URL | Data |
|------|-----|------|
| IPinfo | ipinfo.io | Geolocation, ASN, company |
| MaxMind | maxmind.com | Geolocation database |
| Shodan | shodan.io | Open ports, services |
| Censys | censys.io | Certificates, services |
| AbuseIPDB | abuseipdb.com | Abuse reports, confidence |
| GreyNoise | greynoise.io | Scanner classification |
| BinaryEdge | binaryedge.io | Internet scanning data |
| Hurricane Electric | bgp.he.net | BGP routing info |

**Collect:**
- Geolocation (country, city, ISP)
- ASN and organization
- Open ports and services
- Abuse reports
- Historical activity
- Related domains (reverse DNS)

## Phase 4: Initial Research Fleet

Deploy 8 parallel researchers:

```
Task 1: Domain Intelligence
- WHOIS analysis
- DNS enumeration
- Certificate transparency

Task 2: IP Intelligence
- Geolocation
- ASN mapping
- Hosting provider

Task 3: Malware Association
- VirusTotal lookups
- Hybrid Analysis
- Malware Bazaar

Task 4: Threat Actor Research
- MITRE ATT&CK mapping
- Known campaigns
- Attribution indicators

Task 5: Infrastructure Mapping
- Related domains
- Shared hosting
- Certificate relationships

Task 6: Historical Analysis
- Wayback Machine
- WHOIS history
- DNS history

Task 7: Reputation Check
- Blacklist status
- Abuse reports
- Security vendor ratings

Task 8: IOC Correlation
- ThreatFox
- AlienVault OTX
- Open source feeds
```

## Phase 5: Network and ASN Analysis

| Tool | URL | Data |
|------|-----|------|
| Hurricane Electric | bgp.he.net | BGP routing, peers |
| RIPE Stat | stat.ripe.net | Internet measurements |
| PeeringDB | peeringdb.com | Peering information |
| IPNetDB | ipnetdb.com | Network allocation |

**Map:**
- ASN ownership
- IP ranges
- Peering relationships
- Geographic distribution
- Cloud provider detection

## Phase 6: Email Infrastructure

For domains with email:

| Check | Tool | Finding |
|-------|------|---------|
| MX Records | dig | Mail servers |
| SPF | dig TXT | Authorized senders |
| DKIM | dig TXT | Email signing |
| DMARC | dig TXT | Policy enforcement |
| Email Rep | emailrep.io | Reputation score |

## Phase 7: Extended Research Fleet

Deploy 6 specialized researchers:

```
Task 1: Dark Web Exposure
- Tor hidden services
- Paste sites
- Forums (ethical access only)

Task 2: C2 Indicators
- Known C2 patterns
- Beacon analysis
- Protocol fingerprints

Task 3: Phishing Analysis
- Lookalike domains
- Brand impersonation
- Credential harvesting

Task 4: Malware Family
- Sample analysis
- Family classification
- Variant tracking

Task 5: Campaign Attribution
- TTPs matching
- Infrastructure overlap
- Timeline correlation

Task 6: Geographic Analysis
- Hosting patterns
- Time zone indicators
- Language analysis
```

## Phase 8: Correlation and Timeline

### Correlation Analysis

Identify relationships:
- Shared registrant information
- Common IP addresses
- Overlapping certificates
- Similar naming patterns
- Temporal correlations

### Timeline Construction

```
[Date] - Domain registered
[Date] - First seen in threat feeds
[Date] - Certificate issued
[Date] - Malware campaign observed
[Date] - Infrastructure change
[Date] - Current status
```

## Phase 9: Threat Report

### Report Structure

```markdown
## Threat Intelligence Report
**Entity:** [Domain/IP/Hash]
**Type:** [Classification]
**Date:** [Analysis date]
**Authorization:** [Reference]

### Executive Summary
[Key findings and threat level]

### Threat Classification
**Level:** [CRITICAL/HIGH/MEDIUM/LOW/INFORMATIONAL]
**Confidence:** [HIGH/MEDIUM/LOW]

### Entity Details
- Primary identifier: [value]
- First seen: [date]
- Last seen: [date]
- Status: [Active/Inactive/Unknown]

### Technical Analysis

#### DNS/WHOIS
[Registration details, history]

#### Infrastructure
[Hosting, IPs, ASN]

#### Malware Association
[Detected samples, families]

#### Threat Actor Attribution
[Known groups, TTPs]

### Indicators of Compromise (IOCs)
| Type | Value | Confidence |
|------|-------|------------|
| Domain | [value] | [HIGH/MEDIUM/LOW] |
| IP | [value] | [HIGH/MEDIUM/LOW] |
| Hash | [value] | [HIGH/MEDIUM/LOW] |
| URL | [value] | [HIGH/MEDIUM/LOW] |

### Related Entities
[Connected domains, IPs, infrastructure]

### Timeline
[Chronological activity]

### Recommendations
1. [Action 1]
2. [Action 2]

### MITRE ATT&CK Mapping
| Tactic | Technique | ID |
|--------|-----------|-----|

### Sources
[Complete citations]
```

## Threat Levels

| Level | Criteria |
|-------|----------|
| CRITICAL | Active exploitation, widespread impact, confirmed APT |
| HIGH | Known malware association, active C2, credential harvesting |
| MEDIUM | Suspicious indicators, limited threat intel, possible abuse |
| LOW | Minor red flags, historical issues, unconfirmed reports |
| INFORMATIONAL | No threat indicators, infrastructure documentation only |
