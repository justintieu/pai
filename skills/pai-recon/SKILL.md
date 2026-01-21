---
name: pai-recon
description: Security reconnaissance skill for infrastructure and network mapping through passive intelligence and authorized active scanning. USE WHEN recon, reconnaissance, map infrastructure, enumerate subdomains, investigate IP, investigate domain, scan target, netblock analysis, CIDR scan, ASN lookup, security assessment.
tools: Bash, WebFetch, WebSearch
---

# PAI Recon

Security reconnaissance capability for mapping network infrastructure, investigating domains and IPs, and performing authorized security assessments.

## Workflows

| Workflow | Use When | Authorization | Purpose |
|----------|----------|---------------|---------|
| **Passive Recon** | Default for any target | None required | Public source intelligence gathering |
| **Domain Recon** | Target is a domain | Passive: None / Active: Required | Full domain mapping and enumeration |
| **IP Recon** | Target is an IP address | Passive: None / Active: Required | Comprehensive IP investigation |
| **Netblock Recon** | Target is a CIDR range | Passive: None / Active: Required | Network range scanning and analysis |

## Authorization Model

This skill separates techniques by authorization requirements:

### Passive Techniques (No Authorization Needed)
- WHOIS lookups and registration data
- DNS enumeration (A, AAAA, MX, NS, TXT records)
- Certificate transparency searches (crt.sh)
- IPInfo geolocation and ASN data
- Reverse DNS queries
- Historical archive searches

### Active Techniques (Explicit Authorization Required)
- Port scanning
- Service detection
- Live host discovery
- Subdomain brute-forcing
- Technology fingerprinting

**Active scanning requires:**
1. Explicit user confirmation
2. Documented authorization (pentest engagement, bug bounty, owned assets)
3. Scope validation
4. Session logging

## Instructions

### 1. Identify Target Type

Parse the user request to determine:
- **Domain**: `example.com`, `subdomain.example.com`
- **IP Address**: `192.168.1.1`, `2001:db8::1`
- **CIDR Range**: `10.0.0.0/24`, `192.168.0.0/16`
- **ASN**: `AS12345`

### 2. Select Workflow

Based on target type:
- Domain targets: `workflows/domain-recon.md`
- IP targets: `workflows/ip-recon.md`
- CIDR/Netblock targets: `workflows/netblock-recon.md`
- Any target (passive only): `workflows/passive-recon.md`

### 3. Default to Passive

**Always start with passive reconnaissance.** Only proceed to active techniques when:
- User explicitly requests active scanning
- User confirms authorization exists
- Scope is clearly defined

### 4. Execute Reconnaissance

Run the appropriate workflow, collecting:
- Registration and ownership data
- DNS configuration
- Network topology
- Associated infrastructure
- Security posture indicators

### 5. Generate Report

Output structured Markdown report with:
- Target summary
- Methodology used (passive/active)
- Findings by category
- Recommendations for further investigation
- Authorization notes (if active scanning performed)

## Critical Rules

1. **Never perform active scanning without explicit authorization**
2. **Document all techniques used and data sources**
3. **Respect API rate limits** (especially crt.sh, IPInfo)
4. **Log all reconnaissance activities** for audit trails
5. **Validate scope** before any scanning operation

## Integration with Other Skills

**Upstream:**
- `pai-osint` identifies entities that feed into Recon for infrastructure mapping

**Downstream:**
- Findings can feed into web assessment tools (with authorization)
- Discovered assets inform penetration testing scope

## Examples

**Example 1: Passive domain reconnaissance**
```
User: "do recon on example.com"
Claude: Executes passive-recon workflow
        - WHOIS lookup for registration data
        - DNS enumeration (A, MX, NS, TXT)
        - Certificate transparency search
        - Subdomain discovery via public sources
        Output: Structured report of findings
```

**Example 2: IP investigation**
```
User: "investigate 8.8.8.8"
Claude: Executes ip-recon workflow (passive)
        - IPInfo lookup (geo, ASN, org)
        - Reverse DNS query
        - WHOIS netblock data
        - Certificate search for associated domains
```

**Example 3: Authorized active scan**
```
User: "scan 192.168.1.0/24 - I own this network"
Claude: Confirms authorization
        Executes netblock-recon workflow (active)
        - Live host discovery
        - Port scanning
        - Service detection
        Output: Network map with discovered services
```

**Example 4: Bug bounty reconnaissance**
```
User: "recon target.com for their bug bounty program"
Claude: Executes domain-recon workflow
        - Passive techniques first
        - Checks for published scope/policy
        - Asks for confirmation before active scanning
        - Documents authorization type in report
```

## Resources

- [Passive Recon workflow](workflows/passive-recon.md) - Public source intelligence gathering
- [Domain Recon workflow](workflows/domain-recon.md) - Domain mapping and enumeration
- [IP Recon workflow](workflows/ip-recon.md) - IP address investigation
- [Netblock Recon workflow](workflows/netblock-recon.md) - CIDR range scanning
