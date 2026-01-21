# Social Media Search Workflow

---
name: social-media
description: Systematic cross-platform social media investigation
---

## Purpose

Locate and verify an individual's social media presence across major platforms using search techniques and username enumeration.

## Instructions

### Step 1: LinkedIn Search (Priority)

LinkedIn is often the most reliable for professionals.

**Direct search:**
- Search name + location
- Search name + current/former employer
- Search name + university

**X-ray search (more comprehensive):**
```
site:linkedin.com "[Full Name]" "[City]"
site:linkedin.com "[Full Name]" "[Company]"
site:linkedin.com/in/ "[Full Name]"
```

**Capture:**
- Profile URL
- Current title and employer
- Location
- Education history
- Connections (for associate mapping)

### Step 2: Facebook Search

**X-ray search (bypasses login restrictions):**
```
site:facebook.com "[Full Name]" "[City]"
site:facebook.com "[Full Name]" "[Workplace]"
```

**Look for:**
- Profile URL
- Profile photos (for verification)
- Public posts
- Friends list (if public)
- Check-ins and locations

### Step 3: Instagram Search

**Search methods:**
```
site:instagram.com "[Full Name]"
site:instagram.com "[username]"
```

**Check:**
- Username patterns (often consistent across platforms)
- Bio information
- Tagged photos
- Location tags
- Linked accounts

### Step 4: Twitter/X Search

**Search methods:**
```
site:twitter.com "[Full Name]"
site:x.com "[Full Name]"
"[Full Name]" site:twitter.com OR site:x.com
```

**Capture:**
- Handle
- Bio
- Location in profile
- Tweet content for verification
- Following/followers for associates

### Step 5: TikTok Search

Particularly useful for younger subjects.

```
site:tiktok.com "[Full Name]"
site:tiktok.com "@[username]"
```

### Step 6: Username Enumeration

If you discover a username on one platform, check others.

**Sherlock (CLI tool):**
```bash
sherlock [username] --print-found
```
Checks 400+ platforms for matching usernames.

**WhatsMyName (web):**
- https://whatsmyname.app/
- Enter username to find matches

**Manual cross-check:**
- Same username on different platforms
- Variations (name.surname, namesurname, name_surname)

### Step 7: Email Account Discovery

**Holehe (CLI tool):**
```bash
holehe [email@domain.com]
```
Identifies which services an email is registered with (120+ sites).

**Epieos:**
- Connects emails to Google account details
- May reveal additional profile information

### Step 8: Verification

For each discovered account, verify it belongs to the correct person:

| Check | Method |
|-------|--------|
| Photo consistency | Compare profile photos across platforms |
| Bio alignment | Name, location, profession should match |
| Connection overlap | Mutual friends/followers across platforms |
| Content themes | Interests and topics should be consistent |
| Timeline | Account creation dates and activity patterns |

## Confidence Assessment

**HIGH Confidence:**
- Photos match across platforms
- Bio information consistent
- Mutual connections verified
- Content themes align

**MEDIUM Confidence:**
- Some matching elements
- Limited cross-verification possible
- Need additional confirmation

**LOW Confidence:**
- Single matching element only
- No cross-verification
- Common name/photo

## Output Format

```markdown
## Social Media Profile: [Subject Name]

### Verified Accounts
| Platform | URL | Username | Confidence |
|----------|-----|----------|------------|
| LinkedIn | ... | ... | HIGH |
| Facebook | ... | ... | MEDIUM |
| Instagram | ... | ... | HIGH |

### Unverified (Possible Matches)
| Platform | URL | Notes |
|----------|-----|-------|
| Twitter | ... | Name matches, location unclear |

### Username Patterns
- Primary: [username]
- Variations found: [list]

### Key Findings
[Notable information discovered through social media]
```

## Privacy Notes

- Only access publicly available information
- Do not attempt to bypass privacy settings
- Do not create fake accounts for access
- Document all sources for transparency
