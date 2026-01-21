# Reverse Lookup Workflow

---
name: reverse-lookup
description: Identify individuals from phone, email, image, or username
---

## Purpose

When you have partial information (phone number, email, photo, or username), use reverse lookup techniques to identify the associated individual.

## Phone Number Lookup

### Step 1: Basic Information

**Free services:**
- CallerID Test (calleridtest.com)
- TruePeopleSearch reverse phone
- WhitePages reverse lookup

**Information available:**
- Carrier name
- Line type (mobile/landline/VoIP)
- General location
- Associated names

### Step 2: Carrier Lookup

Determine the phone type:
```
Mobile -> More likely personal, may have social accounts
Landline -> Often residential, check address
VoIP -> May be business or privacy-conscious
```

### Step 3: Deep Search

**Paid services (if needed):**
- Spokeo
- BeenVerified
- Intelius

**API options for automation:**
- Telnyx Lookup API
- Twilio Lookup

### Phone Output

```markdown
## Phone Lookup: [Number]

- **Carrier:** [Name]
- **Type:** Mobile/Landline/VoIP
- **Location:** [City, State]
- **Associated Names:** [List]
- **Confidence:** HIGH/MEDIUM/LOW
```

## Email Investigation

### Step 1: Service Detection

**Holehe (CLI):**
```bash
holehe [email@domain.com]
```
Scans 120+ websites to identify where the email is registered.

**Epieos:**
- Connects to Google account details
- May reveal name, photo, reviews

### Step 2: Domain Analysis

For non-freemail addresses:
- Check domain ownership (WHOIS)
- Visit company website
- Search for email in public documents

### Step 3: Search Engine Lookup

```
"[email@domain.com]"
"[email]" site:linkedin.com
"[email]" site:github.com
```

### Step 4: Data Breach Check

**Have I Been Pwned:**
- haveibeenpwned.com
- Shows which breaches included the email
- May indicate services they use

### Email Output

```markdown
## Email Lookup: [address]

### Associated Services
| Service | Registered | Notes |
|---------|------------|-------|
| ... | Yes/No | ... |

### Additional Findings
- **Name:** [If discovered]
- **Profile links:** [URLs]
- **Domain info:** [If corporate email]
```

## Image/Photo Analysis

### Step 1: Reverse Image Search

**Google Images:**
- images.google.com
- Upload or paste image URL
- Find other instances of the photo

**TinEye:**
- tineye.com
- Finds exact and modified copies
- Shows where image appears online

**Yandex Images:**
- Often better for faces than Google
- Strong facial recognition

### Step 2: Facial Recognition (Use Carefully)

**PimEyes:**
- pimeyes.com
- Facial recognition search
- **Note:** Verify legality in your jurisdiction

**FaceCheck.id:**
- Similar facial recognition service
- Check local regulations before use

### Step 3: Metadata Analysis

If you have the original image file:
- Check EXIF data for location, camera, date
- Tools: ExifTool, online EXIF viewers

### Image Output

```markdown
## Image Analysis

### Reverse Search Results
| Source | URL | Match Type |
|--------|-----|------------|
| ... | ... | Exact/Similar |

### Identified Locations
[Where this image appears online]

### Metadata (if available)
- Date taken: ...
- Location: ...
- Device: ...

### Possible Identity
[Based on where image appears]
```

## Username Tracking

### Step 1: Cross-Platform Search

**Sherlock (CLI):**
```bash
sherlock [username] --print-found
```
Checks 400+ platforms for the username.

**WhatsMyName:**
- whatsmyname.app
- Web-based alternative

**Namechk:**
- namechk.com
- Quick availability check

### Step 2: Username Variations

Try common patterns:
- [username]
- [username]123
- [first][last]
- [first].[last]
- [first]_[last]
- [first][lastinitial]

### Step 3: Archive Search

**Wayback Machine:**
- web.archive.org
- Check archived versions of discovered profiles
- May show deleted content

### Username Output

```markdown
## Username Analysis: [username]

### Platforms Found
| Platform | URL | Active | Confidence |
|----------|-----|--------|------------|
| ... | ... | Yes/No | HIGH/MEDIUM/LOW |

### Related Usernames
[Variations that appear to be same person]

### Profile Information
[Aggregated bio, location, etc. from profiles]
```

## Combined Lookup Strategy

When you have multiple data points:

1. Start with most unique identifier
2. Cross-reference discoveries
3. Use findings to fuel additional lookups
4. Build comprehensive profile

Example flow:
```
Phone number -> Name + Address
Name + Address -> Social media profiles
Social media -> Email address
Email -> Additional services
```

## Confidence Guidelines

| Finding | Confidence | Notes |
|---------|------------|-------|
| Multiple sources confirm same info | HIGH | Safe to use |
| Two sources agree | MEDIUM | Verify before acting |
| Single source only | LOW | Needs corroboration |
| Conflicting information | UNCONFIRMED | Investigate discrepancy |

## Legal and Ethical Notes

- All techniques use publicly available information
- Facial recognition has legal restrictions in some jurisdictions
- Do not use findings for harassment or stalking
- Document all sources for transparency
- When in doubt, verify through additional means
