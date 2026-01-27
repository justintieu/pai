---
name: netblock-recon
description: CIDR range scanning and network block analysis for authorized penetration testing.
---

# Netblock Reconnaissance Workflow

Structured investigation of network blocks (CIDR ranges) through passive and active methods for penetration testing, asset inventory, and threat intelligence.

## Critical Authorization Warning

**Scanning network ranges you do not own is illegal in most jurisdictions.**

Active scanning of netblocks:
- Is detectable by IDS/IPS systems
- May be logged and reported to abuse contacts
- Could be considered unauthorized access

**Requirements for active scanning:**
1. Explicit written authorization
2. Confirmed scope documentation
3. Coordination with network owners
4. Appropriate rate limiting

## Two Operating Modes

### Passive Mode (Default, Safe)

- WHOIS lookups
- ASN mapping
- Sample IP investigation
- Public database queries

### Active Mode (Authorization Required)

- Live host discovery
- Port scanning
- Service detection
- Network mapping

## Phase 1: CIDR Validation

### Parse and Validate

Validate CIDR notation:
- `10.0.0.0/24` = 256 IPs
- `192.168.0.0/16` = 65,536 IPs
- `172.16.0.0/12` = 1,048,576 IPs

### Scan Size Categories

| Size | CIDR | IP Count | Recommendation |
|------|------|----------|----------------|
| Small | /24-/32 | 1-256 | Full scan feasible |
| Medium | /16-/23 | 257-65K | Sample or targeted scan |
| Large | /8-/15 | 65K-16M | Sample only, heavy rate limiting |
| Huge | </8 | 16M+ | Statistical sampling only |

## Phase 2: Passive Intelligence

### WHOIS Netblock Query

```bash
whois [start_ip]
```

Extract:
- Netblock owner/organization
- Abuse contact
- Registration details
- Country/region allocation

### ASN Identification

From WHOIS or IPInfo:
```bash
curl -s "https://ipinfo.io/[start_ip]/json" | jq '.org'
```

### Representative IP Sampling

For large ranges, investigate sample IPs:
- First usable IP
- Last usable IP
- Random samples from different subnets

Use `ip-recon.md` workflow for each sample.

### Public Database Queries

If available:
- Shodan: `https://www.shodan.io/search?query=net:[CIDR]`
- Censys: `https://search.censys.io/hosts?q=ip:[CIDR]`

## Phase 3: Active Reconnaissance (Authorization Required)

**STOP: Confirm authorization before proceeding.**

### Host Discovery

```bash
# Ping sweep (ICMP)
nmap -sn [CIDR]

# TCP discovery (more reliable)
nmap -sn -PS22,80,443 [CIDR]
```

### Port Scanning

```bash
# Quick scan of common ports
nmap -Pn -sT -p 22,80,443,8080 --open [CIDR]

# Full scan (use with caution on large ranges)
nmap -Pn -sT -p- --min-rate 100 [CIDR]
```

### Service Detection

```bash
nmap -Pn -sV -p [open_ports] [live_hosts]
```

## Rate Limiting Guidelines

| Range Size | Max Rate | Notes |
|------------|----------|-------|
| /24 | 1000/sec | Standard |
| /16 | 100/sec | Conservative |
| /8+ | 10/sec | Very conservative, sample only |

## Output Format

```markdown
# Netblock Reconnaissance Report

**Target:** [CIDR]
**Date:** [timestamp]
**Mode:** Passive / Active (with authorization)
**Authorization:** [type and reference]

## Range Summary
| Field | Value |
|-------|-------|
| CIDR | [notation] |
| IP Count | [count] |
| First IP | [ip] |
| Last IP | [ip] |

## Ownership
| Field | Value |
|-------|-------|
| Organization | [org] |
| ASN | [asn] |
| Country | [country] |
| Abuse Contact | [email] |

## Discovered Hosts (if active scan)
| IP | Hostname | Open Ports | Services |
|----|----------|------------|----------|
| [ip] | [hostname] | 22,80,443 | SSH, HTTP, HTTPS |

## Network Topology
[Summary of discovered infrastructure]

## Security Observations
[Notable findings: exposed services, misconfigurations]

## Recommendations
[Next steps for authorized testing]
```

## Integration

**Called by:**
- ASN reconnaissance (for announced prefixes)
- Infrastructure mapping projects

**Calls:**
- `ip-recon.md` for individual IP investigation
- Web assessment for discovered web services (with authorization)
