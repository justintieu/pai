---
name: passive-recon
description: Intelligence gathering using exclusively public sources without direct target interaction.
---

# Passive Reconnaissance Workflow

Systematic intelligence gathering using public sources and third-party services. These techniques do NOT send packets directly to the target and do NOT trigger IDS/IPS systems.

## Scope

Accepts the following target types:
- Domains (`example.com`)
- IP addresses (`1.2.3.4`)
- CIDR ranges (`10.0.0.0/24`)
- ASN numbers (`AS12345`)

## Techniques

### WHOIS Lookups
```bash
whois example.com
whois 1.2.3.4
```
Extract: Registration dates, registrant info, nameservers, netblock ownership.

### DNS Enumeration
```bash
dig example.com A
dig example.com AAAA
dig example.com MX
dig example.com NS
dig example.com TXT
dig example.com SOA
```
Extract: IP mappings, mail servers, nameservers, SPF/DKIM/DMARC records.

### Certificate Transparency
Query crt.sh for certificates:
```
https://crt.sh/?q=example.com&output=json
```
Extract: Subdomains, certificate history, issuing CAs.

### IPInfo Queries
```bash
curl -s "https://ipinfo.io/1.2.3.4/json"
```
Extract: Geolocation, ASN, organization, hostname.

### Reverse DNS
```bash
dig -x 1.2.3.4
```
Extract: PTR records, hostname mappings.

## Workflow by Target Type

### For Domains

1. **WHOIS lookup** - Registration and ownership
2. **DNS enumeration** - All record types
3. **Certificate transparency** - Subdomain discovery
4. **Resolve IPs** - Map domain to infrastructure
5. **IPInfo on discovered IPs** - Hosting providers

### For IP Addresses

1. **IPInfo lookup** - Geo, ASN, organization
2. **Reverse DNS** - Associated hostnames
3. **WHOIS netblock** - Range ownership
4. **Certificate search** - Domains on this IP

### For CIDR Ranges

1. **WHOIS on range** - Netblock registration
2. **ASN mapping** - Network ownership
3. **Sample IP investigation** - Representative hosts (avoid mass scanning)
4. **Public database queries** - Shodan, Censys (if available)

### For ASN Numbers

1. **ASN WHOIS** - Organization details
2. **BGP prefix lookup** - Announced ranges
3. **Sample investigation** - Representative IPs
4. **Related ASN discovery** - Peer relationships

## Output Format

```markdown
# Passive Reconnaissance Report

**Target:** [target]
**Date:** [timestamp]
**Methodology:** Passive only (no direct interaction)

## Registration Details
[WHOIS findings]

## DNS Records
[DNS enumeration results]

## Discovered Subdomains
[Certificate transparency findings]

## IP/Network Information
[IPInfo and netblock data]

## Security Posture
[SPF, DMARC, certificate validity, etc.]

## Recommendations
[Suggested next steps if authorized]
```

## Rate Limits

Respect API rate limits:
- **crt.sh**: No official limit, but be respectful
- **IPInfo**: 50K/month free tier
- **WHOIS**: Varies by registrar, typically 1/second

## Integration

**Upstream:** Receives targets from OSINT discovery
**Downstream:** Findings can feed into active web assessment (with authorization)
