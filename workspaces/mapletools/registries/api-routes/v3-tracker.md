# V3 Tracker Routes

**Base:** `/api/v3/tracker/`
**Auth:** All endpoints require authentication
**Count:** 46 endpoints

---

## Task Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/tasks/definitions` | Get all task definitions |
| GET | `/tasks/by-characters` | Get tasks grouped by character |
| GET | `/tasks` | Get tasks with completion status (filter: characterId, periodDate, resetType) |
| GET | `/tasks/custom` | Get user's custom tasks |
| GET | `/tasks/:taskDefinitionId/characters` | Get which characters have a task enabled |
| POST | `/tasks/:taskDefinitionId/complete` | Mark task complete |
| DELETE | `/tasks/:taskDefinitionId/complete` | Remove task completion |
| POST | `/tasks/bulk-complete` | Bulk complete multiple tasks |
| POST | `/tasks/bulk-uncomplete` | Bulk uncomplete multiple tasks |
| PUT | `/tasks/settings` | Enable/disable tasks for character |
| PUT | `/tasks/sort-order` | Update task sort orders |
| PUT | `/tasks/settings/party-size` | Update preferred party size |
| POST | `/tasks/assign` | Bulk assign tasks to characters |
| POST | `/tasks/override` | Create temporary task override |
| DELETE | `/tasks/override` | Delete task override |

## Custom Tasks

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/tasks/custom` | Get custom tasks |
| POST | `/tasks/custom` | Create custom task |
| PATCH | `/tasks/custom/:taskId` | Update custom task |
| DELETE | `/tasks/custom/:taskId` | Delete custom task |

## Completions

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/completions/:completionId` | Update completion details |

## Boss Data

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/bosses` | Get boss difficulties for tracker |

## Boss Drops

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/drops` | Get boss drops (filter supported) |
| GET | `/drops/weeks` | Get recent weeks for dropdown |
| GET | `/drops/stats` | Get drop statistics |
| POST | `/drops` | Create drop record |
| PATCH | `/drops/:dropId` | Update drop record |
| DELETE | `/drops/:dropId` | Delete drop record |

## Settings

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/settings/difficulty-change-preference` | Get difficulty preference |
| PUT | `/settings/difficulty-change-preference` | Update difficulty preference |

## Templates

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/templates` | Get all templates |
| POST | `/templates/:templateId/apply` | Apply template to character |

## Task Presets

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/presets/tasks` | Get task presets |
| GET | `/presets/tasks/:presetId` | Get single preset |
| POST | `/presets/tasks` | Create preset |
| PATCH | `/presets/tasks/:presetId` | Update preset |
| DELETE | `/presets/tasks/:presetId` | Delete preset |
| POST | `/presets/tasks/:presetId/apply` | Apply preset to characters |

## Boss Presets

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/presets/bosses` | Get boss presets |
| GET | `/presets/bosses/:presetId` | Get single preset |
| POST | `/presets/bosses` | Create preset |
| PATCH | `/presets/bosses/:presetId` | Update preset |
| DELETE | `/presets/bosses/:presetId` | Delete preset |
| POST | `/presets/bosses/:presetId/apply` | Apply preset to characters |

## Recent Activity

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/characters/:characterId/recent` | Get recent completions for character |
| GET | `/recent` | Get recent completions across all characters |
