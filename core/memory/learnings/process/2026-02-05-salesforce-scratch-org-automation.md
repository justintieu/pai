---
date: 2026-02-05
domain: process
tags:
  - salesforce
  - automation
  - scratch-org
  - devops
confidence: HIGH
---

# Salesforce Scratch Org Automation for Provus

Automation script for rotating Salesforce scratch orgs before expiration. Designed for the provus-ai-assistant project.

## Workflow Steps

1. **Create org from quoting repo** - Uses existing `build/create-scratch-org.sh` script
2. **Deploy connected app** - From `provus-ai-assistant/salesforce/force-app/main/default/connectedApps` (ProvusAssistantApp)
3. **Verify permission sets** - With retry logic for: ProvusAdmin, CiUserPermissions, CollaborationUser, AllFeaturesOn
4. **Send Teams notification** - With credentials and permission set status

## Configuration

| Setting | Value |
|---------|-------|
| Alias | `dev` |
| Admin Email | `justin@provus.ai` |
| Duration | 30 days |
| MIN_DAYS | 2 (rotate when ≤2 days left) |

## Script Location

Target: `provus-ai-assistant/scripts/org-automation/rotate-scratch-org.sh`

## Key Paths

- Quoting repo: `~/github/quoting`
- Provus AI Assistant: `~/github/provus-ai-assistant`
- Existing create script: `quoting/build/create-scratch-org.sh`
- Connected app: `provus-ai-assistant/salesforce/force-app/main/default/connectedApps/ProvusAssistantApp.connectedApp-meta.xml`

## Known Issues

- Permission set assignment can fail silently (line 125 in create-scratch-org.sh uses `> output 2>/dev/null || true`)
- Script includes verification and retry logic to address this

## Scheduling

Cron job at 9am daily:
```
0 9 * * * TEAMS_WEBHOOK_URL="..." /path/to/rotate-scratch-org.sh >> ~/scratch-org-rotation.log 2>&1
```

---
*Captured: 2026-02-05*
