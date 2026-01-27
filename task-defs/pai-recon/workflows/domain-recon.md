---
name: domain-recon
description: Systematic domain infrastructure mapping through discovery and enumeration.
---

# Domain Reconnaissance Workflow

Comprehensive mapping of domain infrastructure including registration details, DNS configuration, subdomains, mail infrastructure, hosting providers, and technology stack.

## Two Operational Modes

### Passive Mode (Default)
No authorization needed. Uses non-intrusive techniques:
- WHOIS queries
- DNS enumeration
- Certificate transparency databases
- Public search engines

### Active Mode (Authorization Required)
Requires explicit authorization:
- Subdomain brute-forcing
- HTTP/HTTPS probing
- Technology detection (fingerprinting)
- Web crawling

## Phases

### Phase 1: Domain Validation and WHOIS

1. Validate domain format
2. Perform WHOIS lookup:
   ```bash
   whois example.com
   ```
3. Extract:
   - Registration dates (created, updated, expires)
   - Registrant information
   - Registrar details
   - Nameservers
   - DNSSEC status

### Phase 2: DNS Enumeration

Query all relevant record types:
```bash
dig example.com A +short
dig example.com AAAA +short
dig example.com MX +short
dig example.com NS +short
dig example.com TXT
dig example.com SOA +short
dig example.com CAA +short
```

Extract:
- Primary IP addresses (A/AAAA)
- Mail servers and priorities (MX)
- Authoritative nameservers (NS)
- SPF, DKIM, DMARC policies (TXT)
- Certificate authority restrictions (CAA)

### Phase 3: Subdomain Enumeration (Passive)

**Certificate Transparency:**
```bash
curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | sort -u
```

**Common subdomain patterns:**
- www, mail, webmail, remote, vpn
- api, app, dev, staging, test
- admin, portal, login, sso
- ftp, sftp, cdn, assets

### Phase 4: IP Address Resolution

For each discovered subdomain:
1. Resolve to IP addresses
2. Group by hosting provider
3. Identify shared infrastructure

```bash
dig subdomain.example.com A +short
```

### Phase 5: Active Probing (Authorization Required)

**Only with explicit authorization:**

HTTP/HTTPS probing:
```bash
# Example with httpx (if installed)
echo "subdomain.example.com" | httpx -silent -status-code -title
```

Technology detection:
- Server headers
- Response fingerprints
- JavaScript frameworks

### Phase 6: Certificate Analysis

For discovered web services:
```bash
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -text
```

Extract:
- Certificate validity dates
- Subject Alternative Names (SANs)
- Issuing CA
- Certificate chain

## Output Format

```markdown
# Domain Reconnaissance Report

**Target:** example.com
**Date:** [timestamp]
**Mode:** Passive / Active (with authorization)

## Registration Summary
| Field | Value |
|-------|-------|
| Registrar | [registrar] |
| Created | [date] |
| Expires | [date] |
| Nameservers | [ns1, ns2] |

## DNS Configuration
### A Records
[IP addresses]

### MX Records
| Priority | Server |
|----------|--------|
| 10 | mail.example.com |

### TXT Records (Security)
- SPF: [record]
- DMARC: [record]

## Discovered Subdomains
[List with resolved IPs]

## Hosting Infrastructure
| Provider | IPs | Subdomains |
|----------|-----|------------|
| [provider] | [count] | [list] |

## Security Observations
- [Certificate findings]
- [Email security posture]
- [DNSSEC status]

## Recommendations
[Next steps if authorized]
```

## Integration

**Calls:**
- `ip-recon.md` for discovered IP addresses
- Web assessment tools for interesting endpoints (with authorization)

**Called by:**
- OSINT investigations providing domain targets
