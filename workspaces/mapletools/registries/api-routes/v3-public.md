# V3 Public Routes

Public endpoints that don't require authentication.

---

## Boss Routes (`/api/v3/bosses/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/meta/version` | Get boss data version |
| GET | `/` | Get all bosses with difficulties |
| GET | `/liberation/destiny` | Get Destiny Liberation bosses |
| GET | `/liberation/genesis` | Get Genesis Liberation bosses |
| GET | `/liberation/destiny2` | Get Destiny 2 Liberation bosses |
| GET | `/drops/count` | Get total boss drops count |
| GET | `/:slug` | Get boss by slug |
| GET | `/:slug/:difficulty` | Get specific difficulty |

---

## Character Routes (`/api/v3/characters/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/:name` | Get character by name (NA default) |
| GET | `/:region/:name` | Get character by region and name |
| POST | `/bulk` | Get multiple characters (max 10) |

---

## User Character Routes (`/api/v3/user/characters/`)

**Auth:** Required

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all saved characters |
| GET | `/main` | Get main character |
| GET | `/:id` | Get character by ID |
| POST | `/` | Create saved character |
| PATCH | `/:id` | Update character |
| DELETE | `/:id` | Delete character (soft) |
| PUT | `/:id/main` | Set as main character |

---

## Public User Routes (`/api/v3/users/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/:username` | Get public profile |
| GET | `/:username/characters` | Get public characters |

---

## Server Routes (`/api/v3/servers/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/maintenance` | Get maintenance status |
| GET | `/regions` | Get all regions with worlds |
| GET | `/status` | Get server status |
| GET | `/channels/:region/:world` | Get world channels |
| GET | `/history/:world/:channel` | Get channel history |
| GET | `/ping/:region/:world` | Get ping stats |
| GET | `/login/:region` | Get login server status |

---

## Items Routes (`/api/v3/items/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all items |

---

## Legacy Routes (`/api/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/rate-limit-status` | Get rate limit config |
| GET | `/tools/blacklist-status` | Get blacklist cache status |
| POST | `/tools/refresh-blacklist` | Refresh blacklist cache |
| GET | `/character/:region/:characterName` | Get character (legacy) |
| GET | `/character/:characterName` | Get character NA (legacy) |
| POST | `/tools/ign-check` | Bulk check deletion risk |
