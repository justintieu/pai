# Verify Identity Workflow

---
name: verify-identity
description: Confirm correct person when multiple candidates exist
---

## Purpose

When searches return multiple potential matches or you need to confirm you have the right person, use this systematic verification process to establish confidence.

## Instructions

### Step 1: Establish Verification Criteria

Create a comparison framework using known facts:

```markdown
## Verification Criteria for [Subject Name]

### Known Facts (Starting Point)
| Identifier | Value | Source |
|------------|-------|--------|
| Full Name | ... | Requester |
| Approximate Age | ... | Requester |
| Last Known Location | ... | Requester |
| Employer (when known) | ... | Requester |
| Education | ... | Requester |
| Family Members | ... | Requester |
| Other Unique Details | ... | Requester |
```

### Step 2: Timeline Consistency Check

Validate that life events align logically:

**Education Timeline:**
- High school graduation ~ age 18
- College graduation ~ age 22
- Graduate degrees ~ age 24-30

**Career Progression:**
- Entry level positions after education
- Logical job progression
- Geographic moves make sense

**Age Verification:**
- Current age matches graduation years
- Employment history fits timeline
- Family relationships are age-appropriate

**Red Flags:**
- Graduation before plausible age
- Jobs overlapping impossibly
- Location in two places simultaneously

### Step 3: Family/Associate Verification

Cross-reference through connections:

1. Check if known family members appear in candidate's network
2. Verify mutual professional connections
3. Look for tagged photos with known associates
4. Check if relatives' information corroborates

### Step 4: Photo Verification

Compare images across sources:

**Check for:**
- Same person in different photos
- Consistent aging across time
- Matching physical characteristics
- Background/context clues

**Methods:**
- Visual comparison
- Reverse image search
- Check metadata for location/date

### Step 5: Cross-Source Verification

Confirm data appears in multiple independent sources:

**Truly Independent Sources:**
- Government records (property, court, voter)
- Professional licensing boards
- News articles or publications
- Social media (different platforms)

**Not Independent (shared databases):**
- Multiple people-search sites (often same backend)
- Aggregators pulling from same source

**Verification Matrix:**
| Data Point | Source 1 | Source 2 | Source 3 | Match? |
|------------|----------|----------|----------|--------|
| Name | ... | ... | ... | Yes/No |
| Address | ... | ... | ... | Yes/No |
| Age/DOB | ... | ... | ... | Yes/No |
| Employer | ... | ... | ... | Yes/No |

### Step 6: Common Name Disambiguation

Special handling for frequently occurring names:

**Additional Differentiators:**
- Middle name or initial
- Jr./Sr./III designation
- Unique profession
- Specific employer
- Education institution
- Geographic specificity
- Family member names

**Scoring Multiple Candidates:**

| Candidate | Name Match | Age Match | Location | Employer | Score |
|-----------|------------|-----------|----------|----------|-------|
| Person A | Full | +/- 2 yrs | Current | Confirmed | 4/4 |
| Person B | Full | +/- 5 yrs | Previous | Unknown | 2/4 |
| Person C | Partial | Unknown | Near | No | 1/4 |

### Step 7: Calculate Confidence Score

**HIGH Confidence:**
- 3+ unique identifiers match from independent sources
- Timeline is consistent
- Photos match across sources
- No conflicting information
- **Action:** Safe to proceed

**MEDIUM Confidence:**
- 2 identifiers matching across sources
- Minor discrepancies explained
- Some verification gaps
- **Action:** Proceed with caution, note uncertainties

**LOW Confidence:**
- Single source only
- Limited verification possible
- Some conflicting information
- **Action:** Requires additional verification before use

**UNCONFIRMED:**
- Conflicting information across sources
- Cannot reconcile discrepancies
- Multiple equally-likely candidates
- **Action:** Do not act; need additional investigation

### Step 8: Generate Verification Report

```markdown
## Identity Verification Report

### Subject
[Name being verified]

### Verification Request
[Context - why verification was needed]

### Candidates Evaluated
[Number of potential matches considered]

### Winning Candidate

**Confidence Level:** HIGH / MEDIUM / LOW / UNCONFIRMED

**Verified Information:**
| Data Point | Value | Verification Source |
|------------|-------|---------------------|
| Full Name | ... | [Source] |
| Current Address | ... | [Source] |
| Age/DOB | ... | [Source] |
| Current Employer | ... | [Source] |

### Verification Evidence

**Timeline Analysis:**
[Summary of timeline check]

**Cross-Source Confirmation:**
[What matched across independent sources]

**Photo Verification:**
[Results of image comparison]

**Family/Associate Check:**
[Connections verified]

### Discrepancies or Gaps
[Any unresolved issues]

### Recommendation
[Final assessment and suggested next steps]
```

## Special Cases

### Married/Changed Names

- Search both current and maiden name
- Check marriage records if available
- Look for hyphenated variations
- Social media may show name history

### Deceased Subjects

- Check SSDI (Social Security Death Index)
- Search obituary databases
- Find A Grave for burial information
- Note: Records may be incomplete for recent deaths

### Privacy-Conscious Individuals

- May have minimal online presence
- Focus on required records (property, court)
- Professional licenses often required
- Business registrations if applicable

### Multiple Remaining Candidates

If verification cannot narrow to one person:
1. Document each candidate's evidence
2. Assign confidence to each
3. Note distinguishing factors
4. Request additional information from requester
5. May need to present multiple options

## Output

Provide a complete verification report with:
1. Confidence level clearly stated
2. All verified information with sources
3. Evidence supporting the determination
4. Any gaps or discrepancies noted
5. Clear recommendation for next steps
