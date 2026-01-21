---
name: ip-recon
description: Comprehensive IP address investigation through passive and authorized active techniques.
---

# IP Address Reconnaissance Workflow

Detailed reconnaissance on specific IP addresses to gather geolocation, network ownership, DNS information, open ports, and associated domains.

## Two-Phase Approach

### Passive Intelligence (Default)

No authorization required:
- IPInfo API lookups
- Reverse DNS queries
- WHOIS netblock information
- Certificate transparency searches

### Active Reconnaissance (Authorization Required)

Requires explicit authorization:
- Port scanning
- Service detection
- Banner grabbing

## Passive Phase

### Step 1: IPInfo Lookup

```bash
curl -s "https://ipinfo.io/[IP]/json"
```

Extract:
- **Geolocation**: City, region, country, coordinates
- **Network**: ASN, organization name
- **Hostname**: Reverse DNS (if available)
- **Type**: Hosting, residential, business

### Step 2: Reverse DNS

```bash
dig -x [IP]
```

Extract:
- PTR record (hostname)
- Hosting provider naming conventions

### Step 3: WHOIS Netblock

```bash
whois [IP]
```

Extract:
- Netblock range (CIDR)
- Organization/Owner
- Abuse contact
- Registration dates

### Step 4: Certificate Search

Search for certificates issued to this IP:
```
https://crt.sh/?q=[IP]
```

Or search by reverse DNS hostname for associated domains.

### Step 5: Historical Data

Query historical DNS databases (if available):
- Previous hostnames
- Historical reverse DNS

## Active Phase (Authorization Required)

**STOP: Confirm authorization before proceeding.**

Authorization types:
- Penetration test engagement
- Bug bounty program (in scope)
- Owned/controlled asset

### Step 6: Port Scanning

```bash
# Common ports only (quick scan)
nmap -Pn -sT -p 21,22,23,25,53,80,110,143,443,445,993,995,3306,3389,5432,8080,8443 [IP]

# Full scan (slower, more thorough)
nmap -Pn -sT -p- [IP]
```

### Step 7: Service Detection

```bash
nmap -Pn -sV -p [open_ports] [IP]
```

### Step 8: Banner Grabbing

```bash
# HTTP
curl -I http://[IP]

# HTTPS
curl -Ik https://[IP]

# Generic
nc -vz [IP] [port]
```

## Output Format

```markdown
# IP Reconnaissance Report

**Target:** [IP]
**Date:** [timestamp]
**Mode:** Passive / Active (with authorization)

## Geolocation
| Field | Value |
|-------|-------|
| Country | [country] |
| Region | [region] |
| City | [city] |
| Coordinates | [lat, lon] |

## Network Information
| Field | Value |
|-------|-------|
| ASN | [asn] |
| Organization | [org] |
| Netblock | [cidr] |
| Type | [hosting/residential/business] |

## DNS
- **Reverse DNS:** [hostname]
- **Associated domains:** [list]

## Open Services (if active scan authorized)
| Port | Service | Version |
|------|---------|---------|
| 22 | SSH | OpenSSH 8.x |
| 80 | HTTP | nginx 1.x |
| 443 | HTTPS | nginx 1.x |

## Certificates (if HTTPS)
- **Subject:** [domain]
- **SANs:** [list]
- **Issuer:** [ca]
- **Valid:** [dates]

## Security Observations
[Notable findings]

## Recommendations
[Next steps if authorized]
```

## Critical Safeguard

**Always start passive. Only go active with explicit authorization and documentation.**

## Integration

**Called by:**
- Domain reconnaissance (for discovered IPs)
- OSINT investigations (infrastructure mapping)
- Netblock reconnaissance (sample IPs)

**Calls:**
- Web assessment tools (for discovered web services, with authorization)
