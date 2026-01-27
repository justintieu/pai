# Calendar Sources

Configured calendars for PAI schedule visibility.

## Configured Sources

| Name | Type | Access | Notes |
|------|------|--------|-------|
| _Example: Work_ | _Google_ | _gcalcli_ | _Primary work calendar_ |
| _Example: Personal_ | _Google_ | _gcalcli_ | _Personal appointments_ |
| _Example: Team Shared_ | _ICS URL_ | _Read-only_ | _[URL placeholder]_ |

**Note:** Replace the example rows above with your actual calendars.

## Access Methods

### Google Calendars (gcalcli)

Full read/write access via OAuth2 authentication.

**Setup:**
```bash
# First-time setup - opens browser for OAuth
gcalcli init

# Verify authentication
gcalcli list
```

**Example query:**
```bash
gcalcli --calendar="Work" agenda "today" "+2 weeks" --details=all --tsv
```

### ICS URL Subscriptions (Read-only)

Subscribe to external calendars via ICS URLs (team calendars, holidays, shared schedules).

**Example query:**
```bash
icalendar-events-cli \
  --calendar.url "https://calendar.example.com/feed.ics" \
  --filter.start-date "$(date -Iseconds)" \
  --filter.end-date "$(date -d '+14 days' -Iseconds)" \
  --output.format json
```

## Adding Your Calendars

### Step 1: List Your Google Calendars

```bash
gcalcli list
```

This shows all calendars associated with your Google account.

### Step 2: Add Entries Above

For each calendar you want PAI to see:

| Field | Google Calendar | ICS URL |
|-------|-----------------|---------|
| Name | Calendar name from gcalcli list | Descriptive name |
| Type | Google | ICS URL |
| Access | gcalcli (Read/Write) | Read-only |
| Notes | Primary/secondary purpose | URL and update frequency |

### Step 3: Test Access

```bash
# Test Google Calendar access
gcalcli --calendar="Your Calendar Name" agenda "today" "+7 days"

# Test ICS URL access
icalendar-events-cli --calendar.url "your-url" --output.format json
```

## Tips

- Include ALL calendars for complete conflict detection (work + personal + shared)
- ICS URLs work for iCloud, Outlook, shared team calendars, and public calendars
- For iCloud: convert `webcal://` URLs to `https://`
