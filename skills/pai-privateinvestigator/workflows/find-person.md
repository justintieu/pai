# Find Person Workflow

---
name: find-person
description: Complete investigation workflow for locating individuals using public data
---

## Purpose

Systematically locate an individual using parallel searches across multiple data sources, then cross-reference and verify findings.

## Prerequisites

Gather all available starting information:
- Full name (including variations, maiden names, nicknames)
- Approximate age or birth year
- Last known location(s)
- Connection context (how you know them, when)
- Any other identifiers (employer, school, profession)

## Instructions

### Step 1: Information Gathering

Document everything known about the subject:

```markdown
## Subject Profile
- **Name:** [Full name and variations]
- **Age/DOB:** [Approximate]
- **Last Known Location:** [City, State]
- **Last Contact:** [When and context]
- **Known Employers:** [List]
- **Known Schools:** [List]
- **Known Associates:** [Family, friends, colleagues]
- **Other Identifiers:** [Profession, hobbies, unique details]
```

### Step 2: People Search Aggregators

Search these platforms in parallel:
- TruePeopleSearch.com
- Spokeo.com
- FastPeopleSearch.com
- WhitePages.com

For each result, note:
- Current address
- Phone numbers
- Email addresses
- Known relatives
- Previous addresses

### Step 3: Social Media Investigation

Execute the `social-media.md` workflow:
1. LinkedIn (most reliable for professionals)
2. Facebook
3. Instagram
4. Twitter/X
5. TikTok (for younger subjects)

Use X-ray searches:
```
site:linkedin.com "[name]" "[location]"
site:facebook.com "[name]" "[employer]"
```

### Step 4: Public Records Search

Execute the `public-records.md` workflow:
1. Property records (county assessor)
2. Voter registration (where public)
3. Court records (PACER, CourtListener)
4. Business registrations
5. Professional licenses

### Step 5: Reverse Lookups

For any discovered contact information, execute `reverse-lookup.md`:
- Phone numbers -> carrier, location, associated names
- Email addresses -> linked accounts
- Usernames -> cross-platform presence

### Step 6: Associate Network Mapping

If direct search yields limited results:
1. Identify known associates (family, colleagues)
2. Search their social connections
3. Look for tagged photos or mentions
4. Check mutual connections on LinkedIn

### Step 7: Verification

Execute `verify-identity.md` workflow:
1. Cross-reference all findings
2. Check timeline consistency
3. Verify photo matches
4. Assign confidence score

### Step 8: Report Generation

Compile findings into structured report:

```markdown
## Investigation Report: [Subject Name]

### Summary
[Brief overview of findings and confidence level]

### Verified Information
| Data Point | Value | Source | Confidence |
|------------|-------|--------|------------|
| Current Address | ... | ... | HIGH/MEDIUM/LOW |
| Phone | ... | ... | ... |
| Email | ... | ... | ... |

### Social Media Presence
[List of verified accounts with URLs]

### Timeline
[Chronological summary of verified life events]

### Confidence Assessment
- Overall Confidence: [HIGH/MEDIUM/LOW/UNCONFIRMED]
- Reasoning: [Why this confidence level]

### Recommended Next Steps
[Any additional verification needed]
```

## Handling Common Issues

### Common Name
- Add middle name or initial to searches
- Focus on location-specific searches
- Use employer/school as differentiator
- Cross-reference with known associates

### No Results
- Try nickname variations
- Search maiden name (if applicable)
- Expand geographic search
- Check archived/historical data
- Search through known associates

### Multiple Matches
- Apply verification workflow to each
- Score each candidate
- Document distinguishing factors
- May need additional input from requester

## Output

Provide a complete investigation report with:
1. All verified contact information
2. Social media accounts
3. Confidence scoring for each data point
4. Overall assessment
5. Any recommended follow-up actions
